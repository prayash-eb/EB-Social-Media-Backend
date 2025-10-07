import mongoose from "mongoose";

export default async function connectDB() {
    try {
        const DB_URL = process.env.DATABASE_URL!
        mongoose.connection.on("connected", () => {
            console.log("Database Connected");
        })
        await mongoose.connect(DB_URL, {
            dbName: "social-media",
            serverSelectionTimeoutMS: 5000,
        })

    } catch (error) {
        console.log("Error while connecting database", error);
        process.exit(1)
    }
}