const { updateProfile } = require("./src/controllers/campusController");
// Let's test the uploadBase64ImageToCloudinary helper directly!
// We can copy the logic of uploadBase64ImageToCloudinary to test it.
const cloudinary = require("cloudinary").v2;

const uploadBase64ImageToCloudinary = async (base64Data, folder, publicId) => {
  if (base64Data.startsWith("http://") || base64Data.startsWith("https://")) {
    return base64Data;
  }
  
  const matches = base64Data.match(/^data:image\/([a-zA-Z+]+);base64,/);
  if (!matches) {
    throw new Error("Invalid image format. Must be a valid base64 image string.");
  }
  
  const ext = matches[1].toLowerCase();
  if (!["jpeg", "jpg", "png", "webp"].includes(ext)) {
    throw new Error("Invalid image type. Allowed formats: JPG, JPEG, PNG, WEBP");
  }

  const sizeInBytes = base64Data.length * 0.75;
  if (sizeInBytes > 5 * 1024 * 1024) {
    throw new Error("Image size exceeds the 5MB limit.");
  }

  const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;
  console.log("hasCloudinary:", hasCloudinary);
  
  if (hasCloudinary) {
    try {
      const result = await cloudinary.uploader.upload(base64Data, {
        resource_type: "image",
        folder: folder,
        public_id: `${publicId}_${Date.now()}`
      });
      return result.secure_url;
    } catch (err) {
      console.warn("Cloudinary upload failed, using local fallback:", err.message);
    }
  }

  // Fallback: Local static storage
  try {
    const fs = require("fs");
    const path = require("path");
    const base64Content = base64Data.replace(/^data:image\/[a-zA-Z+]+;base64,/, "");
    const buffer = Buffer.from(base64Content, "base64");
    
    const dir = path.join(__dirname, "public/uploads");
    console.log("Saving locally to dir:", dir);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const fileName = `${publicId}_${Date.now()}.${ext}`;
    const filePath = path.join(dir, fileName);
    
    fs.writeFileSync(filePath, buffer);
    console.log("Saved local file:", filePath);
    return `http://localhost:5000/uploads/${fileName}`;
  } catch (err) {
    console.error("Local file uploader fallback failed:", err);
    throw new Error("Image storage failed.");
  }
};

const dummyBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

uploadBase64ImageToCloudinary(dummyBase64, "test_photos", "test_id")
  .then(url => {
    console.log("TEST UPLOAD SUCCESS! URL:", url);
    process.exit(0);
  })
  .catch(err => {
    console.error("TEST UPLOAD FAILED:", err);
    process.exit(1);
  });
