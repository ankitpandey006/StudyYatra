import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase'; // ✅ FIXED PATH
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

const AuthContext = createContext();

// 🔁 Hook: Access AuthContext
export const useAuth = () => useContext(AuthContext);

// ✅ Helper: check if user's premium is still valid
const isPremiumActive = (user) => {
  if (!user?.isPremium || !user?.expiresAt) return false;
  return new Date(user.expiresAt) > new Date();
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔄 Listen to Firebase Auth
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // 🔄 Listen to Firestore user document
        const userDocRef = doc(db, 'users', user.email);

        const unsubscribeFirestore = onSnapshot(userDocRef, (docSnap) => {
          const firestoreData = docSnap.data() || {};
          const premiumStatus = isPremiumActive(firestoreData);

          setCurrentUser({
            uid: user.uid,
            email: user.email,
            displayName:
              user.displayName || firestoreData.firstName || firestoreData.name || '',
            ...firestoreData,
            isPremium: premiumStatus,
            isAdmin: firestoreData.role === 'admin',
          });
          setLoading(false);
        });

        return () => unsubscribeFirestore();
      } else {
        setCurrentUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
