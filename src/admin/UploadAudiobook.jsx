import Sidebar from './Sidebar';
import { useState } from 'react';
import { toast } from 'react-toastify';

const UploadAudiobook = () => {
  const [title, setTitle] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !file) {
      toast.error("📛 Both title and audio file are required.");
      return;
    }

    const validAudioTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-m4a', 'audio/aac', 'audio/ogg'];
    if (!validAudioTypes.includes(file.type)) {
      toast.error("❌ Invalid file type. Please upload an audio file.");
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('file', file);

    try {
      setLoading(true);
      const res = await fetch('/api/upload-audio', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("✅ Audiobook uploaded successfully!");
        setTitle('');
        setFile(null);
      } else {
        toast.error(`❌ Server Error: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error(err);
      toast.error("❌ Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-64 p-6 w-full">
        <h2 className="text-2xl font-bold mb-4">🎧 Upload Audiobook</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Audiobook Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full p-2 border rounded"
          />
          <button
            type="submit"
            disabled={loading}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            {loading ? 'Uploading...' : 'Upload Audiobook'}
          </button>
        </form>
      </main>
    </div>
  );
};

export default UploadAudiobook;
