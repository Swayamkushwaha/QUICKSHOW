import express from "express";
import cors from "cors";
import "dotenv/config";
import { clerkMiddleware } from "@clerk/express";
import connectDB from "./configs/db.js";
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";

// Route imports
import showRouter from "./routes/showRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import userRouter from "./routes/userRoutes.js";
import { stripeWebhooks } from "./controllers/stripeWebhooks.js";

// ✅ app must be initialized FIRST before any app.use() calls
const app = express();
const PORT = process.env.PORT || 3000;

// ── CORS ────────────────────────────────────────────────────
const corsOptions = {
  origin: process.env.ORIGIN || "http://localhost:5173",
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

// ── Stripe Webhook ──────────────────────────────────────────
// CRITICAL: Must use express.raw() BEFORE express.json()
app.post(
  "/api/webhook/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhooks
);

// ── Body Parser ─────────────────────────────────────────────
app.use(express.json());

// ── Clerk Middleware ────────────────────────────────────────
app.use(clerkMiddleware());

// ── Inngest ─────────────────────────────────────────────────
// ✅ Now safe to use app.use() — app is already initialized above
app.use("/api/inngest", serve({ client: inngest, functions }));

// ── Routes ──────────────────────────────────────────────────
app.get("/", (req, res) => res.send("API is running ✅"));

app.use("/api/shows",   showRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/admin",   adminRouter);
app.use("/api/user",    userRouter);

// ── Start ────────────────────────────────────────────────────
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});