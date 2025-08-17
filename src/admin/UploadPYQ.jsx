import Sidebar from './Sidebar';
import { useState } from 'react';
import { toast } from 'react-toastify';

const UploadPYQ = () => {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !file) {
      toast.error("📛 Title and PDF file are required!");
      return;
    }

    if (file.type !== 'application/pdf') {
      toast.error("❌ Only PDF files are allowed.");
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();
      formData.append('title', title);
      formData.append('file', file);

      const response = await fetch('/api/upload-pyq', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      toast.success("✅ PYQ uploaded successfully!");
      setTitle('');
      setFile(null);
    } catch (error) {
      console.error(error);
      toast.error("❌ Error uploading PYQ.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-64 p-6 w-full">
        <h2 className="text-2xl font-bold mb-4">📄 Upload PYQ</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            type="file"
            accept="application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            disabled={loading}
          >
            {loading ? 'Uploading...' : 'Upload PYQ'}
          </button>
        </form>
      </main>
    </div>
  );
};

export default UploadPYQ;
