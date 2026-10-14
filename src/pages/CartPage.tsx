import { Link, Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useMarketplaceStore } from "../store/marketplaceStore";

export function CartPage() {
  const user = useAuthStore((s) => s.currentUser);
  const cart = useMarketplaceStore((s) => s.cart);
  const listings = useMarketplaceStore((s) => s.listings);
  const removeFromCart = useMarketplaceStore((s) => s.removeFromCart);

  if (!user) return <Navigate to="/login" replace />;

  const items = cart
    .map((c) => listings.find((l) => l.id === c.listingId))
    .filter(Boolean);
  const subtotal = items.reduce((s, l) => s + (l?.priceUsd ?? 0), 0);
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  return (
    <div>
      <h1 className="page-title">Cart</h1>
      {items.length === 0 ? (
        <p className="page-sub">
          Cart is empty. <Link to="/explore">Browse assets</Link>
        </p>
      ) : (
        <>
          <ul className="cart-list">
            {items.map((l) =>
              l ? (
                <li key={l.id} className="cart-row">
                  <div>
                    <Link to={`/listing/${l.slug}`}>{l.title}</Link>
                    <div className="muted">@{l.ownerUsername}</div>
                  </div>
                  <div>${l.priceUsd.toFixed(2)}</div>
                  <button type="button" className="btn" onClick={() => removeFromCart(l.id)}>
                    Remove
                  </button>
                </li>
              ) : null,
            )}
          </ul>
          <div className="totals">
            <div className="totals-row">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="totals-row muted">
              <span>Est. tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="totals-row total">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
          <Link to="/checkout" className="btn btn-primary">
            Proceed to checkout
          </Link>
          <p className="page-sub" style={{ marginTop: "1rem" }}>
            Checkout includes billing, card payment, and order confirmation screens.
          </p>
        </>
      )}
      <style>{`
        .cart-list { list-style: none; padding: 0; margin: 0 0 1rem; }
        .cart-row {
          display: grid;
          grid-template-columns: 1fr auto auto;
          gap: 1rem;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid var(--border);
        }
        .muted { color: var(--text-muted); font-size: 0.85rem; }
        .totals { max-width: 280px; margin-bottom: 1rem; }
        .totals-row {
          display: flex;
          justify-content: space-between;
          padding: 0.2rem 0;
          font-size: 0.92rem;
        }
        .totals-row.total {
          font-size: 1.2rem;
          font-weight: 600;
          color: var(--accent);
          margin-top: 0.35rem;
          padding-top: 0.35rem;
          border-top: 1px solid var(--border);
        }
      `}</style>
    </div>
  );
}
