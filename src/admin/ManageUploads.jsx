// src/admin/ManageUploads.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "./AdminSidebar";
import { toast } from "react-toastify";

const ManageUploads = () => {
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUploads();
  }, []);

  const fetchUploads = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/admin/uploads");
      setUploads(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch uploads");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;
    try {
      await axios.delete(`/api/admin/uploads/${id}`);
      setUploads((prev) => prev.filter((item) => item._id !== id));
      toast.success("File deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete file");
    }
  };

  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 p-6">
        <h2 className="text-2xl font-bold mb-4">Manage Uploads</h2>

        {loading ? (
          <p>Loading uploads...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border">
              <thead>
                <tr className="bg-gray-200">
                  <th className="p-2 border">Title</th>
                  <th className="p-2 border">Type</th>
                  <th className="p-2 border">Actions</th>
                </tr>
              </thead>
              <tbody>
                {uploads.map((item) => (
                  <tr key={item._id}>
                    <td className="p-2 border">{item.title}</td>
                    <td className="p-2 border capitalize">{item.type}</td>
                    <td className="p-2 border">
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {uploads.length === 0 && (
                  <tr>
                    <td colSpan="3" className="text-center p-4">
                      No uploads found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageUploads;
