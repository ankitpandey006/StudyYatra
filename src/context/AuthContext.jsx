import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "../lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// 🔑 Premium checker helper
const isPremiumActive = (user) => {
  if (!user?.isPremium || !user?.expiresAt) return false;
  return new Date(user.expiresAt) > new Date();
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);   // Firebase Auth user
  const [userData, setUserData] = useState(null);         // Firestore user data
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 👇 Firebase Auth state change listener
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user); // ✅ Firebase auth user (uid, email, getIdToken)

        // ✅ हमेशा UID को docId रखो (Best Practice)
        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);

        // ✅ सिर्फ पहली बार user create होने पर ही role assign होगा
        if (!userSnap.exists()) {
          await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            firstName: user.displayName?.split(" ")[0] || "",
            lastName: user.displayName?.split(" ")[1] || "",
            role: "user", // default role सिर्फ नए users के लिए
            createdAt: serverTimestamp(),
          });
        }

        // ✅ Firestore real-time listener
        const unsubscribeFirestore = onSnapshot(userDocRef, (docSnap) => {
          if (!docSnap.exists()) {
            setUserData(null);
            setLoading(false);
            return;
          }

          const firestoreData = docSnap.data();
          const premiumStatus = isPremiumActive(firestoreData);

          setUserData({
            ...firestoreData,
            isPremium: premiumStatus,
            isAdmin: firestoreData.role === "admin",
          });
          setLoading(false);
        });

        return () => unsubscribeFirestore();
      } else {
        // ❌ Logout होने पर reset
        setCurrentUser(null);
        setUserData(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, userData, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
