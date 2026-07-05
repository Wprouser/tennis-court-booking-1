import { formatHour } from "../lib/dates";

export default function BookingDialog({ court, dateKey, hour, userName, onConfirm, onClose }) {
  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div className="dialog" onClick={(e) => e.stopPropagation()}>
        <h2>Confirm booking</h2>
        <p className="muted">{court.name}</p>
        <p className="muted">
          {dateKey} at {formatHour(hour)}
        </p>
        <p className="muted">Booking as {userName}</p>
        <div className="dialog-actions">
          <button type="button" className="btn secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn primary" onClick={onConfirm}>
            Confirm booking
          </button>
        </div>
      </div>
    </div>
  );
}
