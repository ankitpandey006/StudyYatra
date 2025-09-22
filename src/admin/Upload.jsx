import React, { useState } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import AdminSidebar from "./AdminSidebar";
import { UploadCloud } from "lucide-react";

const allowedTypes = ["pyq", "notes", "ebook", "audiobook", "quiz"];

const Upload = () => {
  const { type } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || "";

  if (!allowedTypes.includes(type)) {
    toast.error("Invalid upload type!");
    return <Navigate to="/admin" replace />;
  }

  const handleUpload = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return toast.error("Unauthorized! Please log in.");
    if (!file) return toast.error("Please select a file!");
    if (file.size > 20 * 1024 * 1024) return toast.error("File size must be under 20MB");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("file", file);

    try {
      setLoading(true);
      await axios.post(`${API_URL}/api/admin/upload/${type}`, formData, {
        headers: { "Content-Type": "multipart/form-data", Authorization: `Bearer ${token}` },
      });
      toast.success(`${type.toUpperCase()} uploaded successfully!`);
      setTitle(""); setDescription(""); setFile(null);
      navigate("/admin/manage");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Upload failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100">
      <AdminSidebar />

      <div className="flex-1 flex justify-center items-start md:items-center p-4 sm:p-6 md:p-10">
        <div className="w-full max-w-lg bg-white/90 rounded-3xl shadow-2xl p-6 sm:p-8 md:p-10 flex flex-col relative overflow-hidden">
          {/* Decorative Glow */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-200 opacity-30 rounded-full blur-2xl pointer-events-none"></div>
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-200 opacity-30 rounded-full blur-2xl pointer-events-none"></div>

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-gradient-to-tr from-blue-200 to-indigo-200 rounded-full shadow">
              <UploadCloud className="w-7 h-7 text-blue-600" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-indigo-700 drop-shadow">
              Upload {type.toUpperCase()}
            </h2>
          </div>

          {/* Form */}
          <form onSubmit={handleUpload} className="space-y-4 sm:space-y-6">
            <div>
              <label className="block text-sm font-semibold text-indigo-700 mb-1">Title</label>
              <input
                type="text"
                placeholder="Enter title"
                className="border border-indigo-200 p-2 sm:p-3 w-full rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none transition bg-indigo-50/50"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-indigo-700 mb-1">Description</label>
              <textarea
                placeholder="Write a short description..."
                className="border border-indigo-200 p-2 sm:p-3 w-full rounded-xl focus:ring-2 focus:ring-indigo-400 outline-none transition min-h-[80px] sm:min-h-[100px] bg-indigo-50/50"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-indigo-700 mb-1">File Upload</label>
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-indigo-300 p-6 sm:p-8 rounded-xl cursor-pointer hover:border-indigo-400 transition bg-indigo-50/40">
                <UploadCloud className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-500 mb-2 animate-bounce" />
                <span className="text-indigo-700 text-sm sm:text-base font-medium">
                  {file ? file.name : "Click to choose a file"}
                </span>
                <input type="file" onChange={(e) => setFile(e.target.files[0])} className="hidden" required />
              </label>
              <p className="text-xs text-indigo-400 mt-1">Max size: 20MB</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2 sm:py-3 rounded-xl font-bold text-lg shadow transition ${
                loading
                  ? "bg-indigo-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-indigo-500 to-blue-500 hover:from-indigo-600 hover:to-blue-600"
              }`}
            >
              {loading ? "Uploading..." : "Upload"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Upload;
