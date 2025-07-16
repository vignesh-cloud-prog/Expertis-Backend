const { v2: cloudinary } = require('cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadImage(imagePath, publicId = undefined, options = {}) {
    try {
        const uploadOptions = { ...options };
        if (publicId) uploadOptions.public_id = publicId;
        const result = await cloudinary.uploader.upload(imagePath, uploadOptions);
        return result;
    } catch (error) {
        throw error;
    }
}

module.exports = { cloudinary, uploadImage }; 