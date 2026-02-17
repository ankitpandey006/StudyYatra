import { useEffect, useState } from "react";
import axios from "axios";
import { getAuth, onAuthStateChanged } from "firebase/auth";

const API_URL = import.meta.env.VITE_API_URL;

// ✅ helper: safely join base + path
const api = (path = "") => {
  if (!API_URL) return path;
  const base = API_URL.replace(/\/+$/, "");
  const p = String(path).startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
};

export const usePremium = () => {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    let alive = true;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!alive) return;

      if (!user) {
        setIsPremium(false);
        setLoading(false);
        return;
      }

      // ✅ env missing safety
      if (!API_URL) {
        console.error("VITE_API_URL missing. Cannot check premium status.");
        setIsPremium(false);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const token = await user.getIdToken();

        const { data } = await axios.get(api("/api/me"), {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!alive) return;
        setIsPremium(!!data?.isPremium);
      } catch (err) {
        console.error("Premium check error:", err);
        if (!alive) return;
        setIsPremium(false);
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    });

    return () => {
      alive = false;
      unsubscribe();
    };
  }, []);

  return { isPremium, loading };
};
