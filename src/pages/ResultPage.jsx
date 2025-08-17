import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // ✅ Added

const ResultPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth(); // ✅ Logged-in user
  const result = JSON.parse(localStorage.getItem("mock-test-result"));

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-red-600">
        🔐 Please login to view your results.
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen flex items-center justify-center text-lg text-red-600">
        ❌ कोई रिजल्ट नहीं मिला।
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-white p-6 flex flex-col items-center">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">
          📊 Mock Test Result
        </h2>

        <div className="space-y-4 text-left text-lg">
          <div>
            <span className="font-semibold text-gray-700">👤 Name:</span>{" "}
            <span className="text-gray-900">
              {currentUser.displayName || result.name || "Student"}
            </span>
          </div>
          <div>
            <span className="font-semibold text-gray-700">📋 Total Questions:</span>{" "}
            {result.total}
          </div>
          <div>
            <span className="font-semibold text-gray-700">✅ Attempted:</span>{" "}
            {result.attempted}
          </div>
          <div>
            <span className="font-semibold text-gray-700">⚠️ Skipped:</span>{" "}
            {result.skipped}
          </div>
          <div>
            <span className="font-semibold text-gray-700">🎯 Correct:</span>{" "}
            {result.correct}
          </div>
        </div>

        <div className="mt-6 text-center">
          <div className="text-xl font-bold text-green-600">
            🎓 Score: {result.percentage}%
          </div>
          <div className="mt-2">
            {result.percentage >= 80 ? (
              <span className="text-green-700 font-semibold">🌟 Excellent performance!</span>
            ) : result.percentage >= 50 ? (
              <span className="text-yellow-600 font-semibold">👍 Good attempt, keep practicing!</span>
            ) : (
              <span className="text-red-600 font-semibold">📚 Needs Improvement!</span>
            )}
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <button
            onClick={() => navigate("/")}
            className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            🔁 Go to Home
          </button>
          <button
            onClick={() => navigate("/mocktest")}
            className="w-full py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
          >
            📘 Take Another Test
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;
