import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Link,
  Navigate,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  detectCardBrand,
  parseCardDigits,
  useCheckoutStore,
  validateCardNumber,
} from "../store/checkoutStore";
import { useAuthStore } from "../store/authStore";
import { useMarketplaceStore } from "../store/marketplaceStore";

const STEPS = [
  { path: "/checkout", label: "Review" },
  { path: "/checkout/billing", label: "Billing" },
  { path: "/checkout/payment", label: "Payment" },
  { path: "/checkout/confirm", label: "Confirm" },
] as const;

function useCartSummary() {
  const cart = useMarketplaceStore((s) => s.cart);
  const listings = useMarketplaceStore((s) => s.listings);
  return useMemo(() => {
    const items = cart
      .map((c) => listings.find((l) => l.id === c.listingId))
      .filter((l): l is NonNullable<typeof l> => Boolean(l));
    const subtotal = items.reduce((s, l) => s + l.priceUsd, 0);
    const tax = Math.round(subtotal * 0.08 * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;
    return { items, subtotal, tax, total };
  }, [cart, listings]);
}

export function CheckoutLayout() {
  const user = useAuthStore((s) => s.currentUser);
  const cart = useMarketplaceStore((s) => s.cart);
  const hydrateCheckout = useCheckoutStore((s) => s.hydrate);
  const location = useLocation();
  const isSuccess = location.pathname.startsWith("/checkout/success");

  useEffect(() => {
    hydrateCheckout();
  }, [hydrateCheckout]);

  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (!isSuccess && cart.length === 0) {
    return <Navigate to="/cart" replace />;
  }

  return (
    <div className="checkout-shell">
      {!isSuccess && <CheckoutStepper currentPath={location.pathname} />}
      <Outlet />
      <style>{`
        .checkout-shell { max-width: 720px; margin: 0 auto; }
      `}</style>
    </div>
  );
}

function CheckoutStepper({ currentPath }: { currentPath: string }) {
  const activeIndex = STEPS.findIndex((s) => s.path === currentPath);

  return (
    <nav className="checkout-steps" aria-label="Checkout progress">
      {STEPS.map((step, i) => {
        const done = activeIndex > i;
        const active = step.path === currentPath;
        return (
          <div
            key={step.path}
            className={`step${active ? " step-active" : ""}${done ? " step-done" : ""}`}
          >
            <span className="step-num">{i + 1}</span>
            <span className="step-label">{step.label}</span>
          </div>
        );
      })}
      <style>{`
        .checkout-steps {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0.5rem;
          margin-bottom: 1.75rem;
        }
        .step {
          padding: 0.65rem 0.5rem;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          text-align: center;
          font-family: var(--mono);
          font-size: 0.68rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-muted);
        }
        .step-active {
          border-color: var(--accent);
          color: var(--accent);
          box-shadow: 0 0 12px var(--border-glow);
        }
        .step-done { color: var(--accent2); }
        .step-num {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          margin-bottom: 0.15rem;
        }
        @media (max-width: 560px) {
          .step-label { display: none; }
        }
      `}</style>
    </nav>
  );
}

function OrderSummaryAside({ showTax = true }: { showTax?: boolean }) {
  const { items, subtotal, tax, total } = useCartSummary();

  return (
    <aside className="order-summary">
      <h2 className="summary-title">Order summary</h2>
      <ul className="summary-list">
        {items.map((l) => (
          <li key={l.id}>
            <span>{l.title}</span>
            <span>${l.priceUsd.toFixed(2)}</span>
          </li>
        ))}
      </ul>
      <div className="summary-row">
        <span>Subtotal</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>
      {showTax && (
        <div className="summary-row muted">
          <span>Est. tax (8%)</span>
          <span>${tax.toFixed(2)}</span>
        </div>
      )}
      <div className="summary-row total">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>
      <style>{`
        .order-summary {
          padding: 1rem;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          margin-bottom: 1.25rem;
        }
        .summary-title {
          margin: 0 0 0.75rem;
          font-size: 0.85rem;
          font-family: var(--mono);
          text-transform: uppercase;
          color: var(--accent2);
        }
        .summary-list {
          list-style: none;
          padding: 0;
          margin: 0 0 0.75rem;
          border-bottom: 1px solid var(--border);
        }
        .summary-list li {
          display: flex;
          justify-content: space-between;
          gap: 1rem;
          padding: 0.35rem 0;
          font-size: 0.9rem;
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 0.25rem 0;
          font-size: 0.9rem;
        }
        .summary-row.total {
          margin-top: 0.5rem;
          padding-top: 0.5rem;
          border-top: 1px solid var(--border);
          font-weight: 600;
          color: var(--accent);
        }
      `}</style>
    </aside>
  );
}

export function CheckoutReviewPage() {
  const navigate = useNavigate();
  const { items, total } = useCartSummary();

  return (
    <div>
      <h1 className="page-title">Review order</h1>
      <p className="page-sub">
        Confirm the physics assets in your cart before billing and payment.
      </p>
      <OrderSummaryAside />
      <p className="page-sub">{items.length} item(s). Total due: ${total.toFixed(2)}</p>
      <div className="checkout-actions">
        <Link to="/cart" className="btn">
          Back to cart
        </Link>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => navigate("/checkout/billing")}
        >
          Continue to billing
        </button>
      </div>
      <CheckoutActionsStyle />
    </div>
  );
}

