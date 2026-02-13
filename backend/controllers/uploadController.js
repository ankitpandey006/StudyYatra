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

/* ===============================
   ✅ QUIZ HELPERS
================================ */
const parseJsonBuffer = (buffer) => {
  const raw = buffer?.toString("utf8") || "";
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("Invalid JSON file. Please upload a valid .json quiz file.");
  }
};

const normalizeQuestions = (payload) => {
  // Accept: [ ... ] OR { questions: [ ... ] }
  const questions = Array.isArray(payload) ? payload : payload?.questions;

  if (!Array.isArray(questions)) {
    throw new Error('Quiz JSON must be an array OR { "questions": [...] }');
  }
  if (questions.length === 0) {
    throw new Error("Quiz must contain at least 1 question.");
  }

  return questions.map((q, idx) => {
    const questionText = q?.question ?? q?.q ?? q?.title;
    const options = q?.options ?? q?.choices;
    const answer = q?.answer ?? q?.correctAnswer ?? q?.correctOption;

    if (!questionText || typeof questionText !== "string") {
      throw new Error(`Question #${idx + 1}: missing question text`);
    }
    if (!Array.isArray(options) || options.length < 2) {
      throw new Error(`Question #${idx + 1}: options must be an array (min 2)`);
    }

    // allow answer as string(option) OR number(index)
    let correctIndex = -1;
    if (typeof answer === "string") {
      correctIndex = options.indexOf(answer);
    } else if (Number.isInteger(answer)) {
      correctIndex = answer;
    }

    if (correctIndex < 0 || correctIndex >= options.length) {
      throw new Error(`Question #${idx + 1}: invalid answer`);
    }

    return {
      question: String(questionText).trim(),
      options,
      correctIndex,
      explanation: q?.explanation ? String(q.explanation) : "",
    };
  });
};

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
    const type = (req.body.type || "").toString().trim().toLowerCase();
    const classLevel = (req.body.classLevel || "").toString().trim();
    const subject = (req.body.subject || "").toString().trim();
    const language = (req.body.language || "").toString().trim();
    const year = (req.body.year || "").toString().trim();
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

    /* ===============================
       ✅ QUIZ: Parse JSON -> Save to Firestore quizzes
       (Skip Cloudinary upload)
    ================================ */
    if (type === "quiz") {
      const nameOk = req.file.originalname?.toLowerCase().endsWith(".json");
      const mimeOk =
        req.file.mimetype === "application/json" ||
        req.file.mimetype === "" ||
        req.file.mimetype === "text/plain"; // some systems

      if (!nameOk) {
        return res.status(400).json({ success: false, message: "Quiz file must be a .json file" });
      }
      if (!mimeOk) {
        // not strict, but helps
        return res.status(400).json({ success: false, message: "Invalid quiz file type" });
      }

      // 1) parse json from memory buffer (your multer is memoryStorage because you use req.file.buffer)
      const payload = parseJsonBuffer(req.file.buffer);

      // 2) normalize + validate questions
      const questions = normalizeQuestions(payload);

      // 3) save quiz doc
      const quizDoc = {
        title,
        description,
        type: "quiz",
        classLevel,
        subject,
        language,
        year: year || null, // optional for quiz
        chapterOrTopic: chapterOrTopic || null, // optional

        questions,
        questionCount: questions.length,

        isPublished: true,
        createdAt: new Date(),
        createdBy: req.user?.uid || null,
      };

      const ref = await db.collection("quizzes").add(quizDoc);

      // (Optional) also keep a lightweight entry in uploads for manage page consistency
      // Uncomment if you want quiz also visible in /admin/manage:
      /*
      const uploadsDoc = {
        title,
        description,
        type: "quiz",
        classLevel,
        subject,
        language,
        year: year || null,
        chapterOrTopic: chapterOrTopic || null,
        fileUrl: null,
        publicId: null,
        resourceType: null,
        mimeType: req.file.mimetype || "application/json",
        size: req.file.size || null,
        folder: null,
        isPublished: true,
        createdAt: new Date(),
        createdBy: req.user?.uid || null,
        quizId: ref.id,
        questionCount: questions.length,
      };
      await db.collection("uploads").add(uploadsDoc);
      */

      return res.status(200).json({
        success: true,
        message: "Quiz saved to Firestore ✅",
        quiz: { id: ref.id, ...quizDoc, createdAt: new Date().toISOString() },
      });
    }

    /* ===============================
       ✅ NON-QUIZ: Upload to Cloudinary -> Save to Firestore uploads
    ================================ */

    // ✅ Cloudinary Folder
    const folder = `studyyatra/${clean(classLevel)}/${clean(subject)}/${clean(type)}`;

    // ✅ IMPORTANT: Use "auto" so PDF opens inline in browser
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
      year: type === "pyq" ? year : null,
      chapterOrTopic: type === "notes" ? chapterOrTopic || null : null,

      fileUrl: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
      mimeType: mimetype,
      size: result.bytes || req.file.size,
      folder,

      isPublished: true,
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

    if (type) q = q.where("type", "==", String(type).toLowerCase());
    if (classLevel) q = q.where("classLevel", "==", String(classLevel));
    if (subject) q = q.where("subject", "==", String(subject));
    if (language) q = q.where("language", "==", String(language));
    if (year) q = q.where("year", "==", String(year));

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