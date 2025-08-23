// src/utils/checkAdminStatus.js
import { db } from "../lib/firebase";
import { doc, getDoc } from "firebase/firestore";

export const checkAdminStatus = async (uid) => {
  if (!uid) return false;

  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      return data.role === "admin";   // ✅ role check
    }
    return false;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
};
