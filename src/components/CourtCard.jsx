import { Link } from "react-router-dom";

export default function CourtCard({ court }) {
  return (
    <Link to={`/courts/${court.id}`} className="court-card">
      <div className="court-card-banner" style={{ background: court.color }}>
        {court.name
          .split(" ")
          .map((w) => w[0])
          .slice(0, 2)
          .join("")}
      </div>
      <div className="court-card-body">
        <h3>{court.name}</h3>
        <p className="muted">{court.address}</p>
        <div className="court-card-meta">
          <span className="pill">{court.surface}</span>
          <span className="pill">{court.courtsCount} courts</span>
          <span className="pill price">${court.pricePerHour}/hr</span>
        </div>
      </div>
    </Link>
  );
}
