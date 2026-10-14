import { FormEvent, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useMarketplaceStore } from "../store/marketplaceStore";
import type { AssetKind, LicenseType } from "../types";

const FREE_UPLOAD_LIMIT = 3;

export function UploadPage() {
  const user = useAuthStore((s) => s.currentUser);
  const addListing = useMarketplaceStore((s) => s.addListing);
  const myCount = useMarketplaceStore(
    (s) => s.listings.filter((l) => l.ownerId === user?.id).length,
  );
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [kind, setKind] = useState<AssetKind>("physics");
  const [priceUsd, setPriceUsd] = useState(0);
  const [license, setLicense] = useState<LicenseType>("MIT");
  const [tags, setTags] = useState("");
  const [simulators, setSimulators] = useState("MuJoCo, Isaac Sim");
  const [version, setVersion] = useState("1.0.0");
  const [fileSizeMb, setFileSizeMb] = useState(10);

  if (!user) return <Navigate to="/login" replace />;

  const atFreeLimit =
    user.membershipPlan === "free" && myCount >= FREE_UPLOAD_LIMIT;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (atFreeLimit) return;
    const listing = addListing(user.id, user.username, {
      title,
      description,
      kind,
      priceUsd,
      license,
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      simulatorTags: simulators.split(",").map((t) => t.trim()).filter(Boolean),
      version,
      fileSizeMb,
    });
    navigate(`/listing/${listing.slug}`);
  }

  return (
    <div className="upload-form-wrap">
      <h1 className="page-title">Upload asset</h1>
      <p className="page-sub">
        Publish robot physics, URDF, controllers, or datasets to the marketplace.
        {user.membershipPlan === "free" && (
          <> Free plan: {myCount}/{FREE_UPLOAD_LIMIT} manual uploads used.</>
        )}
      </p>
      {atFreeLimit && (
        <p className="error-msg">
          Free plan upload limit reached.{" "}
          <Link to="/membership">Upgrade to Pro</Link> or{" "}
          <Link to="/publish/github">publish from GitHub</Link> (Pro required).
        </p>
      )}
      <form className="form-stack upload-form" onSubmit={onSubmit}>
        <div>
          <label className="label">Title</label>
          <input className="input" required value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea
            className="input"
            rows={5}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
        <div className="row-2">
          <div>
            <label className="label">Type</label>
            <select className="input" value={kind} onChange={(e) => setKind(e.target.value as AssetKind)}>
              <option value="physics">Physics</option>
              <option value="urdf">URDF</option>
              <option value="controller">Controller</option>
              <option value="simulation">Simulation</option>
              <option value="dataset">Dataset</option>
            </select>
          </div>
          <div>
            <label className="label">Price (USD, 0 = free)</label>
            <input
              className="input"
              type="number"
              min={0}
              value={priceUsd}
              onChange={(e) => setPriceUsd(Number(e.target.value))}
            />
          </div>
        </div>
        <div className="row-2">
          <div>
            <label className="label">License</label>
            <select
              className="input"
              value={license}
              onChange={(e) => setLicense(e.target.value as LicenseType)}
            >
              <option value="MIT">MIT</option>
              <option value="Apache-2.0">Apache-2.0</option>
              <option value="CC-BY-4.0">CC-BY-4.0</option>
              <option value="Commercial">Commercial</option>
            </select>
          </div>
          <div>
            <label className="label">Version</label>
            <input className="input" value={version} onChange={(e) => setVersion(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label">Tags (comma-separated)</label>
          <input className="input" value={tags} onChange={(e) => setTags(e.target.value)} />
        </div>
        <div>
          <label className="label">Simulators (comma-separated)</label>
          <input className="input" value={simulators} onChange={(e) => setSimulators(e.target.value)} />
        </div>
        <div>
          <label className="label">File size (MB)</label>
          <input
            className="input"
            type="number"
            min={1}
            value={fileSizeMb}
            onChange={(e) => setFileSizeMb(Number(e.target.value))}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={atFreeLimit}>
          Publish to marketplace
        </button>
      </form>
      <style>{`
        .upload-form-wrap { max-width: 640px; }
        .upload-form {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1.25rem;
        }
        .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
        @media (max-width: 600px) { .row-2 { grid-template-columns: 1fr; } }
      `}</style>
    </div>
  );
}
