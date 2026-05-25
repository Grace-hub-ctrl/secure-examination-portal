import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = (process.env.MONGODB_URI || "mongodb://localhost:27017/exam-platform").trim();

export const connectDB = async () => {
  try {
    console.log("Connecting to MongoDB...");
    // Validate URI structure if it's mongodb+srv
    if (MONGODB_URI.startsWith("mongodb+srv://")) {
      const parts = MONGODB_URI.split("@");
      if (parts.length > 1) {
        const hostPart = parts[1].split("/")[0];
        if (hostPart.includes(",")) {
          throw new Error("mongodb+srv URI cannot have multiple hosts. For multiple hosts, use the standard mongodb:// protocol.");
        }
      }
    }
    
    const conn = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 10000,
    });
    console.log(`MongoDB Connected Successfully: ${conn.connection.host}`);
  } catch (error: any) {
    let errorMessage = error.message || "Unknown error";
    
    console.error("CRITICAL: MongoDB Connection Failed.");
    console.error("Reason:", errorMessage);
    
    if (MONGODB_URI.includes("localhost") || MONGODB_URI.includes("127.0.0.1")) {
      console.warn("Hint: You are trying to connect to a local MongoDB instance which is likely not available in this environment.");
      console.warn("Please provide a valid MONGODB_URI (e.g., from MongoDB Atlas) in your environment variables.");
    }

    console.info("Info: Falling back to local/mock data mode for frontend functionality.");
  }
};
