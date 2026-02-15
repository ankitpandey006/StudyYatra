import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
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
  Shield,
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
  const location = useLocation();

  // ✅ Close menu on route change (better UX)
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  // ✅ Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success("Logged out successfully!");
      navigate("/login");
    } catch (error) {
      toast.error("Logout failed. Try again.");
    }
  };

  const navLinkClass = ({ isActive }) =>
    `inline-flex items-center gap-2 px-3 py-2 rounded-xl transition
     ${isActive ? "text-indigo-700 bg-indigo-50" : "text-slate-700 hover:text-indigo-700 hover:bg-slate-50"}`;

  return (
    <header className="sticky top-0 z-50">
      <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="h-16 flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="p-[2px] rounded-full bg-gradient-to-tr from-indigo-400 via-purple-300 to-pink-300 shadow-sm">
                <div className="bg-white p-[2px] rounded-full">
                  <img
                    src={logo}
                    alt="StudyYatra Logo"
                    className="h-10 w-10 rounded-full object-cover border border-white"
                  />
                </div>
              </div>
              <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
                StudyYatra
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden lg:flex items-center gap-1">
              <NavLink to="/" className={navLinkClass}>
                <Home size={18} /> Home
              </NavLink>
              <NavLink to="/books" className={navLinkClass}>
                <BookOpen size={18} /> Books
              </NavLink>
              <NavLink to="/notes" className={navLinkClass}>
                <FileText size={18} /> Notes
              </NavLink>
              <NavLink to="/pyq" className={navLinkClass}>
                <ClipboardList size={18} /> PYQs
              </NavLink>
              <NavLink to="/mocktest" className={navLinkClass}>
                <ClipboardList size={18} /> Mock Tests
              </NavLink>
              <NavLink to="/audiobooks" className={navLinkClass}>
                <Headphones size={18} /> Audio
              </NavLink>

              <NavLink
                to="/subscribe"
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 px-3 py-2 rounded-xl transition font-semibold
                  ${
                    isActive
                      ? "text-purple-800 bg-purple-50"
                      : "text-purple-700 hover:text-purple-800 hover:bg-purple-50"
                  }`
                }
              >
                <CreditCard size={18} /> Subscribe
              </NavLink>

              {userData?.isAdmin && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `inline-flex items-center gap-2 px-3 py-2 rounded-xl transition font-semibold
                    ${
                      isActive
                        ? "text-rose-700 bg-rose-50"
                        : "text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                    }`
                  }
                >
                  <Shield size={18} /> Admin
                </NavLink>
              )}
            </div>

            {/* Desktop Auth Button */}
            <div className="hidden lg:flex items-center gap-3">
              {currentUser ? (
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition shadow-sm"
                >
                  <LogOut size={18} /> Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm"
                >
                  <LogIn size={18} /> Login
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              className="lg:hidden inline-flex items-center justify-center h-10 w-10 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          {/* Mobile Menu Panel */}
          <div
            className={`lg:hidden overflow-hidden transition-all duration-300 ${
              menuOpen ? "max-h-[520px] pb-4" : "max-h-0"
            }`}
          >
            <div className="pt-2 grid grid-cols-1 gap-1">
              <NavLink to="/" className={navLinkClass}>
                <Home size={18} /> Home
              </NavLink>
              <NavLink to="/books" className={navLinkClass}>
                <BookOpen size={18} /> Books
              </NavLink>
              <NavLink to="/notes" className={navLinkClass}>
                <FileText size={18} /> Notes
              </NavLink>
              <NavLink to="/pyq" className={navLinkClass}>
                <ClipboardList size={18} /> PYQs
              </NavLink>
              <NavLink to="/mocktest" className={navLinkClass}>
                <ClipboardList size={18} /> Mock Tests
              </NavLink>
              <NavLink to="/audiobooks" className={navLinkClass}>
                <Headphones size={18} /> Audio
              </NavLink>

              <NavLink
                to="/subscribe"
                className={({ isActive }) =>
                  `inline-flex items-center gap-2 px-3 py-2 rounded-xl transition font-semibold
                  ${
                    isActive
                      ? "text-purple-800 bg-purple-50"
                      : "text-purple-700 hover:text-purple-800 hover:bg-purple-50"
                  }`
                }
              >
                <CreditCard size={18} /> Subscribe
              </NavLink>

              {userData?.isAdmin && (
                <NavLink
                  to="/admin"
                  className={({ isActive }) =>
                    `inline-flex items-center gap-2 px-3 py-2 rounded-xl transition font-semibold
                    ${
                      isActive
                        ? "text-rose-700 bg-rose-50"
                        : "text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                    }`
                  }
                >
                  <Shield size={18} /> Admin
                </NavLink>
              )}

              <div className="pt-2">
                {currentUser ? (
                  <button
                    onClick={handleLogout}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition shadow-sm"
                  >
                    <LogOut size={18} /> Logout
                  </button>
                ) : (
                  <Link
                    to="/login"
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition shadow-sm"
                  >
                    <LogIn size={18} /> Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;