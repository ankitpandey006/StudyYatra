// src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const [isAuthorized, setIsAuthorized] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setIsAuthorized(false);
        return;
      }

      try {
        const token = await user.getIdToken();

        if (adminOnly) {
          // Backend secure check
          const res = await fetch("/api/auth/check-admin", {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (res.ok) {
            setIsAuthorized(true);
          } else {
            setIsAuthorized(false);
          }
        } else {
          setIsAuthorized(true); // Normal logged in user
        }
      } catch (err) {
        console.error("Error verifying user:", err);
        setIsAuthorized(false);
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
