import app from "./app.js";
import { config } from "dotenv";
import connectDB from "./configs/database.js";

config()

const PORT = process.env.PORT || 5000
app.listen(PORT, async () => {
    await connectDB()
    console.log(`Server is running in port:${PORT}`);

})
