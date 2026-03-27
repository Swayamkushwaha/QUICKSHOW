import Booking from "../models/Booking.js";
import Show from "../models/Show.js";
import User from "../models/User.js";

// 🛡️ 1. Verify Admin Status
export const isAdmin = async (req, res) => {
  res.json({ success: true, isAdmin: true });
};

// 🎟️ 2. THE MISSING FUNCTION: Get all bookings
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({})
      .populate("show")
      // .populate("user") // Uncomment this if your Booking model references the User model
      .sort({ createdAt: -1 }); // Sorts by newest first
      
    res.json({ success: true, bookings });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// 🎬 3. Get all shows (Admin view)
export const getAllShows = async (req, res) => {
  try {
    const shows = await Show.find({})
      .populate("movie")
      .sort({ showDateTime: 1 });
    res.json({ success: true, shows });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// 📊 4. Get Dashboard Statistics
export const getDashboardData = async (req, res) => {
  try {
    const paidBookings = await Booking.find({ isPaid: true });
    const activeShows = await Show.find({}).populate("movie").limit(10);
    const totalUser = await User.countDocuments(); 

    res.json({ 
      success: true, 
      dashboardData: {
        totalBookings: paidBookings.length,
        totalRevenue: paidBookings.reduce((acc, b) => acc + b.amount, 0),
        activeShows,
        totalUser
      } 
    });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};