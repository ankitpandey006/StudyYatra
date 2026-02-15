import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  onAuthStateChanged,
} from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { toast } from "react-toastify";
import { FcGoogle } from "react-icons/fc";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";

import logo from "../assets/logo.jpeg";

const ADMIN_EMAIL = "admin@example.com"; // change this

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) return;
      if (user.email === ADMIN_EMAIL) navigate("/admin");
      else navigate("/");
    });
    return () => unsubscribe();
  }, [navigate]);

  const saveUserToLocal = (user) => {
    localStorage.setItem(
      "studyyatra_user",
      JSON.stringify({
        name: user.displayName || user.email,
        email: user.email,
      })
    );
  };

  const handleFirebaseError = (error) => {
    let message = "Something went wrong.";
    if (error.code === "auth/invalid-email") message = "Invalid email format.";
    else if (error.code === "auth/user-not-found")
      message = "No user found with this email.";
    else if (error.code === "auth/wrong-password")
      message = "Incorrect password.";
    else if (error.code === "auth/invalid-credential")
      message = "Invalid email or password.";
    else if (error.code === "auth/popup-closed-by-user")
      message = "Google sign-in was cancelled.";
    toast.error(message);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      const user = auth.currentUser;
      saveUserToLocal(user);

      if (user.email === ADMIN_EMAIL) {
        toast.success("Admin login successful.");
        navigate("/admin");
      } else {
        toast.success("Login successful.");
        navigate("/");
      }
    } catch (error) {
      handleFirebaseError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      saveUserToLocal(user);

      if (user.email === ADMIN_EMAIL) {
        toast.success("Admin login successful.");
        navigate("/admin");
      } else {
        toast.success("Google login successful.");
        navigate("/");
      }
    } catch (error) {
      handleFirebaseError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Please enter your email first.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent.");
    } catch (error) {
      handleFirebaseError(error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-100">
      <div className="w-full max-w-md">
        <div className="bg-white/90 backdrop-blur rounded-2xl shadow-xl border border-white/60 p-6 sm:p-8">
          
          {/* Logo Section */}
          <div className="text-center mb-6">
            <div className="mx-auto h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-white 
                            flex items-center justify-center shadow-md 
                            border border-gray-100 overflow-hidden">
              <img
                src={logo}
                alt="StudyYatra Logo"
                className="h-full w-full object-contain p-2"
              />
            </div>

            <h1 className="mt-5 text-2xl sm:text-3xl font-semibold text-gray-900">
              Welcome back
            </h1>

            <p className="mt-1 text-sm text-gray-600">
              Sign in to continue to <span className="font-medium">StudyYatra</span>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email address
              </label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                >
                  Forgot password?
                </button>
              </div>

              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />

                <input
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-12 py-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPass((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600"
                >
                  {showPass ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-2.5 font-medium shadow-md hover:shadow-lg hover:brightness-105 transition disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200" />
            <span className="text-xs text-gray-500">OR</span>
            <div className="h-px flex-1 bg-gray-200" />
          </div>

          {/* Google Login */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white py-2.5 font-medium text-gray-800 hover:bg-gray-50 transition disabled:opacity-60"
          >
            <FcGoogle size={22} />
            {loading ? "Please wait..." : "Continue with Google"}
          </button>

          {/* Footer */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Don’t have an account?{" "}
            <Link to="/register" className="text-blue-600 hover:underline font-medium">
              Create one
            </Link>
          </p>
        </div>

        <p className="mt-4 text-center text-xs text-gray-500">
          By continuing, you agree to StudyYatra’s Terms & Privacy Policy.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;