import { Link, Navigate } from "react-router-dom";
import type { MembershipPlan } from "../types";
import { useAuthStore } from "../store/authStore";

const PLANS: {
  id: MembershipPlan;
  name: string;
  price: string;
  perks: string[];
}[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    perks: [
      "Browse & buy assets",
      "Up to 3 manual uploads",
      "Community support",
    ],
  },
  {
    id: "pro",
    name: "Pro Seller",
    price: "$19/mo",
    perks: [
      "Unlimited uploads",
      "Publish from GitHub",
      "Seller analytics (coming soon)",
      "Pro badge on profile",
    ],
  },
  {
    id: "lab",
    name: "Lab",
    price: "$99/mo",
    perks: [
      "Everything in Pro",
      "Team seats (coming soon)",
      "Featured listing slots",
      "Priority support",
    ],
  },
];

export function MembershipPage() {
  const user = useAuthStore((s) => s.currentUser);
  const setMembershipPlan = useAuthStore((s) => s.setMembershipPlan);

  if (!user) return <Navigate to="/register" replace />;

  return (
    <div>
      <h1 className="page-title">Membership</h1>
      <p className="page-sub">
        Choose a plan for @{user.username}. Billing is simulated in this demo;
        no payment required.
      </p>
      <div className="plan-grid">
        {PLANS.map((plan) => {
          const active = user.membershipPlan === plan.id;
          return (
            <article
              key={plan.id}
              className={`plan-card${active ? " plan-card-active" : ""}`}
            >
              <h2>{plan.name}</h2>
              <p className="plan-price">{plan.price}</p>
              <ul>
                {plan.perks.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              {active ? (
                <span className="badge">Current plan</span>
              ) : (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setMembershipPlan(plan.id)}
                >
                  Switch to {plan.name}
                </button>
              )}
            </article>
          );
        })}
      </div>
      <p className="page-sub" style={{ marginTop: "1.5rem" }}>
        <Link to="/dashboard">Back to dashboard</Link>
      </p>
      <style>{`
        .plan-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 1rem;
          margin-top: 1rem;
        }
        .plan-card {
          padding: 1.25rem;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
        }
        .plan-card-active { border-color: var(--accent); }
        .plan-price { font-size: 1.5rem; margin: 0.5rem 0 1rem; }
        .plan-card ul {
          margin: 0 0 1rem;
          padding-left: 1.1rem;
          color: var(--text-muted);
          font-size: 0.92rem;
        }
      `}</style>
    </div>
  );
}

export function membershipLabel(plan: MembershipPlan): string {
  if (plan === "pro") return "Pro Seller";
  if (plan === "lab") return "Lab";
  return "Free";
}
