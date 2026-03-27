import Stripe from "stripe";
import Booking from "../models/Booking.js";

export const stripeWebhooks = async (request, response) => {
  const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sig = request.headers["stripe-signature"];

  let event;

  // ✅ FIX 1: request.body must be raw buffer — see server.js webhook route
  try {
    event = stripeInstance.webhooks.constructEvent(
      request.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    console.error("Webhook signature error:", error.message);
    return response.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    switch (event.type) {

      // ✅ FIX 2: listen to checkout.session.completed, not payment_intent.succeeded
      // This fires immediately when Stripe confirms payment is complete
      case "checkout.session.completed": {
        const session = event.data.object;
        const { bookingId } = session.metadata;

        if (!bookingId) {
          console.error("No bookingId in session metadata");
          break;
        }

        await Booking.findByIdAndUpdate(bookingId, {
          isPaid: true,
          paymentLink: "",
        });

        console.log("Booking marked as paid:", bookingId);
        break;
      }

      default:
        console.log("Unhandled event type:", event.type);
    }

    response.json({ received: true });

  } catch (error) {
    // ✅ FIX 3: was using undefined 'err' variable — now correctly uses 'error'
    console.error("Webhook processing error:", error);
    response.status(500).send("Internal Server Error");
  }
};