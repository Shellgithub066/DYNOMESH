import { FormEvent, useState, type ReactNode } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { MembershipPlan } from "../types";
import { BRAND } from "../config/brand";
import { useAuthStore } from "../store/authStore";

function GitHubAuthBlock({ onSuccess }: { onSuccess: () => void }) {
  const loginWithGitHub = useAuthStore((s) => s.loginWithGitHub);
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onGitHub(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await loginWithGitHub(username);
    setLoading(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    onSuccess();
  }

  return (
    <div className="github-auth">
      <p className="divider-label">Or continue with GitHub</p>
      <form className="form-stack" onSubmit={(e) => void onGitHub(e)}>
        <div>
          <label className="label">GitHub username</label>
          <input
            className="input"
            placeholder="your-github-handle"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-msg">{error}</p>}
        <button type="submit" className="btn github-btn" disabled={loading}>
          {loading ? "Checking GitHub..." : "Sign in with GitHub"}
        </button>
      </form>
      <style>{`
        .github-auth { margin-top: 1.25rem; padding-top: 1.25rem; border-top: 1px solid var(--border); }
        .divider-label { color: var(--text-muted); font-size: 0.85rem; margin: 0 0 0.75rem; }
        .github-btn { width: 100%; background: #24292f; color: #fff; border: 1px solid #444; }
        .github-btn:hover { filter: brightness(1.08); }
      `}</style>
    </div>
  );
}

export function LoginPage() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const res = login({ email, password });
    if (!res.ok) {
      setError(res.error);
      return;
    }
    navigate("/dashboard");
  }

  return (
    <AuthShell title="Log in" alternate={{ text: "Sign up", to: "/register" }}>
      <form className="form-stack" onSubmit={onSubmit}>
        <div>
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Password</label>
          <input
            className="input"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        {error && <p className="error-msg">{error}</p>}
        <button type="submit" className="btn btn-primary">
          Log in
        </button>
      </form>
      <GitHubAuthBlock onSuccess={() => navigate("/dashboard")} />
    </AuthShell>
  );
}

export function RegisterPage() {
  const register = useAuthStore((s) => s.register);
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [membershipPlan, setMembershipPlan] = useState<MembershipPlan>("free");
  const [error, setError] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const res = register({
      username,
      email,
      password,
      displayName,
      membershipPlan,
    });
    if (!res.ok) {
      setError(res.error);
      return;
    }
    navigate("/dashboard");
  }

  return (
    <AuthShell title="Create account" alternate={{ text: "Log in", to: "/login" }}>
      <form className="form-stack" onSubmit={onSubmit}>
        <div>
          <label className="label">Username</label>
          <input
            className="input"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Display name</label>
          <input
            className="input"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Password</label>
          <input
            className="input"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Membership</label>
          <select
            className="input"
            value={membershipPlan}
            onChange={(e) => setMembershipPlan(e.target.value as MembershipPlan)}
          >
            <option value="free">Free: browse, buy, up to 3 uploads</option>
            <option value="pro">Pro Seller: GitHub publish, unlimited uploads</option>
            <option value="lab">Lab: teams and featured slots</option>
          </select>
        </div>
        {error && <p className="error-msg">{error}</p>}
        <button type="submit" className="btn btn-primary">
          Sign up &amp; join {BRAND.shortName}
        </button>
      </form>
      <GitHubAuthBlock onSuccess={() => navigate("/dashboard")} />
      <p className="fine-print">
        GitHub sign-up creates a Free account with GitHub linked. Upgrade anytime
        on the <Link to="/membership">membership</Link> page.
      </p>
    </AuthShell>
  );
}

function AuthShell({
  title,
  alternate,
  children,
}: {
  title: string;
  alternate: { text: string; to: string };
  children: ReactNode;
}) {
  return (
    <div className="auth-box">
      <h1 className="page-title">{title}</h1>
      <p className="page-sub">
        {BRAND.name} lab account. Buy dynamics packs, upload URDF, or publish from GitHub.
      </p>
      {children}
      <p style={{ marginTop: "1rem", color: "var(--text-muted)" }}>
        Or <Link to={alternate.to}>{alternate.text}</Link>
      </p>
      <style>{`
        .auth-box {
          max-width: 420px;
          margin: 0 auto;
          padding: 2rem;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
        }
        .fine-print { font-size: 0.82rem; color: var(--text-muted); margin-top: 0.75rem; }
      `}</style>
    </div>
  );
}
