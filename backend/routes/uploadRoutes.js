// routes/uploadRoutes.js
import express from "express";
import multer from "multer";
import { uploadPDF } from "../controllers/uploadController.js";

const router = express.Router();

// ⚡ Use memory storage (we send buffer to Firebase)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// 📂 POST /api/upload
router.post("/", upload.single("file"), uploadPDF);

export default router;
