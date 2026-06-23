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

    const adminEmails = [
      "swayamkushwaha605@gmail.com",
      process.env.ADMIN_EMAIL
    ].filter(Boolean).map(email => email.toLowerCase());

    const userEmails = user.emailAddresses?.map(e => e.emailAddress.toLowerCase()) || [];
    const isEmailAdmin = userEmails.some(email => adminEmails.includes(email));

    if (user.privateMetadata.role === "admin" || isEmailAdmin) {
      req.userId = userId;
      return next();
    }

    return res.json({ success: false, message: "not authorized" });

  } catch (error) {
    return res.json({ success: false, message: "not authorized" });
  }
};