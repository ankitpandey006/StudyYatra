// Centralized API URL for frontend
export const API = import.meta.env.VITE_API_URL;

// Helper to safely join base URL and path (avoids duplicate slashes)
export const apiJoin = (path = "") => {
  if (!API) return path;
  const base = String(API).replace(/\/+$/g, "");
  const p = String(path).startsWith("/") ? path : `/${path}`;
  return `${base}${p}`;
};
