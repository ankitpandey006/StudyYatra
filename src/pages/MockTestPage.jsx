import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext"; // ✅ FIXED PATH

const LOCAL_KEY = "studynest_mocktest_attempted";

const MockTestPage = () => {
  const [mockTests, setMockTests] = useState([]);
  const [attempted, setAttempted] = useState(() => {
    const stored = localStorage.getItem(LOCAL_KEY);
    return stored ? JSON.parse(stored) : {};
  });
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user: currentUser } = useAuth(); // ✅ updated to match AuthContext

  useEffect(() => {
    axios
      .get("http://localhost:5050/api/quizzes")
      .then((res) => {
        setMockTests(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("❌ Failed to load mock tests:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(attempted));
  }, [attempted]);

  const handleStartTest = (test) => {
    if (!test.isFree && !currentUser?.isPremium) {
      return navigate("/subscribe");
    }
    setAttempted((prev) => ({ ...prev, [test.id]: true }));
    navigate(`/mocktest/${test.id}`);
  };

  const filteredTests = mockTests.filter((test) => {
    const matchClass = selectedClass ? test.class?.trim() === selectedClass : true;
    const matchSubject = selectedSubject ? test.subject?.trim() === selectedSubject : true;
    return matchClass && matchSubject;
  });

  const classOptions = [
    ...new Set(mockTests.map((test) => test.class?.trim()).filter(Boolean)),
  ];

  const subjectOptions = [
    ...new Set(
      mockTests
        .filter((test) => (selectedClass ? test.class?.trim() === selectedClass : true))
        .map((test) => test.subject?.trim())
        .filter(Boolean)
    ),
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <h2 className="text-3xl font-bold mb-6">📘 Mock Test</h2>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <select
          className="p-2 border rounded"
          value={selectedClass}
          onChange={(e) => {
            setSelectedClass(e.target.value);
            setSelectedSubject("");
          }}
        >
          <option value="">All Classes</option>
          {classOptions.map((cls, idx) => (
            <option key={idx} value={cls}>
              {cls}
            </option>
          ))}
        </select>

        <select
          className="p-2 border rounded"
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          <option value="">All Subjects</option>
          {subjectOptions.map((subj, idx) => (
            <option key={idx} value={subj}>
              {subj}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p className="text-center text-gray-500">Loading mock tests...</p>
      ) : filteredTests.length === 0 ? (
        <p className="mt-10 text-center text-gray-500">📭 No tests found for selected filters.</p>
      ) : (
        <>
          <h3 className="text-2xl font-semibold mb-4">Class 10th</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredTests
              .filter((test) => test.class?.trim() === "10")
              .map((test) => {
                const isLocked = !test.isFree && !currentUser?.isPremium;
                return (
                  <div key={test.id} className="bg-white p-4 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-blue-600 mb-1">
                      {test.title || "Untitled Test"}
                    </h3>
                    <p className="text-gray-700"><strong>Class:</strong> {test.class || "Unknown"}</p>
                    <p className="text-gray-700"><strong>Subject:</strong> {test.subject || "Unknown"}</p>
                    <p className="text-gray-700"><strong>Duration:</strong> {test.duration || "30 mins"}</p>
                    <p className="text-gray-700">
                      <strong>Questions:</strong> {Array.isArray(test.questions) ? test.questions.length : "?"}
                    </p>
                    {test.isFree ? (
                      <p className="text-green-600 text-sm mt-1">🎁 Free Demo</p>
                    ) : (
                      <p className="text-yellow-600 text-sm mt-1">🔒 Premium Test</p>
                    )}
                    <button
                      onClick={() => handleStartTest(test)}
                      className={`mt-4 w-full py-2 rounded text-white ${
                        isLocked
                          ? "bg-gray-400 cursor-not-allowed"
                          : attempted[test.id]
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                      disabled={isLocked}
                    >
                      {isLocked
                        ? "Upgrade to Unlock"
                        : attempted[test.id]
                        ? "Resume Test"
                        : "Start Test"}
                    </button>
                  </div>
                );
              })}
          </div>

          <h3 className="text-2xl font-semibold mb-4">Class 12th</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTests
              .filter((test) => test.class?.trim() === "12")
              .map((test) => {
                const isLocked = !test.isFree && !currentUser?.isPremium;
                return (
                  <div key={test.id} className="bg-white p-4 rounded-lg shadow-md">
                    <h3 className="text-xl font-bold text-blue-600 mb-1">
                      {test.title || "Untitled Test"}
                    </h3>
                    <p className="text-gray-700"><strong>Class:</strong> {test.class || "Unknown"}</p>
                    <p className="text-gray-700"><strong>Subject:</strong> {test.subject || "Unknown"}</p>
                    <p className="text-gray-700"><strong>Duration:</strong> {test.duration || "30 mins"}</p>
                    <p className="text-gray-700">
                      <strong>Questions:</strong> {Array.isArray(test.questions) ? test.questions.length : "?"}
                    </p>
                    {test.isFree ? (
                      <p className="text-green-600 text-sm mt-1">🎁 Free Demo</p>
                    ) : (
                      <p className="text-yellow-600 text-sm mt-1">🔒 Premium Test</p>
                    )}
                    <button
                      onClick={() => handleStartTest(test)}
                      className={`mt-4 w-full py-2 rounded text-white ${
                        isLocked
                          ? "bg-gray-400 cursor-not-allowed"
                          : attempted[test.id]
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-blue-600 hover:bg-blue-700"
                      }`}
                      disabled={isLocked}
                    >
                      {isLocked
                        ? "Upgrade to Unlock"
                        : attempted[test.id]
                        ? "Resume Test"
                        : "Start Test"}
                    </button>
                  </div>
                );
              })}
          </div>
        </>
      )}
    </div>
  );
};

export default MockTestPage;
