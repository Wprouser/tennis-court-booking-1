import "dotenv/config";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./auth.js";
import courtsRouter from "./routes/courts.js";
import bookingsRouter from "./routes/bookings.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "..", "dist");

const app = express();

// Better Auth needs the raw request, so this must be mounted before express.json().
app.all("/api/auth/*splat", toNodeHandler(auth));

app.use(express.json());

app.use("/api/courts", courtsRouter);
app.use("/api/bookings", bookingsRouter);

app.use(express.static(distDir));

// SPA fallback: any non-API GET request serves the built index.html so
// client-side routes like /courts/:id work on a hard refresh.
app.get(/^(?!\/api\/).*/, (req, res) => {
  res.sendFile(path.join(distDir, "index.html"));
});

app.use((err, req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
