import { config } from "dotenv";
config()

import app from "./app.js";
import connectDB from "./configs/database.js";

const PORT = process.env.PORT || 5000
app.listen(PORT, async () => {
    await connectDB()
    console.log(`Server is running in port:${PORT}`);
})
