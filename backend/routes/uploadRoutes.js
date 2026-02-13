import express from "express";
import upload from "../middlewares/upload.js";
import { verifyToken, requireAdmin } from "../middlewares/authMiddleware.js";
import {
  uploadFile,
  listUploads,
  deleteUpload,
  listPublicUploads, // ✅ NEW
} from "../controllers/uploadController.js";

const router = express.Router();

// ✅ PUBLIC (Users): section-wise list
// /api/upload/public?type=notes&classLevel=10&subject=Science&language=hi
router.get("/public", listPublicUploads);

// ✅ ADMIN ONLY
router.post("/", verifyToken, requireAdmin, upload.single("file"), uploadFile);
router.get("/", verifyToken, requireAdmin, listUploads);
router.delete("/:id", verifyToken, requireAdmin, deleteUpload);

export default router;
