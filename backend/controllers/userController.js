// controllers/userController.js
import { admin } from "../config/firebase.js"; // firebase.js ESM में होना चाहिए
const db = admin.firestore();

export const getUsers = async (req, res) => {
  try {
    const snapshot = await db.collection("users").get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};

export const updateRole = async (req, res) => {
  try {
    const { uid, role } = req.body;
    await db.collection("users").doc(uid).update({ role });
    res.json({ success: true, message: "Role updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error updating role", error: error.message });
  }
};
