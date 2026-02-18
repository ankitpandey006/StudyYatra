// backend/config/firebase.js
import admin from "firebase-admin";

const {
  FIREBASE_PROJECT_ID,
  FIREBASE_CLIENT_EMAIL,
  FIREBASE_PRIVATE_KEY,
  FIREBASE_STORAGE_BUCKET,
} = process.env;

if (!FIREBASE_PROJECT_ID || !FIREBASE_CLIENT_EMAIL || !FIREBASE_PRIVATE_KEY) {
  throw new Error(
    "❌ Missing Firebase ENV variables (PROJECT_ID / CLIENT_EMAIL / PRIVATE_KEY)"
  );
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: FIREBASE_PROJECT_ID,
      clientEmail: FIREBASE_CLIENT_EMAIL,
      privateKey: FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),

    // 🔥 Optional (since you use Cloudinary)
    ...(FIREBASE_STORAGE_BUCKET && {
      storageBucket: FIREBASE_STORAGE_BUCKET,
    }),
  });

  console.log("✅ Firebase Admin Initialized");
}

// 🔥 Safe exports
const db = admin.firestore();
const auth = admin.auth();

// Storage optional — only create if bucket exists
const bucket = FIREBASE_STORAGE_BUCKET
  ? admin.storage().bucket()
  : null;

export { admin, db, auth, bucket };
