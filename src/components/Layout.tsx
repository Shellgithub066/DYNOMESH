import { Link, Outlet } from "react-router-dom";
import { BRAND } from "../config/brand";
import { BrandMark } from "./BrandMark";
import { useAuthStore } from "../store/authStore";
import { useMarketplaceStore } from "../store/marketplaceStore";

export function Layout() {
  const user = useAuthStore((s) => s.currentUser);
  const logout = useAuthStore((s) => s.logout);
  const cartCount = useMarketplaceStore((s) => s.cart.length);

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="container header-inner">
          <Link to="/" className="brand">
            <span className="brand-icon">
              <BrandMark size={30} />
            </span>
            <span className="brand-text">
              DYNO<span className="brand-accent">MESH</span>
              <small>{BRAND.year} · PHYSICS / ROBOTICS</small>
            </span>
          </Link>
          <nav className="nav-links">
            <Link to="/explore?kind=physics">Physics</Link>
            <Link to="/explore?kind=urdf">URDF</Link>
            <Link to="/explore?kind=simulation">Sim scenes</Link>
            <Link to="/explore?kind=controller">Control</Link>
            <Link to="/explore">All assets</Link>
          </nav>
          <div className="header-actions">
            <Link to="/cart" className="btn btn-ghost">
              Cart ({cartCount})
            </Link>
            {user ? (
              <>
                <Link to="/dashboard" className="btn">
                  @{user.username}
                </Link>
                <Link to="/publish/github" className="btn">
                  GitHub
                </Link>
                <Link to="/upload" className="btn btn-primary">
                  Upload
                </Link>
                <button type="button" className="btn" onClick={logout}>
                  Log out
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn">
                  Log in
                </Link>
                <Link to="/register" className="btn btn-primary">
                  Join lab
                </Link>
              </>
            )}
          </div>
        </div>
      </header>
      <main className="site-main container">
        <Outlet />
      </main>
      <footer className="site-footer">
        <div className="container footer-inner">
          <BrandMark size={22} />
          <p>
            {BRAND.name}: robot dynamics, contact models, URDF kinematics, and
            simulation-ready control interfaces for labs and sim engineers.
          </p>
        </div>
      </footer>
      <style>{`
        .app-shell { min-height: 100vh; display: flex; flex-direction: column; }
        .site-header {
          border-bottom: 1px solid var(--border);
          background: rgba(10, 16, 32, 0.92);
          backdrop-filter: blur(8px);
          position: sticky; top: 0; z-index: 10;
        }
        .header-inner {
          display: flex; align-items: center; gap: 1rem;
          padding: 0.75rem 0; flex-wrap: wrap;
        }
        .brand {
          display: flex; align-items: center; gap: 0.55rem;
          color: var(--text); font-size: 1rem;
        }
        .brand-text {
          display: flex; flex-direction: column;
          font-family: var(--mono);
          font-weight: 600;
          letter-spacing: 0.06em;
          line-height: 1.1;
        }
        .brand-text small {
          font-size: 0.58rem;
          color: var(--text-muted);
          font-weight: 400;
          letter-spacing: 0.12em;
        }
        .brand-accent { color: var(--accent); }
        .brand-icon { color: var(--accent2); display: flex; }
        .nav-links { display: flex; gap: 0.75rem; flex: 1; flex-wrap: wrap; }
        .nav-links a {
          color: var(--text-muted);
          font-size: 0.78rem;
          font-family: var(--mono);
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        .nav-links a:hover { color: var(--accent); }
        .header-actions { display: flex; gap: 0.5rem; flex-wrap: wrap; }
        .site-main { flex: 1; padding: 2rem 0 3rem; }
        .site-footer {
          border-top: 1px solid var(--border);
          padding: 1.25rem 0;
          color: var(--text-muted);
          font-size: 0.85rem;
          background: var(--bg-elevated);
        }
        .footer-inner {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }
        .footer-inner p { margin: 0; max-width: 640px; line-height: 1.5; }
      `}</style>
    </div>
  );
}
