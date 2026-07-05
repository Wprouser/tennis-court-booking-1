async function request(path, options) {
  const res = await fetch(`/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed with status ${res.status}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

export function getCourts() {
  return request("/courts");
}

export function getCourt(courtId) {
  return request(`/courts/${courtId}`);
}

export function getBookings(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return request(`/bookings${qs ? `?${qs}` : ""}`);
}

export function getMyBookings() {
  return request("/bookings/mine");
}

export function createBooking(booking) {
  return request("/bookings", {
    method: "POST",
    body: JSON.stringify(booking),
  });
}

export function cancelBookingRequest(id) {
  return request(`/bookings/${id}`, { method: "DELETE" });
}