export function CheckoutBillingPage() {
  const user = useAuthStore((s) => s.currentUser);
  const billing = useCheckoutStore((s) => s.billing);
  const setBilling = useCheckoutStore((s) => s.setBilling);
  const navigate = useNavigate();
  const [fullName, setFullName] = useState(billing?.fullName ?? user?.displayName ?? "");
  const [email, setEmail] = useState(billing?.email ?? user?.email ?? "");
  const [line1, setLine1] = useState(billing?.line1 ?? "");
  const [city, setCity] = useState(billing?.city ?? "");
  const [postalCode, setPostalCode] = useState(billing?.postalCode ?? "");
  const [country, setCountry] = useState(billing?.country ?? "US");
  const [error, setError] = useState("");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !line1.trim() || !city.trim()) {
      setError("Fill in all required billing fields.");
      return;
    }
    setBilling({
      fullName: fullName.trim(),
      email: email.trim(),
      line1: line1.trim(),
      city: city.trim(),
      postalCode: postalCode.trim(),
      country,
    });
    navigate("/checkout/payment");
  }

  return (
    <div>
      <h1 className="page-title">Billing details</h1>
      <p className="page-sub">Invoice and license delivery use this address.</p>
      <OrderSummaryAside />
      <form className="checkout-panel form-stack" onSubmit={onSubmit}>
        <div>
          <label className="label">Full name</label>
          <input className="input" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </div>
        <div>
          <label className="label">Email</label>
          <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div>
          <label className="label">Address</label>
          <input className="input" required value={line1} onChange={(e) => setLine1(e.target.value)} />
        </div>
        <div className="row-2">
          <div>
            <label className="label">City</label>
            <input className="input" required value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
          <div>
            <label className="label">Postal code</label>
            <input className="input" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
          </div>
        </div>
        <div>
          <label className="label">Country</label>
          <select className="input" value={country} onChange={(e) => setCountry(e.target.value)}>
            <option value="US">United States</option>
            <option value="TR">Turkey</option>
            <option value="DE">Germany</option>
            <option value="GB">United Kingdom</option>
            <option value="JP">Japan</option>
          </select>
        </div>
        {error && <p className="error-msg">{error}</p>}
        <div className="checkout-actions">
          <Link to="/checkout" className="btn">
            Back
          </Link>
          <button type="submit" className="btn btn-primary">
            Continue to payment
          </button>
        </div>
      </form>
      <CheckoutPanelStyle />
      <CheckoutActionsStyle />
    </div>
  );
}

