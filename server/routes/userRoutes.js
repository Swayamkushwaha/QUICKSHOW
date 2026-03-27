import express from "express";
import { getFavorites, getUserBookings, updateFavorite } from "../controllers/userController.js";
import { protectUser } from "../middleware/auth.js"; // ✅ IMPORTANT

const userRouter = express.Router();

// ✅ PROTECTED ROUTES
userRouter.get('/bookings', protectUser, getUserBookings);

userRouter.post('/update-favorite', protectUser, updateFavorite); // ✅ FIXED

userRouter.get('/favorites', protectUser, getFavorites);

export default userRouter;