// src/admin/Upload.jsx
import React, { useState } from "react";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import AdminSidebar from "./AdminSidebar";

const allowedTypes = ["pyq", "notes", "ebook", "audiobook", "quiz"];

const Upload = () => {
  const { type } = useParams(); // URL param: pyq, notes, ebook, audiobook, quiz
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Validate upload type
  if (!allowedTypes.includes(type)) {
    toast.error("Invalid upload type!");
    return <Navigate to="/admin" replace />;
  }

  const handleUpload = async (e) => {
    e.preventDefault();

    // ✅ Token check
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Unauthorized! Please log in.");
      return;
    }

    // ✅ File check
    if (!file) {
      toast.error("Please select a file!");
      return;
    }

    // ✅ File size limit (20MB)
    if (file.size > 20 * 1024 * 1024) {
      toast.error("File size must be under 20MB");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("file", file);

    try {
      setLoading(true);

      await axios.post(
        `${process.env.REACT_APP_API_URL || ""}/api/admin/upload/${type}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(`${type.toUpperCase()} uploaded successfully!`);

      // ✅ Reset form
      setTitle("");
      setDescription("");
      setFile(null);

      // ✅ Redirect to manage uploads page
      navigate("/admin/manage");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Upload failed!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 p-6">
        <h2 className="text-2xl font-bold mb-4">Upload {type.toUpperCase()}</h2>
        <form onSubmit={handleUpload} className="space-y-4 max-w-lg">
          <input
            type="text"
            placeholder="Title"
            className="border p-2 w-full rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Description"
            className="border p-2 w-full rounded"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="border p-2 w-full rounded"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Upload;
