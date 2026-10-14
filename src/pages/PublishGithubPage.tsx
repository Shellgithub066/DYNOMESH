import { FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import {
  fetchGitHubRepo,
  mapLicense,
  parseGitHubRepoUrl,
} from "../lib/github";
import type { AssetKind } from "../types";
import { BRAND } from "../config/brand";
import { useAuthStore } from "../store/authStore";
import { useMarketplaceStore } from "../store/marketplaceStore";

const KINDS: AssetKind[] = [
  "physics",
  "urdf",
  "controller",
  "simulation",
  "dataset",
];

export function PublishGithubPage() {
  const user = useAuthStore((s) => s.currentUser);
  const addListing = useMarketplaceStore((s) => s.addListing);
  const navigate = useNavigate();

  const [repoUrl, setRepoUrl] = useState("");
  const [kind, setKind] = useState<AssetKind>("urdf");
  const [priceUsd, setPriceUsd] = useState("0");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<{
    full_name: string;
    description: string | null;
    stargazers_count: number;
  } | null>(null);

  if (!user) return <Navigate to="/login" replace />;

  const canPublishGithub =
    user.membershipPlan === "pro" || user.membershipPlan === "lab";

  async function loadPreview() {
    setError("");
    const parsed = parseGitHubRepoUrl(repoUrl);
    if (!parsed) {
      setError("Use a URL like https://github.com/owner/repo or owner/repo");
      setPreview(null);
      return;
    }
    setLoading(true);
    try {
      const repo = await fetchGitHubRepo(parsed.owner, parsed.repo);
      setPreview({
        full_name: repo.full_name,
        description: repo.description,
        stargazers_count: repo.stargazers_count,
      });
    } catch (e) {
      setPreview(null);
      setError(e instanceof Error ? e.message : "Could not load repo.");
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canPublishGithub) {
      setError("Upgrade to Pro Seller or Lab to publish from GitHub.");
      return;
    }
    const parsed = parseGitHubRepoUrl(repoUrl);
    if (!parsed) {
      setError("Invalid GitHub repository URL.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const repo = await fetchGitHubRepo(parsed.owner, parsed.repo);
      if (
        user.githubConnected &&
        user.githubUsername &&
        repo.owner.login.toLowerCase() !== user.githubUsername.toLowerCase()
      ) {
        setError(
          `Connected GitHub is @${user.githubUsername}, but repo owner is @${repo.owner.login}. Publish your own repo or disconnect GitHub in settings.`,
        );
        setLoading(false);
        return;
      }
      const tagList = tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const topicTags = repo.topics?.slice(0, 5) ?? [];
      const listing = addListing(user.id, user.username, {
        title: repo.full_name.split("/")[1] ?? repo.full_name,
        description:
          repo.description ||
          `Open-source robotics project published from GitHub: ${repo.full_name}`,
        kind,
        tags: [...new Set([...tagList, ...topicTags, "github"])],
        priceUsd: Number(priceUsd) || 0,
        license: mapLicense(repo.license?.spdx_id),
        version: repo.default_branch,
        fileSizeMb: Math.max(1, Math.round(repo.size / 1024)),
        simulatorTags: ["GitHub", "ROS2"],
        githubRepoUrl: repo.html_url,
        githubDefaultBranch: repo.default_branch,
        githubStars: repo.stargazers_count,
      });
      navigate(`/listing/${listing.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Publish failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="publish-github">
      <h1 className="page-title">Publish from GitHub</h1>
      <p className="page-sub">
        Link a public repository. {BRAND.shortName} pulls name, description, license, and
        stars from the GitHub API.{" "}
        {user.githubConnected ? (
          <>Connected as @{user.githubUsername}.</>
        ) : (
          <>
            <Link to="/settings">Connect GitHub</Link> to verify ownership.
          </>
        )}
      </p>

      {!canPublishGithub && (
        <p className="error-msg">
          GitHub publishing requires{" "}
          <Link to="/membership">Pro Seller or Lab</Link>. Free accounts can
          still use manual upload.
        </p>
      )}

      <form className="form-stack" onSubmit={onSubmit}>
        <div>
          <label className="label">Repository URL</label>
          <div className="row-inline">
            <input
              className="input"
              placeholder="https://github.com/org/my-robot-urdf"
              value={repoUrl}
              onChange={(e) => {
                setRepoUrl(e.target.value);
                setPreview(null);
              }}
              required
            />
            <button
              type="button"
              className="btn"
              disabled={loading || !repoUrl.trim()}
              onClick={() => void loadPreview()}
            >
              Preview
            </button>
          </div>
        </div>

        {preview && (
          <div className="preview-box">
            <strong>{preview.full_name}</strong>
            <p>{preview.description || "No description on GitHub."}</p>
            <span className="muted">★ {preview.stargazers_count} stars</span>
          </div>
        )}

        <div>
          <label className="label">Asset type</label>
          <select
            className="input"
            value={kind}
            onChange={(e) => setKind(e.target.value as AssetKind)}
          >
            {KINDS.map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Price (USD, 0 = free)</label>
          <input
            className="input"
            type="number"
            min={0}
            step={1}
            value={priceUsd}
            onChange={(e) => setPriceUsd(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Extra tags (comma-separated)</label>
          <input
            className="input"
            placeholder="mobile-manipulation, isaac"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>
        {error && <p className="error-msg">{error}</p>}
        <button
          type="submit"
          className="btn btn-primary"
          disabled={loading || !canPublishGithub}
        >
          {loading ? "Publishing..." : "Publish listing"}
        </button>
      </form>

      <style>{`
        .publish-github { max-width: 560px; }
        .row-inline { display: flex; gap: 0.5rem; }
        .row-inline .input { flex: 1; }
        .preview-box {
          padding: 1rem;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: var(--radius);
        }
        .preview-box p { color: var(--text-muted); margin: 0.35rem 0; }
      `}</style>
    </div>
  );
}
