import { Inngest } from "inngest";
import User from "../models/User.js";
import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import connectDB from "../configs/db.js";
import { sendBookingConfirmationEmail } from "../configs/emailService.js";

export const inngest = new Inngest({ id: "movie-ticket-booking" });

/* ---------------- USER CREATION ---------------- */

export const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    await connectDB();
    const data = event.data;
    const userData = {
      _id: data.id,
      name: `${data.first_name || ""} ${data.last_name || ""}`,
      email: data.email_addresses?.[0]?.email_address || "noemail@test.com",
      image: data.image_url || ""
    };
    try {
      const user = await User.findByIdAndUpdate(userData._id, userData, { upsert: true, new: true });
      console.log("User synced:", user);
    } catch (error) {
      console.log("User creation error:", error);
    }
  }
);

/* ---------------- USER DELETION ---------------- */

export const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { id } = event.data;
    try {
      await User.findByIdAndDelete(id);
      console.log("User deleted:", id);
    } catch (error) {
      console.log("User deletion error:", error);
    }
  }
);

/* ---------------- USER UPDATE ---------------- */

export const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } = event.data;
    const userData = {
      email: email_addresses?.[0]?.email_address,
      name: `${first_name || ""} ${last_name || ""}`,
      image: image_url,
    };
    try {
      await User.findByIdAndUpdate(id, userData, { new: true });
      console.log("User updated:", id);
    } catch (error) {
      console.log("User update error:", error);
    }
  }
);

/* ---------------- SEAT HOLD RELEASE (5 mins) ---------------- */
// Triggered when a booking is created (seats are held)
// If payment is not completed within 5 minutes:
//   1. Delete the unpaid booking
//   2. Release the held seats back in the Show model

export const releaseSeatsAfterTimeout = inngest.createFunction(
  { id: "release-seats-after-timeout" },
  { event: "booking/seats.held" },
  async ({ event, step }) => {
    await connectDB();

    const { bookingId, showId, seats } = event.data;

    // ✅ Wait 5 minutes before checking payment status
    await step.sleep("wait-5-minutes", "5m");

    // ✅ Check if booking was paid within the 5 minutes
    const booking = await step.run("check-payment-status", async () => {
      return await Booking.findById(bookingId);
    });

    // If booking doesn't exist or is already paid — do nothing
    if (!booking || booking.isPaid) {
      console.log(`Booking ${bookingId} is paid or gone — seats kept.`);
      return { released: false };
    }

    // ✅ Payment not completed — release the seats
    await step.run("release-seats", async () => {
      const show = await Show.findById(showId);
      if (!show) return;

      // Remove each held seat from occupiedSeats map
      seats.forEach(seat => {
        delete show.occupiedSeats[seat];
      });

      show.markModified("occupiedSeats");
      await show.save();
      console.log(`Released seats ${seats.join(", ")} for show ${showId}`);
    });

    // ✅ Delete the unpaid booking record
    await step.run("delete-unpaid-booking", async () => {
      await Booking.findByIdAndDelete(bookingId);
      console.log(`Deleted unpaid booking ${bookingId}`);
    });

    return { released: true, seats, bookingId };
  }
);

/* ---------------- SEND BOOKING CONFIRMATION EMAIL ---------------- */
// Triggered by stripeWebhooks after checkout.session.completed
// Fetches full booking details and sends a beautiful HTML email

export const sendBookingEmail = inngest.createFunction(
  { id: "send-booking-confirmation-email" },
  { event: "booking/confirmed" },
  async ({ event }) => {
    await connectDB();

    const { email, bookingId } = event.data;

    const booking = await Booking.findById(bookingId)
      .populate({ path: 'show', populate: { path: 'movie' } });

    if (!booking) {
      console.error("Booking not found for email:", bookingId);
      return { sent: false };
    }

    await sendBookingConfirmationEmail({ to: email, booking });

    return { sent: true, to: email };
  }
);

/* ---------------- EXPORT ALL FUNCTIONS ---------------- */

export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
  releaseSeatsAfterTimeout,
  sendBookingEmail,        // ✅ send email after payment
];