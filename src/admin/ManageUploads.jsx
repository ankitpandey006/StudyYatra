import React, { useEffect, useState } from "react";
import axios from "axios";
import AdminSidebar from "./AdminSidebar";
import { toast } from "react-toastify";
import { Trash2, Loader2, ExternalLink, RefreshCw } from "lucide-react";
import { getAuth } from "firebase/auth";

const ManageUploads = () => {
  const [uploads, setUploads] = useState([]);
  const [filteredUploads, setFilteredUploads] = useState([]);
  const [loading, setLoading] = useState(true);

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050";

  useEffect(() => {
    fetchUploads();
    // eslint-disable-next-line
  }, []);

  const getToken = async () => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) throw new Error("Please login as admin first.");
    return await user.getIdToken();
  };

  const fetchUploads = async () => {
    try {
      setLoading(true);
      const token = await getToken();

      const res = await axios.get(`${API_URL}/api/upload`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = Array.isArray(res.data.uploads) ? res.data.uploads : [];
      setUploads(data);
      setFilteredUploads(data);
    } catch (err) {
      console.error("Fetch error:", err);
      toast.error(err.response?.data?.message || err.message || "Failed to fetch uploads");
      setUploads([]);
      setFilteredUploads([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this file?")) return;

    try {
      const token = await getToken();

      await axios.delete(`${API_URL}/api/upload/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("File deleted successfully ✅");

      // ✅ safest: refresh from server (keeps list accurate)
      await fetchUploads();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || "Failed to delete file");
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <AdminSidebar />
      <div className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-700">Manage Uploads</h2>

          <button
            onClick={fetchUploads}
            className="flex items-center gap-2 bg-gray-900 text-white px-3 py-2 rounded-lg hover:bg-gray-800"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-20 text-gray-500">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            Loading uploads...
          </div>
        ) : filteredUploads.length === 0 ? (
          <p className="text-gray-500 text-center">No uploads found.</p>
        ) : (
          <>
            {/* Desktop Table */}
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
                  {filteredUploads.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-3 border-b">{item.title || item.name || "Untitled"}</td>
                      <td className="p-3 border-b capitalize">{item.type || "general"}</td>
                      <td className="p-3 border-b">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-"}
                      </td>
                      <td className="p-3 border-b text-center">
                        <div className="flex gap-2 justify-center">
                          {item.url && (
                            <a
                              href={item.url}
                              target="_blank"
                              rel="noreferrer"
                              className="bg-indigo-500 text-white px-3 py-1 rounded-lg hover:bg-indigo-600 flex items-center gap-1"
                            >
                              <ExternalLink className="w-4 h-4" /> Open
                            </a>
                          )}
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 flex items-center gap-1"
                          >
                            <Trash2 className="w-4 h-4" /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden space-y-4">
              {filteredUploads.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-4 rounded-xl shadow-md flex flex-col space-y-2"
                >
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-indigo-600">
                      {item.title || item.name || "Untitled"}
                    </h3>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded-lg hover:bg-red-600 flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>

                  <p className="text-gray-500 capitalize">{item.type || "general"}</p>

                  {item.url && (
                    <a
                      className="text-indigo-600 underline text-sm"
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open file
                    </a>
                  )}

                  <p className="text-gray-400 text-sm">
                    Uploaded on: {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-"}
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
