import Show from "../models/Show.js";
import Booking from "../models/Booking.js";
import Stripe from 'stripe';
import { verifyToken } from '@clerk/express';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

/**
 * Helper: extract and verify Clerk token from Authorization header
 * This bypasses req.auth entirely and verifies the token directly
 */
const getUserId = async (req) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

    const token = authHeader.split(' ')[1];

    const payload = await verifyToken(token, {
      secretKey: process.env.CLERK_SECRET_KEY,
    });

    return payload?.sub || null; // Clerk stores userId in the 'sub' field
  } catch (err) {
    console.error("Token verification failed:", err.message);
    return null;
  }
};

/**
 * Checks if the requested seats are already taken in the database
 */
const checkSeatsAvailability = async (showId, selectedSeats) => {
  try {
    const showData = await Show.findById(showId);
    if (!showData) return false;

    const occupiedSeats = showData.occupiedSeats || {};
    const isAnySeatTaken = selectedSeats.some(seat => occupiedSeats[seat]);

    return !isAnySeatTaken;
  } catch (error) {
    return false;
  }
};

/**
 * Creates a new booking and initializes a Stripe Checkout Session
 */
export const createBooking = async (req, res) => {
  try {
    // ✅ Manually verify token — bypasses req.auth conflict
    const userId = await getUserId(req);
    const { showId, selectedSeats } = req.body;

    console.log("userId →", userId); // remove after confirming it works

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Please login to book tickets"
      });
    }

    // Check if seats are still available
    const isAvailable = await checkSeatsAvailability(showId, selectedSeats);
    if (!isAvailable) {
      return res.json({ success: false, message: "Sorry, these seats were just taken." });
    }

    // Fetch Show and Movie details
    const showData = await Show.findById(showId).populate('movie');
    if (!showData) return res.json({ success: false, message: "Show not found." });

    // Create initial Booking record (isPaid: false)
    const booking = await Booking.create({
      user: userId,
      show: showData._id,
      amount: showData.showPrice * selectedSeats.length,
      bookedSeats: selectedSeats,
      isPaid: false
    });

    // Temporarily block seats in the Show model
    selectedSeats.forEach((seat) => {
      showData.occupiedSeats[seat] = userId;
    });
    showData.markModified('occupiedSeats');
    await showData.save();

    // Create Stripe Checkout Session
    const origin = process.env.ORIGIN || "http://localhost:5173";

    const session = await stripe.checkout.sessions.create({
      success_url: `${origin}/loading/my-bookings?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/my-bookings`,
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: showData.movie.title,
            description: `Date: ${showData.date} | Seats: ${selectedSeats.join(', ')}`,
            images: [showData.movie.poster]
          },
          unit_amount: Math.round(showData.showPrice * 100)
        },
        quantity: selectedSeats.length
      }],
      mode: 'payment',
      metadata: {
        bookingId: booking._id.toString(),
        userId: userId
      }
    });

    booking.paymentLink = session.url;
    await booking.save();

    res.json({ success: true, url: session.url });

  } catch (error) {
    console.error("Booking Controller Error:", error.message);
    res.status(500).json({ success: false, message: "Server Error: " + error.message });
  }
};

/**
 * Fetches all occupied seats for a specific show
 */
export const getOccupiedSeats = async (req, res) => {
  try {
    const { showId } = req.params;
    const showData = await Show.findById(showId);

    if (!showData) return res.json({ success: true, occupiedSeats: [] });

    const occupiedSeats = Object.keys(showData.occupiedSeats || {});
    res.json({ success: true, occupiedSeats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Fetches booking history for the logged-in user
 */
export const getUserBookings = async (req, res) => {
  try {
    const userId = await getUserId(req);

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const bookings = await Booking.find({ user: userId })
      .populate({
        path: 'show',
        populate: { path: 'movie' }
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, bookings });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};