import { Router } from "express";
import { randomUUID } from "node:crypto";
import { query } from "../db.js";
import { requireAuth } from "../middleware/requireAuth.js";

const router = Router();
const DATE_KEY_RE = /^\d{4}-\d{2}-\d{2}$/;

function toBooking(row) {
  return {
    id: row.id,
    courtId: row.court_id,
    courtName: row.court_name,
    dateKey: row.date_key,
    hour: row.hour,
    bookedBy: row.booked_by,
    createdAt: row.created_at,
  };
}

// Public: which slots are taken for a court/date, without exposing who booked them.
router.get("/", async (req, res) => {
  const { courtId, date } = req.query;
  const conditions = [];
  const params = [];

  if (courtId) {
    params.push(courtId);
    conditions.push(`court_id = $${params.length}`);
  }
  if (date) {
    params.push(date);
    conditions.push(`date_key = $${params.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const { rows } = await query(
    `SELECT id, court_id, date_key, hour FROM bookings ${where} ORDER BY date_key, hour`,
    params
  );
  res.json(rows.map((r) => ({ id: r.id, courtId: r.court_id, dateKey: r.date_key, hour: r.hour })));
});

// The signed-in user's own bookings, with full detail.
router.get("/mine", requireAuth, async (req, res) => {
  const { rows } = await query(
    `SELECT b.*, c.name AS court_name
     FROM bookings b
     JOIN courts c ON c.id = b.court_id
     WHERE b.user_id = $1
     ORDER BY b.date_key, b.hour`,
    [req.user.id]
  );
  res.json(rows.map(toBooking));
});

router.post("/", requireAuth, async (req, res) => {
  const { courtId, dateKey, hour } = req.body ?? {};

  if (typeof courtId !== "string" || !courtId) {
    return res.status(400).json({ error: "courtId is required" });
  }
  if (typeof dateKey !== "string" || !DATE_KEY_RE.test(dateKey)) {
    return res.status(400).json({ error: "dateKey must be in YYYY-MM-DD format" });
  }
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
    return res.status(400).json({ error: "hour must be an integer between 0 and 23" });
  }

  const court = await query("SELECT id, name FROM courts WHERE id = $1", [courtId]);
  if (court.rows.length === 0) {
    return res.status(404).json({ error: "Court not found" });
  }

  try {
    const id = randomUUID();
    const bookedBy = req.user.name || req.user.email;
    const { rows } = await query(
      `INSERT INTO bookings (id, court_id, user_id, date_key, hour, booked_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id, courtId, req.user.id, dateKey, hour, bookedBy]
    );
    res.status(201).json(toBooking({ ...rows[0], court_name: court.rows[0].name }));
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "That time slot is already booked" });
    }
    throw err;
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  const existing = await query("SELECT user_id FROM bookings WHERE id = $1", [req.params.id]);
  if (existing.rows.length === 0) {
    return res.status(404).json({ error: "Booking not found" });
  }
  if (existing.rows[0].user_id !== req.user.id) {
    return res.status(403).json({ error: "You can only cancel your own bookings" });
  }

  await query("DELETE FROM bookings WHERE id = $1", [req.params.id]);
  res.status(204).end();
});

export default router;
