// backend/index.js
import "dotenv/config"; // ✅ ESM-safe dotenv (fixes env undefined issues)

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import bookRoutes from "./routes/bookRoutes.js";
import noteRoutes from "./routes/noteRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import resultRoutes from "./routes/resultRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import paymentRoutes from "./routes/payment.js";
import authRoutes from "./routes/authRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import meRoutes from "./routes/me.js"; // ✅ must exist: backend/routes/me.js

const app = express();
const PORT = process.env.PORT || 5050;

/* ==============================
   SECURITY + CORE MIDDLEWARE
============================== */

// ✅ Trust proxy (important for rate-limit + production reverse proxy like Render/Nginx)
app.set("trust proxy", 1);

// ✅ Helmet (security headers)
app.use(helmet());

// ✅ CORS (dev + prod)
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL, // e.g. https://studyyatra.in
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, cb) {
      // allow server-to-server / Postman / curl (no origin)
      if (!origin) return cb(null, true);

      if (allowedOrigins.includes(origin)) return cb(null, true);

      return cb(new Error("Not allowed by CORS: " + origin));
    },
    credentials: true,
  })
);

// ✅ Rate limit (anti-abuse)
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// ✅ JSON body limit
app.use(express.json({ limit: "2mb" }));

/* ==============================
   ROUTES
============================== */

app.get("/", (req, res) => {
  res.send("📚 StudyYatra Backend is running 🚀");
});

app.use("/api/books", bookRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api/results", resultRoutes);
app.use("/api/users", userRoutes);

app.use("/api/payment", paymentRoutes);
app.use("/api/auth", authRoutes);

app.use("/api/upload", uploadRoutes);

// ✅ premium status route
app.use("/api/me", meRoutes);

/* ==============================
   ERROR HANDLER (Optional but useful)
============================== */
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err?.message || err);
  res.status(500).json({ message: err?.message || "Internal Server Error" });
});

/* ==============================
   START SERVER
============================== */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`✅ Server running on http://0.0.0.0:${PORT}`);
});