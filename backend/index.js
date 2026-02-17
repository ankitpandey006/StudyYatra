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
   CORS
============================== */
const allowedOrigins = [
  "http://localhost:5173",
  process.env.FRONTEND_URL, // https://your-vercel-app.vercel.app
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, cb) {
      if (!origin) return cb(null, true);
      if (allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS: " + origin));
    },
    credentials: true,
  })
);

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
   BODY PARSER
============================== */
app.use(express.json({ limit: "2mb" }));

/* ==============================
   HEALTH CHECK (important)
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
   ERROR HANDLER
============================== */
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err?.message || err);

  res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? "Internal Server Error"
        : err?.message,
  });
});

/* ==============================
   START SERVER
============================== */
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});