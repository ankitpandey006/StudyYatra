import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { checkAdminStatus } from "../utils/checkAdminStatus";
import Sidebar from "./Sidebar";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const isAdmin = await checkAdminStatus(); // ✅ no need to pass `user`
          if (isAdmin) {
            setIsAuthorized(true);
          } else {
            alert("🚫 Unauthorized: Admin access only.");
            navigate("/");
          }
        } catch (error) {
          console.error("Error checking admin:", error);
          alert("Something went wrong.");
          navigate("/");
        } finally {
          setLoading(false);
        }
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  if (loading) return <div className="p-10 text-xl">⏳ Loading Admin Dashboard...</div>;

  if (!isAuthorized) return null;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="ml-64 p-8 w-full">
        <h1 className="text-3xl font-bold text-indigo-700 mb-4">
          Welcome, Admin 👋
        </h1>
        <p className="text-lg text-gray-700">
          Use the sidebar or cards below to upload quizzes, notes, ebooks, and more.
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Add upload cards or admin features here */}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
