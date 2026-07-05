import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useSession } from "../lib/authClient";
import { getBookings, getMyBookings, createBooking, cancelBookingRequest } from "../lib/api";

const BookingsContext = createContext(null);

export function BookingsProvider({ children }) {
  const { data: session } = useSession();
  const userId = session?.user?.id ?? null;
  const [bookings, setBookings] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const [availability, mine] = await Promise.all([
        getBookings(),
        userId ? getMyBookings() : Promise.resolve([]),
      ]);
      setBookings(availability);
      setMyBookings(mine);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function isSlotBooked(courtId, dateKey, hour) {
    return bookings.some(
      (b) => b.courtId === courtId && b.dateKey === dateKey && b.hour === hour
    );
  }

  async function addBooking({ courtId, dateKey, hour }) {
    const booking = await createBooking({ courtId, dateKey, hour });
    setBookings((prev) => [...prev, booking]);
    setMyBookings((prev) => [...prev, booking]);
    return booking;
  }

  async function cancelBooking(id) {
    await cancelBookingRequest(id);
    setBookings((prev) => prev.filter((b) => b.id !== id));
    setMyBookings((prev) => prev.filter((b) => b.id !== id));
  }

  return (
    <BookingsContext.Provider
      value={{
        bookings,
        myBookings,
        loading,
        isSlotBooked,
        addBooking,
        cancelBooking,
        refresh,
      }}
    >
      {children}
    </BookingsContext.Provider>
  );
}

export function useBookings() {
  const ctx = useContext(BookingsContext);
  if (!ctx) throw new Error("useBookings must be used within BookingsProvider");
  return ctx;
}
