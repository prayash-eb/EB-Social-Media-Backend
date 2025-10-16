import { v2 as cloudinaryCloud } from "cloudinary";
import { config } from "dotenv";
config();

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME!;
const API_KEY = process.env.CLOUDINARY_API_KEY!;
const API_SECRET = process.env.CLOUDINARY_API_SECRET!;

cloudinaryCloud.config({
    cloud_name: CLOUD_NAME,
    api_secret: API_SECRET,
    api_key: API_KEY,
    secure: true,
});

export default cloudinaryCloud;
