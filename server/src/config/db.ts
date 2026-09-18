import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export async function connectDatabase(): Promise<void> {
    const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
    if (!uri) {
        throw new Error("MONGODB_URI missing in .env");
    }

    await mongoose.connect(uri);
    console.log("MongoDB Database connected");
}
