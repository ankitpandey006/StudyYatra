// src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Navigate, useLocation } from "react-router-dom";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050";

// ✅ simple session cache for admin check
const ADMIN_CACHE_KEY = "isAdminVerified";
const ADMIN_CACHE_TTL_MS = 5 * 60 * 1000; // 5 min

const readAdminCache = () => {
  try {
    const raw = sessionStorage.getItem(ADMIN_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.value) return null;
    if (Date.now() - parsed.ts > ADMIN_CACHE_TTL_MS) return null;
    return true;
  } catch {
    return null;
  }
};

const writeAdminCache = (val) => {
  try {
    sessionStorage.setItem(
      ADMIN_CACHE_KEY,
      JSON.stringify({ value: !!val, ts: Date.now() })
    );
  } catch {}
};

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const [isAuthorized, setIsAuthorized] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const auth = getAuth();
    let alive = true;
    const controller = new AbortController();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!alive) return;

      if (!user) {
        setIsAuthorized(false);
        return;
      }

      try {
        // ✅ Fast path: normal user
        if (!adminOnly) {
          setIsAuthorized(true);
          return;
        }

        // ✅ Cached admin check
        const cached = readAdminCache();
        if (cached) {
          setIsAuthorized(true);
          return;
        }

        // ✅ Get token (forceRefresh = false)
        const token = await user.getIdToken(false);

        // ✅ Backend secure check (with API_URL + abort)
        const res = await fetch(`${API_URL}/api/auth/check-admin`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
          signal: controller.signal,
        });

        const ok = res.ok;
        if (!alive) return;

        setIsAuthorized(ok);
        if (ok) writeAdminCache(true);
      } catch (err) {
        if (!alive) return;
        // Abort error ignore
        if (err?.name === "AbortError") return;
        console.error("Error verifying user:", err);
        setIsAuthorized(false);
      }
    });

    return () => {
      alive = false;
      controller.abort();
      unsubscribe();
    };
  }, [adminOnly]);

  if (isAuthorized === null) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center text-lg text-gray-600">
        🔐 Checking access permissions...
      </div>
    );
  }

  if (!isAuthorized) {
    // ✅ user ko jis page pe jana tha, login ke baad wapas bhejne ke liye
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default ProtectedRoute;