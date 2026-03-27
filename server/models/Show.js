import mongoose from "mongoose";

const showSchema = new mongoose.Schema(
  {
    movie: {
      type: String,
      required: true,
      ref: "Movie"
    },
    // ✅ FIX: added separate date and time fields
    // so MyBookings can display them without parsing showDateTime
    date: {
      type: String, // e.g. "2026-03-28"
      required: true
    },
    time: {
      type: String, // e.g. "14:30"
      required: true
    },
    showDateTime: {
      type: Date,
      required: true
    },
    showPrice: {
      type: Number,
      required: true
    },
    occupiedSeats: {
      type: Object,
      default: {}
    }
  },
  { minimize: false }
);

const Show = mongoose.model("Show", showSchema);
export default Show;