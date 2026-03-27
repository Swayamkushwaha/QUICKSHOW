import { clerkClient } from "@clerk/express";

// ✅ USER PROTECT (for favorites, bookings, etc.)
export const protectUser = async (req, res, next) => {
  try {
    const { userId } = req.auth();

    if (!userId) {
      return res.json({ success: false, message: "Not authorized" });
    }

    req.userId = userId; // ✅ store for controller
    next();

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Auth failed" });
  }
};


// ✅ ADMIN PROTECT
export const protectAdmin = async (req, res, next) => {
  try {
    const { userId } = req.auth();

    const user = await clerkClient.users.getUser(userId);

    if (user.privateMetadata.role !== "admin") {
      return res.json({ success: false, message: "not authorized" });
    }

    req.userId = userId;
    next();

  } catch (error) {
    return res.json({ success: false, message: "not authorized" });
  }
};