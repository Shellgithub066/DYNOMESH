import { Link, Navigate } from "react-router-dom";
import { ListingCard } from "../components/ListingCard";
import { membershipLabel } from "./MembershipPage";
import { useAuthStore } from "../store/authStore";
import { useMarketplaceStore } from "../store/marketplaceStore";

export function DashboardPage() {
  const user = useAuthStore((s) => s.currentUser);
  const listings = useMarketplaceStore((s) => s.listings);
  const orders = useMarketplaceStore((s) => s.orders);

  if (!user) return <Navigate to="/login" replace />;

  const myListings = listings.filter((l) => l.ownerId === user.id);
  const myPurchases = orders.filter((o) => o.buyerId === user.id);
  const githubListings = myListings.filter((l) => l.githubRepoUrl);

  return (
    <div>
      <h1 className="page-title">Dashboard</h1>
      <p className="page-sub">
        Welcome, {user.displayName} (@{user.username}) ·{" "}
        <span className="badge">{membershipLabel(user.membershipPlan)}</span>
      </p>

      <div className="dash-meta">
        <p>
          GitHub:{" "}
          {user.githubConnected && user.githubUsername ? (
            <a
              href={`https://github.com/${user.githubUsername}`}
              target="_blank"
              rel="noreferrer"
            >
              @{user.githubUsername}
            </a>
          ) : (
            <span className="muted">Not connected</span>
          )}{" "}
          · <Link to="/settings">Settings</Link> ·{" "}
          <Link to="/membership">Membership</Link>
        </p>
      </div>

      <div className="dash-actions">
        <Link to="/upload" className="btn btn-primary">
          Upload new asset
        </Link>
        <Link to="/publish/github" className="btn">
          Publish from GitHub
        </Link>
        <Link to="/cart" className="btn">
          View cart
        </Link>
      </div>

      <h2 className="section-title">
        Your listings ({myListings.length})
        {githubListings.length > 0 && (
          <span className="muted"> ({githubListings.length} from GitHub)</span>
        )}
      </h2>
      {myListings.length === 0 ? (
        <p className="page-sub">
          No listings yet. Upload a pack or{" "}
          <Link to="/publish/github">publish a GitHub repo</Link>.
        </p>
      ) : (
        <div className="card-grid">
          {myListings.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}

      <h2 className="section-title" style={{ marginTop: "2rem" }}>
        Purchase history ({myPurchases.length})
      </h2>
      {myPurchases.length === 0 ? (
        <p className="page-sub">No orders yet.</p>
      ) : (
        <ul className="order-list">
          {myPurchases.map((o) => (
            <li key={o.id}>
              Order {o.id} · ${o.totalUsd.toFixed(2)}
              {o.status === "paid" && o.cardLast4
                ? ` · ${o.cardBrand ?? "Card"} ···· ${o.cardLast4}`
                : ""}{" "}
              · {new Date(o.createdAt).toLocaleString()} · {o.listingIds.length}{" "}
              item(s)
            </li>
          ))}
        </ul>
      )}

      <style>{`
        .dash-actions { display: flex; gap: 0.5rem; margin-bottom: 1.5rem; flex-wrap: wrap; }
        .dash-meta { margin-bottom: 1rem; color: var(--text-muted); font-size: 0.92rem; }
        .section-title { font-size: 1.15rem; }
        .order-list { padding-left: 1.2rem; color: var(--text-muted); }
        .muted { color: var(--text-muted); font-weight: normal; }
      `}</style>
    </div>
  );
}
