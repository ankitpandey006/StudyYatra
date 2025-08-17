import Sidebar from './Sidebar';
import { useState } from 'react';
import { toast } from 'react-toastify';

const UploadQuiz = () => {
  const [title, setTitle] = useState('');
  const [questions, setQuestions] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim() || !questions.trim()) {
      toast.error("Title and questions are required.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch('/api/upload-quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, questions }),
      });

      if (!response.ok) {
        throw new Error("Failed to upload quiz");
      }

      toast.success("✅ Quiz uploaded successfully!");
      setTitle('');
      setQuestions('');
    } catch (error) {
      console.error(error);
      toast.error("❌ Error uploading quiz");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex">
      <Sidebar />
      <main className="ml-64 p-6 w-full">
        <h2 className="text-2xl font-bold mb-4">📘 Upload Quiz</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Quiz Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded"
          />
          <textarea
            placeholder='Questions (JSON format: [{"question": "...", "options": [...], "answer": "..."}, ...])'
            value={questions}
            onChange={(e) => setQuestions(e.target.value)}
            className="w-full p-2 border rounded h-48"
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            disabled={loading}
          >
            {loading ? 'Uploading...' : 'Upload Quiz'}
          </button>
        </form>
      </main>
    </div>
  );
};

export default UploadQuiz;
