import express from "express";
import cors from "cors";
import "dotenv/config";
import { clerkMiddleware } from "@clerk/express";
import connectDB from "./configs/db.js";
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";

// Routes
import showRouter from "./routes/showRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import userRouter from "./routes/userRoutes.js";
import { stripeWebhooks } from "./controllers/stripeWebhooks.js";

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ CORS FIX (FINAL)
const allowedOrigins = [
  "https://quickshow-alpha-eight.vercel.app",
  "http://localhost:5173",
];

const corsOptions = {
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // handle preflight

// ✅ Stripe Webhook (MUST be before express.json)
app.post(
  "/api/webhook/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhooks
);

// ✅ Body parser
app.use(express.json());

// ✅ Clerk middleware
app.use(clerkMiddleware());

// ✅ Inngest
app.use("/api/inngest", serve({ client: inngest, functions }));

// ✅ Routes
app.get("/", (req, res) => res.send("API is running ✅"));

app.use("/api/shows", showRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);

// ✅ Start server
connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});