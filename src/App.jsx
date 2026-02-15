// App.jsx
import React, { Suspense, lazy, memo } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Layout (keep eager so they load immediately)
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Auth Guard (small file, keep eager)
import ProtectedRoute from "./components/ProtectedRoute";

/* ✅ Lazy load pages (code splitting) */
const HomePage = lazy(() => import("./pages/HomePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const SubscriptionPage = lazy(() => import("./pages/SubscriptionPage"));
const ResultPage = lazy(() => import("./pages/ResultPage"));

const BooksPage = lazy(() => import("./pages/BooksPage"));
const NotesPage = lazy(() => import("./pages/NotesPage"));
const PYQPage = lazy(() => import("./pages/PYQPage"));
const MockTestPage = lazy(() => import("./pages/MockTestPage"));
const MockTestStart = lazy(() => import("./pages/MockTestStart"));
const AudioPage = lazy(() => import("./pages/AudioPage"));
const ExamBoardPage = lazy(() => import("./pages/ExamBoardPage"));

const AdminDashboard = lazy(() => import("./admin/Dashboard"));
const Upload = lazy(() => import("./admin/Upload"));
const ManageUploads = lazy(() => import("./admin/ManageUploads"));

/* ✅ Simple loader (you can replace with skeleton UI) */
function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="animate-pulse text-gray-500">Loading...</div>
    </div>
  );
}

/* ✅ Memo layout so Navbar/Footer don’t re-render unnecessarily */
const Layout = memo(function Layout({ children }) {
  return (
    <>
      <Navbar />
      {children}
      <Footer />
      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
});

function App() {
  return (
    <Router>
      <Layout>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* 🟢 Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/subscribe" element={<SubscriptionPage />} />
            <Route path="/result" element={<ResultPage />} />

            {/* 🔐 Protected User Routes */}
            <Route
              path="/books"
              element={
                <ProtectedRoute>
                  <BooksPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/notes"
              element={
                <ProtectedRoute>
                  <NotesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/pyq"
              element={
                <ProtectedRoute>
                  <PYQPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mocktest"
              element={
                <ProtectedRoute>
                  <MockTestPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/mocktest/:id"
              element={
                <ProtectedRoute>
                  <MockTestStart />
                </ProtectedRoute>
              }
            />
            <Route
              path="/audiobooks"
              element={
                <ProtectedRoute>
                  <AudioPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exam/:board/:level"
              element={
                <ProtectedRoute>
                  <ExamBoardPage />
                </ProtectedRoute>
              }
            />

            {/* 🔐 Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute adminOnly={true}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/upload/:type"
              element={
                <ProtectedRoute adminOnly={true}>
                  <Upload />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/manage"
              element={
                <ProtectedRoute adminOnly={true}>
                  <ManageUploads />
                </ProtectedRoute>
              }
            />
          </Routes>
        </Suspense>
      </Layout>
    </Router>
  );
}

export default App;