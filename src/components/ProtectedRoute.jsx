// components/ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Navigate } from "react-router-dom";
import { checkAdminStatus } from "../utils/checkAdminStatus";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const [isAuthorized, setIsAuthorized] = useState(null); // null = loading, false = unauthorized, true = ok

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setIsAuthorized(false); // Not logged in
        return;
      }

      if (adminOnly) {
        try {
          const isAdmin = await checkAdminStatus(); // Secure check via backend
          setIsAuthorized(isAdmin);
        } catch (err) {
          console.error("Error checking admin status:", err);
          setIsAuthorized(false);
        }
      } else {
        setIsAuthorized(true); // Any authenticated user
      }
    });

    return () => unsubscribe();
  }, [adminOnly]);

  if (isAuthorized === null) {
    return (
      <div className="flex justify-center items-center h-screen text-lg text-gray-600">
        🔐 Checking access permissions...
      </div>
    );
  }

  if (!isAuthorized) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
