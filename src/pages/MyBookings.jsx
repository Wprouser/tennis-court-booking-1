import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useBookings } from "../context/BookingsContext";
import { useSession } from "../lib/authClient";
import { formatHour } from "../lib/dates";

export default function MyBookings() {
  const { data: session, isPending: sessionLoading } = useSession();
  const { myBookings, loading, cancelBooking } = useBookings();
  const [error, setError] = useState(null);

  const sorted = useMemo(() => {
    return [...myBookings].sort((a, b) => {
      if (a.dateKey !== b.dateKey) return a.dateKey.localeCompare(b.dateKey);
      return a.hour - b.hour;
    });
  }, [myBookings]);

  const todayKey = new Date().toISOString().slice(0, 10);
  const upcoming = sorted.filter((b) => b.dateKey >= todayKey);
  const past = sorted.filter((b) => b.dateKey < todayKey);

  async function handleCancel(id) {
    setError(null);
    try {
      await cancelBooking(id);
    } catch (err) {
      setError(err.message);
    }
  }

  if (sessionLoading) {
    return (
      <div className="page">
        <p className="muted">Loading...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="page">
        <h1>My Bookings</h1>
        <p className="muted">
          <Link to="/login">Sign in</Link> to see your bookings.
        </p>
      </div>
    );
  }

  return (
    <div className="page">
      <h1>My Bookings</h1>
      {error && <div className="banner error">{error}</div>}
      {loading && <p className="muted">Loading bookings...</p>}
      {!loading && myBookings.length === 0 && (
        <p className="muted">
          You have no bookings yet. <Link to="/">Find a court</Link> to get started.
        </p>
      )}

      {upcoming.length > 0 && (
        <>
          <h2 className="section-title">Upcoming</h2>
          <div className="bookings-list">
            {upcoming.map((b) => (
              <BookingRow key={b.id} booking={b} onCancel={handleCancel} />
            ))}
          </div>
        </>
      )}

      {past.length > 0 && (
        <>
          <h2 className="section-title">Past</h2>
          <div className="bookings-list">
            {past.map((b) => (
              <BookingRow key={b.id} booking={b} past />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function BookingRow({ booking, onCancel, past }) {
  return (
    <div className={`booking-row ${past ? "past" : ""}`}>
      <div>
        <strong>{booking.courtName}</strong>
        <div className="muted">
          {booking.dateKey} at {formatHour(booking.hour)}
        </div>
      </div>
      {!past && (
        <button className="btn secondary" onClick={() => onCancel(booking.id)}>
          Cancel
        </button>
      )}
    </div>
  );
}
