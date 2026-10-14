import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ListingCard } from "../components/ListingCard";
import { useMarketplaceStore } from "../store/marketplaceStore";
import type { AssetKind } from "../types";

const KINDS: { value: AssetKind | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "physics", label: "Physics" },
  { value: "urdf", label: "URDF" },
  { value: "controller", label: "Controllers" },
  { value: "simulation", label: "Simulations" },
  { value: "dataset", label: "Datasets" },
];

export function ExplorePage() {
  const [params, setParams] = useSearchParams();
  const kind = (params.get("kind") as AssetKind | null) ?? "all";
  const [query, setQuery] = useState(params.get("q") ?? "");
  const search = useMarketplaceStore((s) => s.search);

  const results = useMemo(
    () => search(query, kind === "all" ? "all" : kind),
    [search, query, kind],
  );

  function setKind(value: AssetKind | "all") {
    const next = new URLSearchParams(params);
    if (value === "all") next.delete("kind");
    else next.set("kind", value);
    setParams(next);
  }

  return (
    <div>
      <h1 className="page-title">Physics asset index</h1>
      <p className="page-sub">
        Search dynamics bundles, contact parameters, URDF chains, controllers, and
        simulation scenes. Filter by asset class for sim-ready downloads.
      </p>
      <div className="explore-toolbar">
        <input
          className="input"
          placeholder="Search inertia, URDF, friction, sim tags..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="kind-tabs">
          {KINDS.map((k) => (
            <button
              key={k.value}
              type="button"
              className={`btn ${kind === k.value ? "btn-primary" : ""}`}
              onClick={() => setKind(k.value)}
            >
              {k.label}
            </button>
          ))}
        </div>
      </div>
      <p className="result-count">{results.length} results</p>
      <div className="card-grid">
        {results.map((l) => (
          <ListingCard key={l.id} listing={l} />
        ))}
      </div>
      <style>{`
        .explore-toolbar { display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1rem; }
        .kind-tabs { display: flex; flex-wrap: wrap; gap: 0.5rem; }
        .result-count { color: var(--text-muted); font-size: 0.9rem; }
      `}</style>
    </div>
  );
}
