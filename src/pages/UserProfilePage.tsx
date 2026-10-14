import { useParams } from "react-router-dom";
import { ListingCard } from "../components/ListingCard";
import { useMarketplaceStore } from "../store/marketplaceStore";

export function UserProfilePage() {
  const { username } = useParams<{ username: string }>();
  const listings = useMarketplaceStore((s) => s.listings);
  const userListings = listings.filter(
    (l) => l.ownerUsername.toLowerCase() === username?.toLowerCase(),
  );

  return (
    <div>
      <h1 className="page-title">@{username}</h1>
      <p className="page-sub">Seller profile · {userListings.length} public assets</p>
      <div className="card-grid">
        {userListings.map((l) => (
          <ListingCard key={l.id} listing={l} />
        ))}
      </div>
      {userListings.length === 0 && (
        <p className="page-sub">No listings from this user yet.</p>
      )}
    </div>
  );
}
