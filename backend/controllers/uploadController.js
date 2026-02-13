import cloudinary from "../config/cloudinary.js";
import { db } from "../config/firebase.js";

const ALLOWED_TYPES = ["pyq", "notes", "ebook", "audiobook", "quiz"];

const toDate = (v) => {
  if (!v) return null;
  if (typeof v.toDate === "function") return v.toDate();
  return new Date(v);
};

const clean = (s = "") =>
  String(s).trim().replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_\-]/g, "");

/* =====================================================
   ✅ UPLOAD FILE (ADMIN)
===================================================== */
export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const title = (req.body.title || "").toString().trim();
    const description = (req.body.description || "").toString().trim();

    // ✅ CHANGE 1: type always lowercase (PYQ page filters: type=pyq)
    // (tumhare code me already hai - good)
    const type = (req.body.type || "").toString().trim().toLowerCase();

    // ✅ CHANGE 2 (recommended): classLevel normalize to string like "10"/"12"
    // NotesPage uses selectedClass "10"/"12", so keep exact
    const classLevel = String(req.body.classLevel || "").trim();

    // ✅ CHANGE 3 (recommended): subject & language normalize consistently
    // IMPORTANT: PYQPage filtering depends on exact subject text.
    // If upload dropdown uses "Math" but admin sends "Maths", mismatch -> not show in filters/search.
    const subject = String(req.body.subject || "").trim();

    // language must be "hi" or "en" ideally
    const language = String(req.body.language || "").trim().toLowerCase();

    // year for pyq should be string (you later convert to Number in frontend)
    const year = String(req.body.year || "").trim();

    const chapterOrTopic = (req.body.chapterOrTopic || "").toString().trim();

    if (!ALLOWED_TYPES.includes(type)) {
      return res.status(400).json({ success: false, message: "Invalid upload type!" });
    }

    if (!title) {
      return res.status(400).json({ success: false, message: "Title is required!" });
    }

    if (!classLevel || !subject || !language) {
      return res.status(400).json({
        success: false,
        message: "classLevel, subject, language are required!",
      });
    }

    if (type === "pyq" && !year) {
      return res.status(400).json({ success: false, message: "Year is required for PYQ!" });
    }

    // ✅ Cloudinary Folder
    const folder = `studyyatra/${clean(classLevel)}/${clean(subject)}/${clean(type)}`;

    // ✅ IMPORTANT:
    // Use "auto" so PDF opens inline in browser (not forced download)
    const mimetype = req.file.mimetype || "";
    let resource_type = "auto";

    // For audio files use video
    if (type === "audiobook" || mimetype.startsWith("audio/")) {
      resource_type = "video";
    }

    // ✅ Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type,
          use_filename: true,
          unique_filename: true,
        },
        (err, uploaded) => (err ? reject(err) : resolve(uploaded))
      );
      stream.end(req.file.buffer);
    });

    // ✅ Save in Firestore
    const doc = {
      title,
      description,
      type,
      classLevel,
      subject,
      language,

      // ✅ CHANGE 4: year only for pyq (already ok)
      year: type === "pyq" ? year : null,

      // ✅ CHANGE 5: chapter/topic only for notes (already ok)
      chapterOrTopic: type === "notes" ? chapterOrTopic || null : null,

      fileUrl: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
      mimeType: mimetype,
      size: result.bytes || req.file.size,
      folder,

      // ✅ CHANGE 6 (important for public pages):
      // PYQPage / NotesPage fetch only isPublished == true
      isPublished: true,

      // ✅ CHANGE 7 (recommended): Firestore server timestamp best (but this is ok too)
      createdAt: new Date(),

      createdBy: req.user?.uid || null,
    };

    const ref = await db.collection("uploads").add(doc);

    return res.status(200).json({
      success: true,
      message: "Uploaded successfully ✅",
      upload: { id: ref.id, ...doc, createdAt: new Date().toISOString() },
    });
  } catch (error) {
    console.error("🔥 Upload error:", error);
    return res.status(500).json({
      success: false,
      message: "Upload failed",
      error: error.message,
    });
  }
};

/* =====================================================
   ✅ ADMIN LIST
===================================================== */
export const listUploads = async (req, res) => {
  try {
    const snap = await db.collection("uploads").orderBy("createdAt", "desc").get();

    const uploads = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        createdAt: toDate(data.createdAt)?.toISOString() || null,
      };
    });

    return res.json({ success: true, uploads });
  } catch (error) {
    console.error("🔥 List error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch uploads",
      error: error.message,
    });
  }
};

/* =====================================================
   ✅ PUBLIC LIST (USER SIDE)
===================================================== */
export const listPublicUploads = async (req, res) => {
  try {
    const { type, classLevel, subject, language, year } = req.query;

    let q = db.collection("uploads").where("isPublished", "==", true);

    // ✅ CHANGE 8: type normalize to lower (already done - good)
    if (type) q = q.where("type", "==", String(type).toLowerCase());

    // ✅ CHANGE 9: classLevel/subject/language should match saved values EXACTLY.
    // Agar admin uploads me "Class 10" save ho gaya, aur frontend "10" bhej raha,
    // to mismatch => empty.
    if (classLevel) q = q.where("classLevel", "==", String(classLevel).trim());

    if (subject) q = q.where("subject", "==", String(subject).trim());

    if (language) q = q.where("language", "==", String(language).trim().toLowerCase());

    if (year) q = q.where("year", "==", String(year).trim());

    q = q.orderBy("createdAt", "desc");

    const snap = await q.get();

    const uploads = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        createdAt: toDate(data.createdAt)?.toISOString() || null,
      };
    });

    return res.json({ success: true, uploads });
  } catch (error) {
    console.error("🔥 Public list error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch uploads",
      error: error.message,
    });
  }
};

/* =====================================================
   ✅ DELETE FILE (ADMIN)
===================================================== */
export const deleteUpload = async (req, res) => {
  try {
    const { id } = req.params;

    const docRef = db.collection("uploads").doc(id);
    const snap = await docRef.get();

    if (!snap.exists) {
      return res.status(404).json({ success: false, message: "Upload not found" });
    }

    const data = snap.data();
    const pid = data.publicId || null;
    const rt = data.resourceType || "auto";

    if (pid) {
      await cloudinary.uploader.destroy(pid, { resource_type: rt });
    }

    await docRef.delete();

    return res.json({ success: true, message: "Deleted successfully ✅" });
  } catch (error) {
    console.error("🔥 Delete error:", error);
    return res.status(500).json({
      success: false,
      message: "Delete failed",
      error: error.message,
    });
  }
};
