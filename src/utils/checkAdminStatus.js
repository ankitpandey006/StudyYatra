import { getAuth } from "firebase/auth";

export const checkAdminStatus = async () => {
  try {
    const user = getAuth().currentUser;

    if (!user) return false;

    const token = await user.getIdToken();

    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/check-admin`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      console.error("Failed to check admin status:", res.statusText);
      return false;
    }

    const data = await res.json();
    return data.isAdmin === true;
  } catch (error) {
    console.error("Error in checkAdminStatus:", error);
    return false;
  }
};
