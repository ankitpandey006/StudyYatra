// backend/controllers/uploadController.js
import { bucket, db } from "../config/firebase.js";
import { v4 as uuidv4 } from "uuid";

// 📂 Upload PDF to Firebase Storage
export const uploadPDF = async (req, res) => {
  try {
    // ✅ Check if file exists
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const file = req.file;
    const fileName = `${Date.now()}-${file.originalname}`;
    const fileUpload = bucket.file(fileName);

    // ✅ Upload file buffer to Firebase Storage
    await fileUpload.save(file.buffer, {
      metadata: {
        contentType: file.mimetype,
        metadata: {
          firebaseStorageDownloadTokens: uuidv4(), // token for public access
        },
      },
    });

    // ✅ Generate Public URL
    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileName)}?alt=media`;

    // ✅ Save file metadata to Firestore
    await db.collection("pdfFiles").add({
      name: file.originalname,
      url: publicUrl,
      type: file.mimetype,
      size: file.size,
      createdAt: new Date(),
    });

    // ✅ Response
    return res.status(200).json({
      success: true,
      message: "File uploaded successfully ✅",
      url: publicUrl,
    });

  } catch (error) {
    console.error("🔥 Upload error:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Something went wrong during upload",
    });
  }
};
