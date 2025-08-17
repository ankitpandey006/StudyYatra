// scripts/expirePremiumUsers.js
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

dotenv.config();
const serviceAccount = require('../serviceAccountKey.json');

// 🔐 Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

async function expirePremiumUsers() {
  const snapshot = await db.collection('users')
    .where('isPremium', '==', true)
    .get();

  const now = new Date();
  let updated = 0;

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;

    if (expiresAt && expiresAt < now) {
      await db.collection('users').doc(doc.id).update({
        isPremium: false,
        subscriptionPlan: admin.firestore.FieldValue.delete(),
        subscribedAt: admin.firestore.FieldValue.delete(),
        expiresAt: admin.firestore.FieldValue.delete(),
      });

      console.log(`⛔ Downgraded expired user: ${doc.id}`);
      updated++;
    }
  }

  console.log(`✅ Done! ${updated} users were downgraded.`);
}

expirePremiumUsers().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
