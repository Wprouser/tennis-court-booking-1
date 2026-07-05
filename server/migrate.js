import "dotenv/config";
import { pool } from "./db.js";
import { COURTS } from "./data/courts.js";

async function migrate() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS courts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      address TEXT NOT NULL,
      surface TEXT NOT NULL,
      courts_count INTEGER NOT NULL,
      price_per_hour INTEGER NOT NULL,
      open_hour INTEGER NOT NULL,
      close_hour INTEGER NOT NULL,
      color TEXT NOT NULL
    );
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      court_id TEXT NOT NULL REFERENCES courts(id) ON DELETE CASCADE,
      user_id TEXT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
      date_key TEXT NOT NULL,
      hour INTEGER NOT NULL,
      booked_by TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (court_id, date_key, hour)
    );
  `);

  await pool.query(`
    ALTER TABLE bookings
      ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES "user"(id) ON DELETE CASCADE;
  `);

  for (const court of COURTS) {
    await pool.query(
      `INSERT INTO courts (id, name, address, surface, courts_count, price_per_hour, open_hour, close_hour, color)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         address = EXCLUDED.address,
         surface = EXCLUDED.surface,
         courts_count = EXCLUDED.courts_count,
         price_per_hour = EXCLUDED.price_per_hour,
         open_hour = EXCLUDED.open_hour,
         close_hour = EXCLUDED.close_hour,
         color = EXCLUDED.color`,
      [
        court.id,
        court.name,
        court.address,
        court.surface,
        court.courtsCount,
        court.pricePerHour,
        court.openHour,
        court.closeHour,
        court.color,
      ]
    );
  }

  console.log(`Migrated schema and seeded ${COURTS.length} courts.`);
  await pool.end();
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
