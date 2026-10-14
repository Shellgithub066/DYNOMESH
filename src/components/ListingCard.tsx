import { Link } from "react-router-dom";
import type { Listing } from "../types";

function formatPrice(usd: number) {
  return usd === 0 ? "Free" : `$${usd.toFixed(0)}`;
}

export function ListingCard({ listing }: { listing: Listing }) {
  return (
    <article className="listing-card">
      <div className="listing-card-top">
        <span
          className={`badge badge-kind${listing.kind === "physics" ? " badge-physics" : ""}`}
        >
          {listing.kind}
        </span>
        {listing.featured && <span className="badge">featured</span>}
      </div>
      <Link to={`/listing/${listing.slug}`} className="listing-title">
        {listing.title}
      </Link>
      <p className="listing-desc">
        {listing.description.length > 120
          ? `${listing.description.slice(0, 120)}...`
          : listing.description}
      </p>
      <div className="listing-meta">
        <Link to={`/user/${listing.ownerUsername}`}>@{listing.ownerUsername}</Link>
        <span>v{listing.version}</span>
      </div>
      <div className="listing-tags">
        {listing.tags.slice(0, 4).map((t) => (
          <span key={t} className="badge">
            {t}
          </span>
        ))}
      </div>
      <div className="listing-stats">
        <span>{formatPrice(listing.priceUsd)}</span>
        <span>
          {listing.likes === 1 ? "1 like" : `${listing.likes} likes`}
        </span>
      </div>
      <style>{`
        .listing-card {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 1rem;
          display: flex; flex-direction: column; gap: 0.5rem;
          transition: border-color 0.15s;
        }
        .listing-card:hover { border-color: var(--accent); }
        .listing-card-top { display: flex; gap: 0.4rem; }
        .listing-title {
          color: var(--text);
          font-weight: 600;
          font-size: 1.05rem;
        }
        .listing-title:hover { color: var(--accent); }
        .listing-desc {
          margin: 0;
          font-size: 0.88rem;
          color: var(--text-muted);
          flex: 1;
        }
        .listing-meta {
          display: flex; justify-content: space-between;
          font-size: 0.82rem; color: var(--text-muted);
        }
        .listing-tags { display: flex; flex-wrap: wrap; gap: 0.35rem; }
        .listing-stats {
          display: flex; justify-content: space-between;
          font-size: 0.8rem; color: var(--text-muted);
          border-top: 1px solid var(--border);
          padding-top: 0.5rem;
          margin-top: 0.25rem;
        }
        .listing-stats span:first-child {
          color: var(--accent);
          font-weight: 600;
        }
      `}</style>
    </article>
  );
}
