import { Link } from "react-router-dom";
import { BRAND } from "../config/brand";
import { ListingCard } from "../components/ListingCard";
import { useMarketplaceStore } from "../store/marketplaceStore";

const PILLARS = [
  {
    code: "RB-01",
    title: "Rigid-body dynamics",
    text: "Mass/inertia tensors, joint limits, and integrator-stable timestep packs for MuJoCo, Bullet, and Isaac.",
  },
  {
    code: "CT-02",
    title: "Contact & friction",
    text: "Coulomb models, soft contacts, foot-ground profiles, and validated collision meshes for legged systems.",
  },
  {
    code: "KF-03",
    title: "Kinematics & URDF",
    text: "Calibrated link trees, mimic joints, transmission tags, and sim-ready mesh decimation.",
  },
  {
    code: "CTL-04",
    title: "Control & sim hooks",
    text: "Torque maps, PD gains, ROS2 bridges, and scene graphs wired for repeatable physics replay.",
  },
];

export function HomePage() {
  const listings = useMarketplaceStore((s) => s.listings);
  const physics = listings.filter((l) => l.kind === "physics" || l.featured);
  const featured = physics.filter((l) => l.featured).slice(0, 3);
  const recentPhysics = listings
    .filter((l) => l.kind === "physics" || l.kind === "urdf")
    .slice(0, 6);

  return (
    <div className="home">
      <section className="hero">
        <p className="hero-kicker">{BRAND.kicker}</p>
        <h1 className="hero-title">
          Trade dynamics, contacts, and kinematics like production data
        </h1>
        <p className="hero-sub">
          {BRAND.name} is built for teams shipping believable motion: upload inertia
          bundles, URDF chains, friction tables, and controller interfaces. Every
          listing is tagged for simulators and reproducible physics replay.
        </p>
        <div className="hero-metrics">
          <div>
            <span className="metric-val">{listings.length}+</span>
            <span className="metric-lbl">assets indexed</span>
          </div>
          <div>
            <span className="metric-val">5</span>
            <span className="metric-lbl">physics asset classes</span>
          </div>
          <div>
            <span className="metric-val">URDF</span>
            <span className="metric-lbl">native kinematics</span>
          </div>
        </div>
        <div className="hero-cta">
          <Link to="/explore?kind=physics" className="btn btn-primary">
            Browse physics
          </Link>
          <Link to="/explore?kind=urdf" className="btn">
            URDF models
          </Link>
          <Link to="/register" className="btn">
            Join lab network
          </Link>
        </div>
      </section>

      <section className="pillars">
        <h2 className="section-title">Core physics stack</h2>
        <div className="pillar-grid">
          {PILLARS.map((p) => (
            <article key={p.code} className="pillar-card">
              <span className="pillar-code">{p.code}</span>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="section-title">Featured dynamics packs</h2>
        <div className="card-grid">
          {(featured.length ? featured : recentPhysics.slice(0, 3)).map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      </section>

      <section className="recent">
        <h2 className="section-title">Latest URDF &amp; physics uploads</h2>
        <div className="card-grid">
          {recentPhysics.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      </section>

      <style>{`
        .hero {
          padding: 2rem 0 2.5rem;
          margin-bottom: 2rem;
          border-bottom: 1px solid var(--border);
        }
        .hero-kicker {
          color: var(--accent);
          font-family: var(--mono);
          font-size: 0.75rem;
          margin: 0 0 0.75rem;
          letter-spacing: 0.14em;
        }
        .hero-title {
          font-size: clamp(1.85rem, 4vw, 2.85rem);
          margin: 0 0 1rem;
          max-width: 780px;
          line-height: 1.15;
        }
        .hero-sub {
          color: var(--text-muted);
          max-width: 680px;
          margin: 0 0 1.25rem;
        }
        .hero-metrics {
          display: flex;
          flex-wrap: wrap;
          gap: 1.5rem;
          margin-bottom: 1.5rem;
          font-family: var(--mono);
        }
        .hero-metrics div { display: flex; flex-direction: column; gap: 0.15rem; }
        .metric-val { color: var(--accent2); font-size: 1.25rem; font-weight: 600; }
        .metric-lbl { font-size: 0.72rem; color: var(--text-muted); text-transform: uppercase; }
        .hero-cta { display: flex; gap: 0.75rem; flex-wrap: wrap; }
        .section-title {
          font-size: 1.15rem;
          margin-bottom: 1rem;
          font-family: var(--mono);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--accent2);
        }
        .pillar-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1rem;
          margin-bottom: 2.5rem;
        }
        .pillar-card {
          padding: 1.1rem;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          box-shadow: inset 0 1px 0 rgba(45, 212, 191, 0.06);
        }
        .pillar-card h3 { margin: 0.35rem 0; font-size: 1.05rem; }
        .pillar-card p { margin: 0; font-size: 0.88rem; color: var(--text-muted); }
        .pillar-code {
          font-family: var(--mono);
          font-size: 0.7rem;
          color: var(--accent);
        }
        .recent { margin-top: 2rem; }
      `}</style>
    </div>
  );
}
