import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { BookOpen, Filter, Eye, Download, X } from "lucide-react";

/* =========================
   Cloudinary Helper
========================= */
const normalizeCloudinaryUrl = (url = "") => {
  if (!url) return url;
  if (!url.includes("res.cloudinary.com")) return url;

  const match = url.match(/\/(image|raw|video)\/upload\//);
  const resourceType = match?.[1] || "raw";

  return url
    .replace("/image/upload/", `/${resourceType}/upload/`)
    .replace("/raw/upload/", `/${resourceType}/upload/`)
    .replace("/video/upload/", `/${resourceType}/upload/`);
};

const getViewUrl = (url) => normalizeCloudinaryUrl(url);

const getDownloadUrl = (url) => {
  let u = normalizeCloudinaryUrl(url);
  if (u.includes("/upload/") && !u.includes("fl_attachment:true")) {
    u = u.replace("/upload/", "/upload/fl_attachment:true/");
  }
  return u;
};

/* =========================
   Preview Modal
========================= */
const PreviewModal = ({ book, onClose }) => {
  if (!book) return null;

  const viewUrl = getViewUrl(book.fileUrl);
  const downloadUrl = getDownloadUrl(book.fileUrl);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden"
      >
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h3 className="font-bold text-lg">{book.title}</h3>
            <p className="text-sm text-gray-500">
              Class {book.classLevel} • {book.subject}
            </p>
          </div>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <div className="flex-1 p-2 bg-gray-50">
          <iframe
            src={viewUrl}
            title="ebook preview"
            className="w-full h-full border-0 rounded-lg bg-white"
          />
        </div>

        <div className="p-4 border-t flex justify-end gap-3">
          <a
            href={downloadUrl}
            className="px-4 py-2 bg-green-600 text-white rounded-lg flex items-center gap-2"
          >
            <Download size={16} /> Download
          </a>
        </div>
      </div>
    </div>
  );
};

/* =========================
   Main Component
========================= */
const BooksPage = () => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050";

  const [ebooks, setEbooks] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [previewBook, setPreviewBook] = useState(null);

  useEffect(() => {
    const fetchEbooks = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/upload/public`, {
          params: { type: "ebook" },
        });

        setEbooks(res.data?.uploads || []);
      } catch (err) {
        console.error("Ebook fetch error:", err);
      }
    };

    fetchEbooks();
  }, []);

  const subjects = useMemo(() => {
    const set = new Set(ebooks.map((b) => b.subject));
    return ["All", ...Array.from(set)];
  }, [ebooks]);

  const filteredBooks = useMemo(() => {
    if (selectedSubject === "All") return ebooks;
    return ebooks.filter((b) => b.subject === selectedSubject);
  }, [ebooks, selectedSubject]);

  const class10Books = filteredBooks.filter((b) => b.classLevel === "10");
  const class12Books = filteredBooks.filter((b) => b.classLevel === "12");

  const renderCard = (book) => (
    <div
      key={book.id}
      className="bg-white rounded-xl shadow p-4 hover:shadow-lg transition w-full sm:w-[80%] md:w-[45%] lg:w-[30%]"
    >
      <h3 className="font-bold text-lg text-indigo-700">{book.title}</h3>
      <p className="text-sm text-gray-600 mt-1">{book.description}</p>

      <div className="mt-4 flex gap-3">
        <button
          onClick={() => setPreviewBook(book)}
          className="px-4 py-2 bg-indigo-700 text-white rounded flex items-center gap-2"
        >
          <Eye size={16} /> Preview
        </button>
        <a
          href={getDownloadUrl(book.fileUrl)}
          className="px-4 py-2 bg-green-600 text-white rounded flex items-center gap-2"
        >
          <Download size={16} /> Download
        </a>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      {previewBook && (
        <PreviewModal book={previewBook} onClose={() => setPreviewBook(null)} />
      )}

      <h1 className="text-3xl font-bold text-center mb-6">
        📚 Class 10 & 12 NCERT eBooks
      </h1>

      {/* Filter */}
      <div className="flex justify-center mb-8">
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="px-4 py-2 border rounded-md"
        >
          {subjects.map((subj, i) => (
            <option key={i} value={subj}>
              {subj}
            </option>
          ))}
        </select>
      </div>

      {/* Class 10 */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-indigo-700 mb-4">
          📗 Class 10 eBooks
        </h2>
        <div className="flex flex-wrap gap-6 justify-center">
          {class10Books.length
            ? class10Books.map(renderCard)
            : <p className="text-gray-500">No books found.</p>}
        </div>
      </section>

      {/* Class 12 */}
      <section>
        <h2 className="text-2xl font-semibold text-indigo-700 mb-4">
          📙 Class 12 eBooks
        </h2>
        <div className="flex flex-wrap gap-6 justify-center">
          {class12Books.length
            ? class12Books.map(renderCard)
            : <p className="text-gray-500">No books found.</p>}
        </div>
      </section>
    </div>
  );
};

export default BooksPage;