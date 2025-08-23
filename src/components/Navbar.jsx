import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Home,
  BookOpen,
  FileText,
  ClipboardList,
  Headphones,
  LogIn,
  LogOut,
  Menu,
  X,
  CreditCard,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../lib/firebase";
import { toast } from "react-toastify";
import logo from "../assets/logo.jpeg";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();

  // ✅ Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("✅ Logged out successfully!");
      navigate("/login");
    } catch (error) {
      toast.error("❌ Logout failed. Try again.");
    }
  };

  return (
    <nav className="bg-gradient-to-r from-blue-50 via-white to-purple-50 shadow-md backdrop-blur-md">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between flex-wrap">
        {/* Logo */}
        <Link
          to="/"
          onClick={() => setMenuOpen(false)}
          className="flex items-center gap-3"
        >
          <div className="p-[2px] bg-gradient-to-tr from-indigo-400 via-purple-300 to-pink-300 rounded-full shadow-md hover:shadow-lg transition">
            <div className="bg-white p-[1px] rounded-full">
              <img
                src={logo}
                alt="StudyYatra Logo"
                className="h-10 w-10 rounded-full object-cover border-[3px] border-white shadow-md hover:scale-105 transition-transform duration-300"
              />
            </div>
          </div>
          <span className="text-2xl font-extrabold text-blue-700 tracking-wide">
            StudyYatra
          </span>
        </Link>

        {/* Hamburger (Mobile) */}
        <button
          className="sm:hidden text-blue-600"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Desktop Menu */}
        <div className="hidden sm:flex items-center gap-6">
          <div className="flex gap-4 items-center text-sm font-medium text-slate-700">
            <Link to="/" className="hover:text-blue-600 flex items-center gap-1">
              <Home size={18} /> Home
            </Link>
            <Link to="/books" className="hover:text-blue-600 flex items-center gap-1">
              <BookOpen size={18} /> Books
            </Link>
            <Link to="/notes" className="hover:text-blue-600 flex items-center gap-1">
              <FileText size={18} /> Notes
            </Link>
            <Link to="/pyq" className="hover:text-blue-600 flex items-center gap-1">
              <ClipboardList size={18} /> PYQs
            </Link>
            <Link to="/mocktest" className="hover:text-blue-600 flex items-center gap-1">
              <ClipboardList size={18} /> Mock Tests
            </Link>
            <Link to="/audiobooks" className="hover:text-blue-600 flex items-center gap-1">
              <Headphones size={18} /> Audio
            </Link>
            <Link
              to="/subscribe"
              className="text-purple-700 font-semibold hover:text-purple-900 hover:underline flex items-center gap-1"
            >
              <CreditCard size={18} /> Subscribe
            </Link>

            {/* ✅ Admin Panel Link (Firestore से) */}
            {userData?.isAdmin && (
              <Link
                to="/admin"
                className="hover:text-red-600 flex items-center gap-1 font-semibold text-red-500 transition-all duration-200"
              >
                🛠️ Admin Panel
              </Link>
            )}

            {/* Auth Buttons */}
            {currentUser ? (
              <button
                onClick={handleLogout}
                className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded flex items-center gap-1 shadow-sm transition"
              >
                <LogOut size={18} /> Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1 rounded flex items-center gap-1 shadow-sm transition"
              >
                <LogIn size={18} /> Login
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="w-full mt-4 sm:hidden space-y-2 bg-white rounded-lg shadow-md p-4 text-slate-700">
            <Link to="/" onClick={() => setMenuOpen(false)} className="block px-2 py-1">🏠 Home</Link>
            <Link to="/books" onClick={() => setMenuOpen(false)} className="block px-2 py-1">📚 Books</Link>
            <Link to="/notes" onClick={() => setMenuOpen(false)} className="block px-2 py-1">📝 Notes</Link>
            <Link to="/pyq" onClick={() => setMenuOpen(false)} className="block px-2 py-1">📄 PYQs</Link>
            <Link to="/mocktest" onClick={() => setMenuOpen(false)} className="block px-2 py-1">🧪 Mock Tests</Link>
            <Link to="/audiobooks" onClick={() => setMenuOpen(false)} className="block px-2 py-1">🎧 Audio</Link>
            <Link to="/subscribe" onClick={() => setMenuOpen(false)} className="block px-2 py-1 text-purple-700 font-semibold">💳 Subscribe</Link>

            {/* ✅ Admin in Mobile Menu */}
            {userData?.isAdmin && (
              <Link
                to="/admin"
                onClick={() => setMenuOpen(false)}
                className="block px-2 py-1 text-red-600 font-semibold"
              >
                🛠️ Admin Panel
              </Link>
            )}

            {currentUser ? (
              <button
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-white py-1 rounded transition"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setMenuOpen(false)}
                className="block w-full text-center bg-yellow-400 hover:bg-yellow-500 text-white py-1 rounded transition"
              >
                Login
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
