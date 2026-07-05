import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getCourt } from "../lib/api";
import { useBookings } from "../context/BookingsContext";
import { useSession } from "../lib/authClient";
import { nextDays, toDateKey, formatDayLabel, formatHour } from "../lib/dates";
import BookingDialog from "../components/BookingDialog";

export default function CourtDetail() {
  const { courtId } = useParams();
  const navigate = useNavigate();
  const { data: session } = useSession();
  const { isSlotBooked, addBooking } = useBookings();

  const [court, setCourt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const days = useMemo(() => nextDays(7), []);
  const [selectedDate, setSelectedDate] = useState(days[0]);
  const [pendingSlot, setPendingSlot] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);
    getCourt(courtId)
      .then(setCourt)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [courtId]);

  if (loading) {
    return (
      <div className="page">
        <p className="muted">Loading court...</p>
      </div>
    );
  }

  if (notFound || !court) {
    return (
      <div className="page">
        <p>Court not found.</p>
        <Link to="/">Back to all courts</Link>
      </div>
    );
  }

  const dateKey = toDateKey(selectedDate);
  const hours = [];
  for (let h = court.openHour; h < court.closeHour; h++) hours.push(h);

  function handleSlotClick(hour) {
    setConfirmation(null);
    setError(null);
    if (!session) {
      navigate("/login");
      return;
    }
    setPendingSlot(hour);
  }

  async function handleConfirm() {
    try {
      await addBooking({ courtId: court.id, dateKey, hour: pendingSlot });
      setConfirmation(`Booked ${formatHour(pendingSlot)} on ${dateKey}`);
      setPendingSlot(null);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page">
      <Link to="/" className="back-link">
        ← All courts
      </Link>
      <div className="detail-header">
        <div className="court-card-banner large" style={{ background: court.color }}>
          {court.name
            .split(" ")
            .map((w) => w[0])
            .slice(0, 2)
            .join("")}
        </div>
        <div>
          <h1>{court.name}</h1>
          <p className="muted">{court.address}</p>
          <div className="court-card-meta">
            <span className="pill">{court.surface}</span>
            <span className="pill">{court.courtsCount} courts</span>
            <span className="pill price">${court.pricePerHour}/hr</span>
          </div>
        </div>
      </div>

      {confirmation && <div className="banner success">{confirmation}</div>}
      {error && <div className="banner error">{error}</div>}
      {!session && (
        <div className="banner">
          <Link to="/login">Sign in</Link> to book a time slot.
        </div>
      )}

      <h2 className="section-title">Choose a day</h2>
      <div className="day-picker">
        {days.map((d) => {
          const key = toDateKey(d);
          const isSelected = key === dateKey;
          return (
            <button
              key={key}
              className={`day-btn ${isSelected ? "selected" : ""}`}
              onClick={() => setSelectedDate(d)}
            >
              {formatDayLabel(d)}
            </button>
          );
        })}
      </div>

      <h2 className="section-title">Available times</h2>
      <div className="slot-grid">
        {hours.map((hour) => {
          const booked = isSlotBooked(court.id, dateKey, hour);
          return (
            <button
              key={hour}
              className={`slot-btn ${booked ? "booked" : ""}`}
              disabled={booked}
              onClick={() => handleSlotClick(hour)}
            >
              {formatHour(hour)}
              {booked && <span className="slot-status">Booked</span>}
            </button>
          );
        })}
      </div>

      {pendingSlot !== null && session && (
        <BookingDialog
          court={court}
          dateKey={dateKey}
          hour={pendingSlot}
          userName={session.user.name || session.user.email}
          onConfirm={handleConfirm}
          onClose={() => setPendingSlot(null)}
        />
      )}
    </div>
  );
}
