import express from "express";
import {
  createBooking,
  getOccupiedSeats,
  getUserBookings,
} from "../controllers/bookingController.js";

const router = express.Router();

// Public route — no auth needed
router.get("/seats/:showId", getOccupiedSeats);

// Protected routes — auth is handled inside the controller
// using verifyToken() directly from @clerk/express
router.post("/create", createBooking);
router.get("/user", getUserBookings);

export default router;