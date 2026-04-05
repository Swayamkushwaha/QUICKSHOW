import express from "express";
import { Webhook } from "svix";
import { inngest } from "../inngest/index.js";

const router = express.Router();

router.post("/", express.raw({ type: "application/json" }), async (req, res) => {

  // 1. Check secret exists
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  if (!WEBHOOK_SECRET) {
    return res.status(500).json({ error: "Missing CLERK_WEBHOOK_SECRET" });
  }

  // 2. Get Svix headers sent by Clerk
  const svix_id        = req.headers["svix-id"];
  const svix_timestamp = req.headers["svix-timestamp"];
  const svix_signature = req.headers["svix-signature"];

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ error: "Missing svix headers" });
  }

  // 3. Verify the webhook is genuinely from Clerk
  let evt;
  try {
    const wh = new Webhook(WEBHOOK_SECRET);
    evt = wh.verify(req.body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("❌ Clerk webhook verification failed:", err.message);
    return res.status(400).json({ error: "Invalid signature" });
  }

  // 4. Forward the verified event to Inngest
  await inngest.send({
    name: `clerk/${evt.type}`,  // "clerk/user.created" / "clerk/user.updated" / "clerk/user.deleted"
    data: evt.data,
  });

  console.log(`✅ Forwarded to Inngest: clerk/${evt.type}`);
  return res.status(200).json({ received: true });
});

export default router;