export function CheckoutPaymentPage() {
  const user = useAuthStore((s) => s.currentUser);
  const billing = useCheckoutStore((s) => s.billing);
  const setPayment = useCheckoutStore((s) => s.setPayment);
  const payment = useCheckoutStore((s) => s.payment);
  const navigate = useNavigate();

  const [cardholderName, setCardholderName] = useState(
    payment?.cardholderName ?? billing?.fullName ?? user?.displayName ?? "",
  );
  const [cardNumber, setCardNumber] = useState("");
  const [expiryMonth, setExpiryMonth] = useState(payment?.expiryMonth ?? "");
  const [expiryYear, setExpiryYear] = useState(payment?.expiryYear ?? "");
  const [cvc, setCvc] = useState("");
  const [error, setError] = useState("");

  if (!billing) return <Navigate to="/checkout/billing" replace />;

  const digits = parseCardDigits(cardNumber);
  const brand = digits.length >= 2 ? detectCardBrand(digits) : "";

  function formatCardDisplay(raw: string): string {
    const d = parseCardDigits(raw).slice(0, 19);
    return d.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const d = parseCardDigits(cardNumber);
    if (!validateCardNumber(d)) {
      setError("Enter a valid card number.");
      return;
    }
    if (!/^\d{2}$/.test(expiryMonth) || Number(expiryMonth) < 1 || Number(expiryMonth) > 12) {
      setError("Enter expiry month as MM.");
      return;
    }
    if (!/^\d{2}$/.test(expiryYear)) {
      setError("Enter expiry year as YY.");
      return;
    }
    if (cvc.length < 3 || cvc.length > 4) {
      setError("Enter a valid CVC.");
      return;
    }
    if (!cardholderName.trim()) {
      setError("Enter the name on the card.");
      return;
    }
    setPayment({
      method: "card",
      cardholderName: cardholderName.trim(),
      expiryMonth,
      expiryYear,
      cardLast4: d.slice(-4),
      cardBrand: detectCardBrand(d),
    });
    navigate("/checkout/confirm");
  }

  return (
    <div>
      <h1 className="page-title">Payment method</h1>
      <p className="page-sub">
        Card data is validated in the browser only. No real charge is made in this demo.
      </p>
      <OrderSummaryAside />
      <form className="checkout-panel form-stack" onSubmit={onSubmit}>
        <div className="card-brands">
          <span className="badge">Visa</span>
          <span className="badge">Mastercard</span>
          <span className="badge">Amex</span>
        </div>
        <div>
          <label className="label">Name on card</label>
          <input
            className="input"
            required
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Card number {brand && `(${brand})`}</label>
          <input
            className="input"
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="4242 4242 4242 4242"
            value={formatCardDisplay(cardNumber)}
            onChange={(e) => setCardNumber(parseCardDigits(e.target.value))}
            required
          />
        </div>
        <div className="row-3">
          <div>
            <label className="label">MM</label>
            <input
              className="input"
              inputMode="numeric"
              maxLength={2}
              placeholder="12"
              value={expiryMonth}
              onChange={(e) => setExpiryMonth(e.target.value.replace(/\D/g, "").slice(0, 2))}
              required
            />
          </div>
          <div>
            <label className="label">YY</label>
            <input
              className="input"
              inputMode="numeric"
              maxLength={2}
              placeholder="28"
              value={expiryYear}
              onChange={(e) => setExpiryYear(e.target.value.replace(/\D/g, "").slice(0, 2))}
              required
            />
          </div>
          <div>
            <label className="label">CVC</label>
            <input
              className="input"
              inputMode="numeric"
              maxLength={4}
              autoComplete="cc-csc"
              value={cvc}
              onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
              required
            />
          </div>
        </div>
        {error && <p className="error-msg">{error}</p>}
        <div className="checkout-actions">
          <Link to="/checkout/billing" className="btn">
            Back
          </Link>
          <button type="submit" className="btn btn-primary">
            Review and confirm
          </button>
        </div>
      </form>
      <CheckoutPanelStyle />
      <CheckoutActionsStyle />
    </div>
  );
}

