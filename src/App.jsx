// App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Layout
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Public Pages
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import SubscriptionPage from "./pages/SubscriptionPage";
import ResultPage from "./pages/ResultPage";

// User-Protected Pages
import BooksPage from "./pages/BooksPage";
import NotesPage from "./pages/NotesPage";
import PYQPage from "./pages/PYQPage";
import MockTestPage from "./pages/MockTestPage";
import MockTestStart from "./pages/MockTestStart";
import AudioPage from "./pages/AudioPage";
import ExamBoardPage from "./pages/ExamBoardPage";

// Admin Pages
import AdminDashboard from "./admin/Dashboard";
import Upload from "./admin/Upload";
import ManageUploads from "./admin/ManageUploads";

// Auth Guard
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <Router>
      <Navbar />

      <Routes>
        {/* 🟢 Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/subscribe" element={<SubscriptionPage />} />
        <Route path="/result" element={<ResultPage />} />

        {/* 🔐 Protected User Routes */}
        <Route path="/books" element={<ProtectedRoute><BooksPage /></ProtectedRoute>} />
        <Route path="/notes" element={<ProtectedRoute><NotesPage /></ProtectedRoute>} />
        <Route path="/pyq" element={<ProtectedRoute><PYQPage /></ProtectedRoute>} />
        <Route path="/mocktest" element={<ProtectedRoute><MockTestPage /></ProtectedRoute>} />
        <Route path="/mocktest/:id" element={<ProtectedRoute><MockTestStart /></ProtectedRoute>} />
        <Route path="/audiobooks" element={<ProtectedRoute><AudioPage /></ProtectedRoute>} />
        <Route path="/exam/:board/:level" element={<ProtectedRoute><ExamBoardPage /></ProtectedRoute>} />

        {/* 🔐 Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute adminOnly={true}><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/upload/:type" element={<ProtectedRoute adminOnly={true}><Upload /></ProtectedRoute>} />
        <Route path="/admin/manage" element={<ProtectedRoute adminOnly={true}><ManageUploads /></ProtectedRoute>} />
      </Routes>

      <Footer />
      <ToastContainer position="top-right" autoClose={3000} />
    </Router>
  );
}

export default App;
