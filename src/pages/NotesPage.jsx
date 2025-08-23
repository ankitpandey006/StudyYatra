import React, { useState, useMemo } from "react";
import { FileText, Filter, BookOpen } from "lucide-react";

const NotesPage = () => {
  const [selectedClass, setSelectedClass] = useState("10th");
  const [selectedSubject, setSelectedSubject] = useState("");

  const subjects = [
    "Mathematics",
    "Science",
    "English",
    "Hindi",
    "Sanskrit",
    "Social Science",
    "Physics",
    "Chemistry",
    "Biology",
  ];

  // Static Notes Data (replace later with Firebase fetch)
  const notesData = [
    // Class 10th
    { class: "10th", subject: "Mathematics", file: "10th-maths-notes.pdf" },
    { class: "10th", subject: "Science", file: "10th-science-notes.pdf" },
    { class: "10th", subject: "English", file: "10th-english-notes.pdf" },
    { class: "10th", subject: "Hindi", file: "10th-hindi-notes.pdf" },
    { class: "10th", subject: "Sanskrit", file: "10th-sanskrit-notes.pdf" },
    { class: "10th", subject: "Social Science", file: "10th-socialscience-notes.pdf" },

    // Class 12th
    { class: "12th", subject: "Mathematics", file: "12th-maths-notes.pdf" },
    { class: "12th", subject: "Physics", file: "12th-physics-notes.pdf" },
    { class: "12th", subject: "Chemistry", file: "12th-chemistry-notes.pdf" },
    { class: "12th", subject: "Biology", file: "12th-biology-notes.pdf" },
    { class: "12th", subject: "English", file: "12th-english-notes.pdf" },
    { class: "12th", subject: "Hindi", file: "12th-hindi-notes.pdf" },
  ];

  // Filter Notes
  const filteredNotes = useMemo(() => {
    return notesData.filter(
      (note) =>
        note.class === selectedClass &&
        (!selectedSubject || note.subject === selectedSubject)
    );
  }, [selectedClass, selectedSubject]);

  const renderNoteCard = (note) => {
    const filePath = `/downloads/${note.file}`;
    return (
      <div
        key={note.file}
        className="bg-white rounded-xl shadow p-4 flex flex-col justify-between hover:shadow-md transition"
      >
        <div className="flex items-center mb-3">
          <FileText className="h-6 w-6 text-blue-500 mr-2" />
          <div>
            <h4 className="font-semibold text-blue-600 text-lg">
              {note.subject}
            </h4>
            <p className="text-sm text-gray-500">Class {note.class}</p>
          </div>
        </div>
        <div className="mt-auto flex gap-3">
          <a
            href={filePath}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm px-4 py-2 bg-indigo-700 text-white rounded transition-colors hover:bg-indigo-800"
          >
            View
          </a>
          <a
            href={filePath}
            download
            className="text-sm px-4 py-2 bg-green-500 text-white rounded transition-colors hover:bg-green-600"
          >
            Download
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-8 flex items-center justify-center gap-2">
          <BookOpen className="h-8 w-8 text-blue-600" />
          Class Notes
        </h2>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-8 bg-white shadow rounded-lg p-4">
          {/* Class Toggle */}
          <div className="flex gap-2">
            {["10th", "12th"].map((cls) => (
              <button
                key={cls}
                onClick={() => setSelectedClass(cls)}
                className={`px-4 py-2 rounded-md font-semibold ${
                  selectedClass === cls
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                Class {cls}
              </button>
            ))}
          </div>

          {/* Subject Filter */}
          <div className="flex items-center gap-2">
            <Filter className="text-gray-500" />
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="border border-gray-300 p-2 rounded-md"
            >
              <option value="">All Subjects</option>
              {subjects.map((subject) => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredNotes.length > 0 ? (
            filteredNotes.map(renderNoteCard)
          ) : (
            <div className="col-span-full text-center py-20 bg-white rounded-lg shadow">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-bold text-gray-700">
                No Notes Found
              </h3>
              <p className="text-gray-500">
                Try changing class or subject filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotesPage;
