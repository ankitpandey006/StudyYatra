import { useEffect, useState } from "react";
import axios from "axios";
import { getAuth } from "firebase/auth";

const API_URL = import.meta.env.VITE_API_URL;

export const usePremium = () => {
  const [isPremium, setIsPremium] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPremium = async () => {
      try {
        const user = getAuth().currentUser;
        if (!user) return setLoading(false);

        const token = await user.getIdToken();

        const { data } = await axios.get(`${API_URL}/api/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setIsPremium(data.isPremium);
      } catch (err) {
        console.error("Premium check error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPremium();
  }, []);

  return { isPremium, loading };
};