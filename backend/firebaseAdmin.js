import admin from "firebase-admin";

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
    storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`, // ✅ Bucket set
  });
}

export const db = admin.firestore();
export const auth = admin.auth();

// ✅ Pass bucket name here
export const bucket = admin.storage().bucket(`${process.env.FIREBASE_PROJECT_ID}.appspot.com`);
