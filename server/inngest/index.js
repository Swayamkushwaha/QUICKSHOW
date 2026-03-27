import { Inngest } from "inngest";
import User from "../models/User.js";
import connectDB from "../configs/db.js";   // ADD THIS

// Create Inngest client
export const inngest = new Inngest({ id: "movie-ticket-booking" });

export const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {

    await connectDB();   // ADD THIS

    console.log("Webhook event received:", event);

    const data = event.data;

    const userData = {
      _id: data.id,
      name: `${data.first_name || ""} ${data.last_name || ""}`,
      email: data.email_addresses?.[0]?.email_address || "noemail@test.com",
      image: data.image_url || ""
    };

    try {
      const user = await User.findByIdAndUpdate(
        userData._id,
        userData,
        { upsert: true, new: true }
      );

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

/* ---------------- EXPORT ALL FUNCTIONS ---------------- */

export const functions = [syncUserCreation, syncUserDeletion, syncUserUpdation];