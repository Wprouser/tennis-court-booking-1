import { Router } from "express";
import { query } from "../db.js";

const router = Router();

function toCourt(row) {
  return {
    id: row.id,
    name: row.name,
    address: row.address,
    surface: row.surface,
    courtsCount: row.courts_count,
    pricePerHour: row.price_per_hour,
    openHour: row.open_hour,
    closeHour: row.close_hour,
    color: row.color,
  };
}

router.get("/", async (req, res) => {
  const { rows } = await query("SELECT * FROM courts ORDER BY name");
  res.json(rows.map(toCourt));
});

router.get("/:id", async (req, res) => {
  const { rows } = await query("SELECT * FROM courts WHERE id = $1", [req.params.id]);
  if (rows.length === 0) return res.status(404).json({ error: "Court not found" });
  res.json(toCourt(rows[0]));
});

export default router;
