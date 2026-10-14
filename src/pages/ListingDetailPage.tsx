import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useMarketplaceStore } from "../store/marketplaceStore";

export function ListingDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const listing = useMarketplaceStore((s) =>
    s.listings.find((l) => l.slug === slug),
  );
  const user = useAuthStore((s) => s.currentUser);
  const addToCart = useMarketplaceStore((s) => s.addToCart);
  const toggleLike = useMarketplaceStore((s) => s.toggleLike);
  const userHasLiked = useMarketplaceStore((s) => s.userHasLiked);
  const [likeError, setLikeError] = useState("");
  const [freeAccess, setFreeAccess] = useState(false);
  const navigate = useNavigate();

  if (!listing) {
    return (
      <div>
        <h1 className="page-title">Not found</h1>
        <Link to="/explore">Back to explore</Link>
      </div>
    );
  }

  const priceLabel = listing.priceUsd === 0 ? "Free" : `$${listing.priceUsd}`;
  const liked = userHasLiked(listing.id, user?.id);
  const isOwner = user?.id === listing.ownerId;
  const likeLabel =
    listing.likes === 1
      ? "1 like"
      : `${listing.likes.toLocaleString()} likes`;

  function onLikeClick() {
    setLikeError("");
    const res = toggleLike(listing!.id, user?.id);
    if (!res.ok) setLikeError(res.error);
  }

  return (
    <div className="detail">
      <div className="detail-header">
        <div>
          <span className="badge badge-kind">{listing.kind}</span>
          <h1 className="page-title">{listing.title}</h1>
          <p className="page-sub">
            <Link to={`/user/${listing.ownerUsername}`}>
              @{listing.ownerUsername}
            </Link>
            {" · "}
            v{listing.version} · {listing.fileSizeMb} MB · {listing.license}
          </p>
        </div>
        <div className="detail-actions">
          <button
            type="button"
            className={`btn${liked ? " btn-primary" : ""}`}
            onClick={onLikeClick}
            disabled={isOwner}
            title={
              isOwner
                ? "You cannot like your own listing"
                : liked
                  ? "Remove your like"
                  : "Like this asset"
            }
          >
            {liked ? "Liked" : "Like"} · {likeLabel}
          </button>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => {
              if (!user) return;
              if (listing.priceUsd === 0) {
                setFreeAccess(true);
                return;
              }
              addToCart(listing.id);
              navigate("/checkout");
            }}
          >
            {listing.priceUsd === 0 ? "Download free" : `Buy ${priceLabel}`}
          </button>
        </div>
      </div>
      {!user && (
        <p className="error-msg">
          <Link to="/login">Log in</Link> to like, purchase, or download.
        </p>
      )}
      {likeError && <p className="error-msg">{likeError}</p>}
      {freeAccess && listing.priceUsd === 0 && (
        <p className="success-msg">Free asset unlocked for your account.</p>
      )}
      <p>{listing.description}</p>
      {listing.githubRepoUrl && (
        <div className="github-panel">
          <h3>Source on GitHub</h3>
          <p>
            <a href={listing.githubRepoUrl} target="_blank" rel="noreferrer">
              {listing.githubRepoUrl.replace("https://github.com/", "")}
            </a>
            {listing.githubDefaultBranch && (
              <>
                {" · "}
                branch <code>{listing.githubDefaultBranch}</code>
              </>
            )}
            {typeof listing.githubStars === "number" && (
              <>
                {" · "}
                {listing.githubStars.toLocaleString()} GitHub stars
              </>
            )}
          </p>
        </div>
      )}
      <h3>Simulators</h3>
      <div className="tag-row">
        {listing.simulatorTags.map((t) => (
          <span key={t} className="badge">
            {t}
          </span>
        ))}
      </div>
      <h3>Tags</h3>
      <div className="tag-row">
        {listing.tags.map((t) => (
          <span key={t} className="badge">
            {t}
          </span>
        ))}
      </div>
      <p className="stats-line">
        Updated {new Date(listing.updatedAt).toLocaleDateString()}
      </p>
      <style>{`
        .detail-header {
          display: flex; justify-content: space-between; gap: 1rem;
          flex-wrap: wrap; margin-bottom: 1rem;
        }
        .detail-actions { display: flex; gap: 0.5rem; align-items: flex-start; }
        .tag-row { display: flex; flex-wrap: wrap; gap: 0.4rem; margin-bottom: 1rem; }
        .stats-line { color: var(--text-muted); font-size: 0.9rem; }
        .github-panel {
          padding: 1rem;
          margin: 1rem 0;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: var(--radius);
        }
        .github-panel h3 { margin-top: 0; font-size: 1rem; }
      `}</style>
    </div>
  );
}
