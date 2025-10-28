import {v2 as cloudinary } from "cloudinary"
import dotenv from "dotenv"
import fs from "fs"

dotenv.config()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

export const uploadToCloudinary = async (localFilePath,folder="campus-marketplace") => {
    try {
        //upload to cloudinary
        const result = await cloudinary.uploader.upload(localFilePath, {
            folder: folder,
            resource_type: "auto"
        })
        //file uploaded
        console.log("file uploaded to cloudinary",result.url);
        return result
    } catch (error) {
        //remove file from local uploads folder
        fs.unlinkSync(localFilePath)
        console.error("Error uploading to cloudinary",error);
        throw error
    } 
}