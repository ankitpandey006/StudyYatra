// backend/config/firebase.js
import admin from "firebase-admin";
import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

dotenv.config();

// __dirname setup for ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let serviceAccount;

if (process.env.GOOGLE_SERVICE_ACCOUNT) {
  // Production: Environment variable
  serviceAccount = JSON.parse(
    Buffer.from(process.env.GOOGLE_SERVICE_ACCOUNT, "base64").toString("utf8")
  );
} else {
  // Local: JSON file
  const serviceAccountPath = path.join(__dirname, "../serviceAccountKey.json");
  serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
}

// Initialize Firebase only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
}

// Firestore, Auth, Storage
const db = admin.firestore();
const auth = admin.auth();
const bucket = admin.storage().bucket();

// ✅ Export everything including admin
export { admin, db, auth, bucket };
