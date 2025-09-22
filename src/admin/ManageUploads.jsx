import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "./AdminSidebar";
import { toast } from "react-toastify";
import { Trash2, Loader2 } from "lucide-react";

const ManageUploads = () => {
  const [uploads, setUploads] = useState([]);
  const [filteredUploads, setFilteredUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || "";
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetchUploads();
    // eslint-disable-next-line
  }, []);

  const fetchUploads = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/upload`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Ensure data is always an array
      const data =
        Array.isArray(res.data.uploads)
          ? res.data.uploads
          : Array.isArray(res.data)
          ? res.data
          : [];

      setUploads(data);
      setFilteredUploads(data);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error(err.response?.data?.message || "Failed to fetch uploads");
      setUploads([]);
      setFilteredUploads([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;

    try {
      await axios.delete(`${API_URL}/api/upload/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const updatedUploads = uploads.filter((item) => item._id !== id);
      setUploads(updatedUploads);
      setFilteredUploads(updatedUploads);
      toast.success("File deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to delete file");
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-4 sm:p-6 md:p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-700 text-center md:text-left">
          Manage Uploads
        </h2>

        {loading ? (
          <div className="flex justify-center items-center py-20 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading uploads...
          </div>
        ) : filteredUploads.length === 0 ? (
          <p className="text-gray-500 text-center">No uploads found.</p>
        ) : (
          <>
            {/* Table layout for medium+ screens */}
            <div className="hidden md:block overflow-x-auto bg-white rounded-xl shadow-md">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="p-3 border-b">Title</th>
                    <th className="p-3 border-b">Type</th>
                    <th className="p-3 border-b">Uploaded On</th>
                    <th className="p-3 border-b text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.isArray(filteredUploads) &&
                    filteredUploads.map((item) => (
                      <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-3 border-b">{item.title}</td>
                        <td className="p-3 border-b capitalize">{item.type}</td>
                        <td className="p-3 border-b">
                          {item.createdAt
                            ? new Date(item.createdAt).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="p-3 border-b text-center">
                          <button
                            onClick={() => handleDelete(item._id)}
                            className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 flex items-center gap-1 mx-auto"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Card layout for small screens */}
            <div className="md:hidden space-y-4">
              {Array.isArray(filteredUploads) &&
                filteredUploads.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white p-4 rounded-xl shadow-md flex flex-col space-y-2"
                  >
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold text-indigo-600">{item.title}</h3>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600 flex items-center gap-1"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    </div>
                    <p className="text-gray-500 capitalize">{item.type}</p>
                    <p className="text-gray-400 text-sm">
                      Uploaded on:{" "}
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-"}
                    </p>
                  </div>
                ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ManageUploads;
