import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

export async function connectDatabase(): Promise<void> {
    const uri = "mongodb://127.0.0.1:27017/expense-manager"// (process.env.MONGODB_URI || process.env.MONGO_URI)?.trim();
    console.log({ uri, env: process.env.NODE_ENV, uri2: process.env.MONGODB_URI });

    if (!uri) {
        throw new Error("MONGODB_URI missing in .env");
    }

    try {
        await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 10000,
            connectTimeoutMS: 10000,
        });
        console.log(`✅ MongoDB connected to ${mongoose.connection.host}`);
    } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error(`❌ MongoDB connection failed: ${message}`);
    }
}
