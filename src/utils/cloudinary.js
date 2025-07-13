import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        const response = await cloudinary.uploader.upload(localFilePath, { resource_type: "auto" });
        fs.unlinkSync(localFilePath);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath); // remove the locally saved temp file as the upload failed
        console.error("file upload failed: ", error);
        return null;
    }
};

const deleteImageOnCloudinary = async (url) => {
    try {
        if (!url) throw new Error("url is empty");
        const publicId = url.substring((url.lastIndexOf("/") + 1), url.lastIndexOf("."));
        const response = await cloudinary.uploader.destroy(publicId);
        return response;
    } catch (error) {
        console.error("file deletion failed: ", error);
        return null;
    }
}

export { uploadOnCloudinary, deleteImageOnCloudinary };
