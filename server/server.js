import express from "express";
import cors from "cors";
import "dotenv/config";
import { clerkMiddleware } from "@clerk/express";
import { Webhook } from "svix";                          // ← add this
import connectDB from "./configs/db.js";
import { serve } from "inngest/express";
import { inngest, functions } from "./inngest/index.js";

import showRouter from "./routes/showRoutes.js";
import bookingRouter from "./routes/bookingRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import userRouter from "./routes/userRoutes.js";
import { stripeWebhooks } from "./controllers/stripeWebhooks.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.set("trust proxy", 1);

const allowedOrigins = process.env.ORIGIN
  ? process.env.ORIGIN.split(",")
  : ["http://localhost:5173"];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
}));

// ⚠️ RAW BODY ROUTES — must be before express.json()

// Stripe webhook
app.post("/api/webhook/stripe", express.raw({ type: "application/json" }), stripeWebhooks);

// Clerk webhook (secure with svix verification)
app.post("/api/webhooks/clerk", express.raw({ type: "application/json" }), async (req, res) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) return res.status(500).json({ error: "Missing CLERK_WEBHOOK_SECRET" });

  const svix_id        = req.headers["svix-id"];
  const svix_timestamp = req.headers["svix-timestamp"];
  const svix_signature = req.headers["svix-signature"];

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ error: "Missing svix headers" });
  }

  let evt;
  try {
    const wh = new Webhook(WEBHOOK_SECRET);
    evt = wh.verify(req.body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("❌ Webhook verification failed:", err.message);
    return res.status(400).json({ error: "Invalid signature" });
  }

  await inngest.send({ name: `clerk/${evt.type}`, data: evt.data });
  console.log(`✅ Forwarded to Inngest: clerk/${evt.type}`);
  return res.status(200).json({ received: true });
});

// ✅ JSON middleware — after raw routes
app.use(express.json());
app.use(clerkMiddleware());

// Inngest
app.use("/api/inngest", serve({ client: inngest, functions }));

app.get("/", (req, res) => res.send("API is running ✅"));
app.use("/api/shows", showRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/admin", adminRouter);
app.use("/api/user", userRouter);

connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}).catch(() => process.exit(1));