export function CheckoutConfirmPage() {
  const user = useAuthStore((s) => s.currentUser);
  const billing = useCheckoutStore((s) => s.billing);
  const payment = useCheckoutStore((s) => s.payment);
  const checkout = useMarketplaceStore((s) => s.checkout);
  const clearCheckout = useCheckoutStore((s) => s.clear);
  const navigate = useNavigate();
  const { total } = useCartSummary();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  if (!billing) return <Navigate to="/checkout/billing" replace />;
  if (!payment) return <Navigate to="/checkout/payment" replace />;

  async function payNow() {
    if (!user || !billing || !payment) return;
    setError("");
    setProcessing(true);
    await new Promise((r) => setTimeout(r, 1200));
    const order = checkout(user.id, {
      method: "card",
      cardLast4: payment.cardLast4,
      cardBrand: payment.cardBrand,
      billing: {
        fullName: billing.fullName,
        email: billing.email,
        line1: billing.line1,
        city: billing.city,
        postalCode: billing.postalCode,
        country: billing.country,
      },
    });
    setProcessing(false);
    if (!order) {
      setError("Checkout failed. Your cart may be empty.");
      return;
    }
    clearCheckout();
    navigate(`/checkout/success/${order.id}`);
  }

  return (
    <div>
      <h1 className="page-title">Confirm and pay</h1>
      <p className="page-sub">Verify billing and card details before placing the order.</p>
      <OrderSummaryAside />
      <div className="checkout-panel confirm-blocks">
        <section>
          <h3>Billing</h3>
          <p>
            {billing.fullName}
            <br />
            {billing.line1}, {billing.city} {billing.postalCode}
            <br />
            {billing.country} · {billing.email}
          </p>
        </section>
        <section>
          <h3>Payment</h3>
          <p>
            {payment.cardBrand} ending in {payment.cardLast4}
            <br />
            Expires {payment.expiryMonth}/{payment.expiryYear}
            <br />
            {payment.cardholderName}
          </p>
        </section>
      </div>
      {error && <p className="error-msg">{error}</p>}
      <div className="checkout-actions">
        <Link to="/checkout/payment" className="btn">
          Back
        </Link>
        <button
          type="button"
          className="btn btn-primary"
          disabled={processing}
          onClick={() => void payNow()}
        >
          {processing ? "Processing payment..." : `Pay $${total.toFixed(2)}`}
        </button>
      </div>
      <CheckoutPanelStyle />
      <CheckoutActionsStyle />
    </div>
  );
}

export function CheckoutSuccessPage() {
  const { orderId } = useParams<{ orderId: string }>();
  const user = useAuthStore((s) => s.currentUser);
  const getOrder = useMarketplaceStore((s) => s.getOrder);
  const listings = useMarketplaceStore((s) => s.listings);

  if (!user) return <Navigate to="/login" replace />;

  const order = orderId ? getOrder(orderId) : undefined;
  if (!order || order.buyerId !== user.id) {
    return (
      <div>
        <h1 className="page-title">Order not found</h1>
        <Link to="/dashboard">Go to dashboard</Link>
      </div>
    );
  }

  const items = order.listingIds
    .map((id) => listings.find((l) => l.id === id))
    .filter((l): l is NonNullable<typeof l> => Boolean(l));

  return (
    <div className="success-page">
      <p className="success-kicker">Payment complete</p>
      <h1 className="page-title">Thank you</h1>
      <p className="page-sub">
        Order <code>{order.id}</code> is paid. Download links are available from your
        dashboard and listing pages.
      </p>
      <div className="checkout-panel">
        <p>
          <strong>${order.totalUsd.toFixed(2)}</strong> charged to{" "}
          {order.cardBrand ?? "Card"} ···· {order.cardLast4 ?? "****"}
        </p>
        <ul className="success-items">
          {items.map((l) => (
            <li key={l.id}>
              <Link to={`/listing/${l.slug}`}>{l.title}</Link>
            </li>
          ))}
        </ul>
      </div>
      <div className="checkout-actions">
        <Link to="/dashboard" className="btn btn-primary">
          View dashboard
        </Link>
        <Link to="/explore" className="btn">
          Browse more assets
        </Link>
      </div>
      <CheckoutPanelStyle />
      <CheckoutActionsStyle />
      <style>{`
        .success-kicker {
          color: var(--success);
          font-family: var(--mono);
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .success-items { margin: 0.75rem 0 0; padding-left: 1.1rem; }
      `}</style>
    </div>
  );
}

function CheckoutPanelStyle() {
  return (
    <style>{`
      .checkout-panel {
        padding: 1.25rem;
        background: var(--bg-card);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        margin-bottom: 1rem;
      }
      .checkout-panel h3 {
        margin: 0 0 0.35rem;
        font-size: 0.78rem;
        font-family: var(--mono);
        text-transform: uppercase;
        color: var(--accent2);
      }
      .confirm-blocks section + section {
        margin-top: 1rem;
        padding-top: 1rem;
        border-top: 1px solid var(--border);
      }
      .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
      .row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem; }
      .card-brands { display: flex; gap: 0.35rem; }
      @media (max-width: 560px) {
        .row-2, .row-3 { grid-template-columns: 1fr; }
      }
    `}</style>
  );
}

function CheckoutActionsStyle() {
  return (
    <style>{`
      .checkout-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-top: 0.5rem;
      }
    `}</style>
  );
}
