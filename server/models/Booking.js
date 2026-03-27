import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    user: { type: String, required: true },
    show: { 
        type: mongoose.Schema.Types.ObjectId, // ✅ Changed to ObjectId
        required: true,
        ref: "Show" 
    },
    amount: { type: Number, required: true },
    bookedSeats: [{ type: String, required: true }],
    isPaid: { type: Boolean, default: false },
    paymentLink: { type: String },
    paymentStatus: {
        type: String,
        enum: ['pending', 'completed', 'failed'],
        default: 'pending'
    }
}, { timestamps: true });

const Booking = mongoose.model("Booking", bookingSchema);
export default Booking;