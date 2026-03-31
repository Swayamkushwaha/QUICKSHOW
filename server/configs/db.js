import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const uri = process.env.MONGODB_URI;
    
    // Disable buffering immediately to stop the 10-second hang
    mongoose.set('bufferCommands', false);

    console.log("⏳ Attempting to connect to MongoDB Atlas...");

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000, // Fail in 5s instead of 10s
      socketTimeoutMS: 45000,         // Close sockets after 45s of inactivity
    });
    
    console.log("✅ MongoDB Atlas Connected Successfully");
  } catch (error) {
    console.error("❌ Database Connection Error:", error.message);
    // If it fails, we want the server to stop so we can see the error
    process.exit(1); 
  }
};

export default connectDB;