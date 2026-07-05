import { useEffect, useMemo, useState } from "react";
import { getCourts } from "../lib/api";
import CourtCard from "../components/CourtCard";

export default function CourtsList() {
  const [query, setQuery] = useState("");
  const [courts, setCourts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getCourts()
      .then(setCourts)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return courts;
    return courts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q) ||
        c.surface.toLowerCase().includes(q)
    );
  }, [courts, query]);

  return (
    <div className="page">
      <h1>Find a court near you</h1>
      <p className="muted">Browse local tennis clubs and book an available time slot.</p>
      <input
        className="search-input"
        type="text"
        placeholder="Search by name, area or surface..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {loading && <p className="muted">Loading courts...</p>}
      {error && <div className="banner error">Could not load courts: {error}</div>}
      <div className="court-grid">
        {filtered.map((court) => (
          <CourtCard key={court.id} court={court} />
        ))}
        {!loading && !error && filtered.length === 0 && (
          <p className="muted">No courts match your search.</p>
        )}
      </div>
    </div>
  );
}
