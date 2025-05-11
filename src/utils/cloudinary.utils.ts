import { v2 as cloudinary } from "cloudinary";
import { APP_CONFIG } from "../config/app.config";
import fs from "fs";

export const uploadToCloudinary = async (
  tempFilePath: string,
  options: {
    folderName: string;
    resourceType: "image" | "video" | "raw";
    format?: string;
    overwrite?: boolean;
    public_id?: string;
  }
) => {
  try {
    cloudinary.config({
      cloud_name: APP_CONFIG.CLOUDINARY_NAME,
      api_key: APP_CONFIG.CLOUDINARY_API_KEY,
      api_secret: APP_CONFIG.CLOUDINARY_SECRET,
    });

    if (!fs.existsSync(tempFilePath)) {
      throw new Error(`File not found: ${tempFilePath}`);
    }

    const result = await cloudinary.uploader.upload(tempFilePath, {
      use_filename: true,
      folder: options.folderName,
      chunk_size: 6000000,
      resource_type: options.resourceType,
    });

    fs.unlinkSync(tempFilePath);

    return result.secure_url;
  } catch (error) {
    console.log({error});
    throw error;
  }
};

