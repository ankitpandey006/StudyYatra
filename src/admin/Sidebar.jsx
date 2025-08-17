import { Link, useLocation } from "react-router-dom";
import { getAuth } from "firebase/auth";

const Sidebar = () => {
  const location = useLocation();
  const auth = getAuth();

  const links = [
    { to: "/admin/upload-quiz", label: "📝 Upload Quiz" },
    { to: "/admin/upload-notes", label: "📄 Upload Notes" },
    { to: "/admin/upload-pyq", label: "📚 Upload PYQ" },
    { to: "/admin/upload-audiobook", label: "🎧 Upload Audiobook" },
    { to: "/admin/upload-ebook", label: "📕 Upload Ebook" },
  ];

  const handleLogout = async () => {
    await auth.signOut();
    window.location.href = "/login";
  };

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 p-6 shadow-md fixed top-0 left-0 z-10">
      <h2 className="text-2xl font-bold mb-8 text-indigo-700">📂 Admin Panel</h2>
      <nav>
        <ul className="space-y-2">
          {links.map(({ to, label }) => (
            <li key={to}>
              <Link
                to={to}
                className={`block px-4 py-2 rounded-md font-medium transition ${
                  location.pathname === to
                    ? "bg-indigo-600 text-white"
                    : "text-gray-800 hover:bg-indigo-100"
                }`}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <hr className="my-6 border-t" />
        <button
          onClick={handleLogout}
          className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-100 rounded-md font-medium"
        >
          🚪 Logout
        </button>
      </nav>
    </aside>
  );
};

export default Sidebar;
