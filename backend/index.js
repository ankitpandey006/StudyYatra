// backend/index.js
import "dotenv/config";

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
import meRoutes from "./routes/me.js";

const app = express();
const PORT = process.env.PORT || 5050;

/* ==============================
   TRUST PROXY (Render required)
============================== */
app.set("trust proxy", 1);

/* ==============================
   SECURITY
============================== */
app.use(helmet());

/* ==============================
   BODY PARSER (before routes)
============================== */
app.use(express.json({ limit: "2mb" }));

/* ==============================
   CORS (No crash + Production ready)
============================== */
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:3000",
  "https://study-yatra-006.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean);

const corsOptions = {
  origin: (origin, cb) => {
    if (!origin) return cb(null, true);
    if (allowedOrigins.includes(origin)) return cb(null, true);

    // optional: allow any vercel preview domain
    try {
      const hostname = new URL(origin).hostname;
      if (hostname.endsWith(".vercel.app")) return cb(null, true);
    } catch {}

    return cb(new Error("Not allowed by CORS: " + origin));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// ✅ IMPORTANT: Express v5 me app.options("*") crash kar sakta hai,
// isliye safe preflight handler:
app.use((req, res, next) => {
  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
});

/* ==============================
   RATE LIMIT
============================== */
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

/* ==============================
   HEALTH CHECK
============================== */
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

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
app.use("/api/me", meRoutes);

/* ==============================
   404 HANDLER
============================== */
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

/* ==============================
   ERROR HANDLER (CORS -> 403)
============================== */
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err?.message || err);

  const msg = String(err?.message || "");
  const isCors = msg.startsWith("Not allowed by CORS:");

  res.status(isCors ? 403 : 500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? isCors
          ? "CORS blocked"
          : "Internal Server Error"
        : msg,
  });
});

/* ==============================
   START SERVER
============================== */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
