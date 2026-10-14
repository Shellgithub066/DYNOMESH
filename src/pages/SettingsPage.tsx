import { FormEvent, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { membershipLabel } from "./MembershipPage";
import { useAuthStore } from "../store/authStore";

export function SettingsPage() {
  const user = useAuthStore((s) => s.currentUser);
  const connectGitHub = useAuthStore((s) => s.connectGitHub);
  const disconnectGitHub = useAuthStore((s) => s.disconnectGitHub);
  const [githubInput, setGithubInput] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  if (!user) return <Navigate to="/login" replace />;

  async function onConnect(e: FormEvent) {
    e.preventDefault();
    setErr("");
    setMsg("");
    setBusy(true);
    const res = await connectGitHub(githubInput);
    setBusy(false);
    if (!res.ok) {
      setErr(res.error);
      return;
    }
    setMsg(`Linked GitHub @${githubInput.trim()}.`);
    setGithubInput("");
  }

  return (
    <div className="settings">
      <h1 className="page-title">Account settings</h1>
      <p className="page-sub">
        Plan: <strong>{membershipLabel(user.membershipPlan)}</strong>.{" "}
        <Link to="/membership">Change plan</Link>
      </p>

      <section className="settings-block">
        <h2 className="section-title">GitHub</h2>
        {user.githubConnected && user.githubUsername ? (
          <div>
            <p>
              Connected as{" "}
              <a
                href={`https://github.com/${user.githubUsername}`}
                target="_blank"
                rel="noreferrer"
              >
                @{user.githubUsername}
              </a>
            </p>
            <button type="button" className="btn" onClick={disconnectGitHub}>
              Disconnect
            </button>
          </div>
        ) : (
          <form className="form-stack" onSubmit={(e) => void onConnect(e)}>
            <p className="page-sub">
              Enter your public GitHub username to link your seller profile
              (uses the public GitHub API; no OAuth token in this demo).
            </p>
            <div>
              <label className="label">GitHub username</label>
              <input
                className="input"
                placeholder="octocat"
                value={githubInput}
                onChange={(e) => setGithubInput(e.target.value)}
                required
              />
            </div>
            {err && <p className="error-msg">{err}</p>}
            {msg && <p style={{ color: "var(--accent)" }}>{msg}</p>}
            <button type="submit" className="btn btn-primary" disabled={busy}>
              Connect GitHub
            </button>
          </form>
        )}
      </section>

      <p className="page-sub">
        <Link to="/dashboard">Dashboard</Link> ·{" "}
        <Link to="/publish/github">Publish from GitHub</Link>
      </p>

      <style>{`
        .settings { max-width: 520px; }
        .settings-block {
          margin: 1.5rem 0;
          padding: 1.25rem;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
        }
        .section-title { font-size: 1.1rem; margin-bottom: 0.75rem; }
      `}</style>
    </div>
  );
}
