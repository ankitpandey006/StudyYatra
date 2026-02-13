import multer from "multer";

// Memory storage (file RAM me store hogi temporarily)
const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB limit
});

export default upload;
