import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const MockTestStart = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050";

  const [questions, setQuestions] = useState([]);
  const [quizTitle, setQuizTitle] = useState("Mock Test");
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState({});
  const [timeLeft, setTimeLeft] = useState(20 * 60);
  const [isSlow, setIsSlow] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("studynest_user"));
    } catch {
      return null;
    }
  }, []);
  const userName = user?.name || "Guest";

  // ✅ stable id per question
  const getQuestionId = (q, idx) => q?.qNo || q?.id || `q-${idx + 1}`;

  // ✅ load quiz by id
  useEffect(() => {
    let mounted = true;
    const startTime = Date.now();
    const slowTimer = setTimeout(() => {
      if (mounted) setIsSlow(true);
    }, 4000);

    const fetchQuiz = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/quizzes/${id}`);

        clearTimeout(slowTimer);
        const loadTime = (Date.now() - startTime) / 1000;
        console.log(`✅ Quiz loaded in ${loadTime.toFixed(2)} seconds`);

        // ✅ new response shape: { success, quiz: { ... } }
        const quiz = res.data?.quiz || null;

        const qs = Array.isArray(quiz?.questions) ? quiz.questions : [];
        const title = quiz?.title || "Mock Test";

        if (!mounted) return;

        setQuestions(qs);
        setQuizTitle(title);

        // ✅ if quiz has duration in minutes, set timer from it
        const durationMin = Number(quiz?.duration);
        if (!Number.isNaN(durationMin) && durationMin > 0) {
          setTimeLeft(durationMin * 60);
        } else {
          setTimeLeft(20 * 60); // fallback
        }
      } catch (err) {
        clearTimeout(slowTimer);
        console.error("❌ Error fetching quiz:", err);
      } finally {
        if (mounted) setIsSlow(false);
      }
    };

    fetchQuiz();

    return () => {
      mounted = false;
      clearTimeout(slowTimer);
    };
  }, [API_URL, id]);

  // ✅ timer
  useEffect(() => {
    if (questions.length === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          // auto-submit when time ends
          setTimeout(() => handleSubmit(true), 200);
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line
  }, [questions.length]);

  const handleOptionChange = (index) => {
    const qid = getQuestionId(questions[current], current);
    setSelected((prev) => ({ ...prev, [qid]: index }));
  };

  const formatTime = (t) => {
    const minutes = String(Math.floor(t / 60)).padStart(2, "0");
    const seconds = String(t % 60).padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  // ✅ submit: use correctIndex (backend normalized)
  const handleSubmit = (auto = false) => {
    if (!auto) {
      if (!window.confirm("क्या आप वाकई टेस्ट सबमिट करना चाहते हैं?")) return;
    }

    const attempted = Object.keys(selected).length;
    const total = questions.length;
    let correct = 0;

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const qid = getQuestionId(q, i);
      const selectedIndex = selected[qid];

      if (selectedIndex === undefined) continue;

      // ✅ quizRoutes normalized field
      const correctIndex = Number(q.correctIndex);
      if (!Number.isNaN(correctIndex) && correctIndex === selectedIndex) {
        correct++;
      }
    }

    const result = {
      name: userName,
      quizId: id,
      quizTitle,
      attempted,
      skipped: total - attempted,
      total,
      correct,
      percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
      submittedAt: new Date().toISOString(),
    };

    localStorage.setItem("mock-test-result", JSON.stringify(result));
    navigate("/result");
  };

  const InstructionsBox = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-2xl w-[95%] max-w-2xl overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-bold mb-4 text-blue-700">📘 मॉक टेस्ट निर्देश</h2>
        <ul className="list-disc ml-6 space-y-2 text-gray-800 text-sm leading-relaxed">
          <li>
            इस टेस्ट में <strong>{questions.length}</strong> बहुविकल्पीय प्रश्न (MCQ) हैं।
          </li>
          <li>हर प्रश्न के चार विकल्प हैं, जिनमें से केवल एक सही है।</li>
          <li>उत्तर चुनने के लिए विकल्प के आगे दिए गए रेडियो बटन का उपयोग करें।</li>
          <li>आप कभी भी साइडबार से किसी भी प्रश्न पर जा सकते हैं।</li>
          <li>हरे रंग के बटन उन प्रश्नों को दर्शाते हैं जिनका आपने उत्तर दिया है।</li>
          <li>टाइमर समाप्त होने पर टेस्ट अपने आप सबमिट हो जाएगा।</li>
          <li>आप चाहें तो टाइमर समाप्त होने से पहले भी सबमिट कर सकते हैं।</li>
          <li>
            <strong>टेस्ट के दौरान पेज को रिफ्रेश या बंद न करें।</strong>
          </li>
        </ul>
        <div className="text-right mt-6">
          <button
            onClick={() => setShowInstructions(false)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            बंद करें
          </button>
        </div>
      </div>
    </div>
  );

  if (questions.length === 0) {
    return (
      <div className="p-6 text-xl flex items-center justify-center min-h-screen text-center">
        ⏳ Loading quiz...
        {isSlow && <span className="text-red-500 ml-2">(Taking longer than usual)</span>}
      </div>
    );
  }

  const currentQuestion = questions[current];
  const currentQId = getQuestionId(currentQuestion, current);

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Main Quiz Area */}
      <div className="flex-1 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-blue-600 mb-2 sm:mb-0">
            Welcome, {userName}
          </h2>
          <div className="text-red-600 font-semibold text-lg">⏰ {formatTime(timeLeft)}</div>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold mb-4 text-center">{quizTitle}</h1>

        <h2 className="font-semibold text-base sm:text-lg mb-2">
          Question {current + 1} of {questions.length}
        </h2>
        <h3 className="text-sm sm:text-base mb-4">{currentQuestion.question}</h3>

        <div className="space-y-2 text-sm sm:text-base">
          {Array.isArray(currentQuestion.options) &&
            currentQuestion.options.map((option, index) => (
              <div key={index} className="flex items-center">
                <input
                  type="radio"
                  id={`question-${currentQId}-option-${index}`}
                  name={`question-${currentQId}`}
                  checked={selected[currentQId] === index}
                  onChange={() => handleOptionChange(index)}
                  className="mr-2"
                />
                <label htmlFor={`question-${currentQId}-option-${index}`}>{option}</label>
              </div>
            ))}
        </div>

        <div className="mt-6 flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => setCurrent((c) => Math.max(c - 1, 0))}
            className="w-full sm:w-auto px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            disabled={current === 0}
          >
            Previous
          </button>

          <button
            onClick={() => setCurrent((c) => Math.min(c + 1, questions.length - 1))}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={current === questions.length - 1}
          >
            Save & Next
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-full lg:w-64 bg-blue-100 p-4 border-t lg:border-t-0 lg:border-l border-gray-300">
        <h4 className="font-bold mb-3 text-center lg:text-left">SECTION : Test</h4>

        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-3 gap-2 mb-6">
          {questions.map((q, idx) => {
            const qid = getQuestionId(q, idx);
            return (
              <button
                key={qid}
                className={`w-10 h-10 rounded text-sm ${
                  current === idx
                    ? "bg-blue-700 text-white"
                    : selected[qid] !== undefined
                    ? "bg-green-500 text-white"
                    : "bg-gray-300"
                }`}
                onClick={() => setCurrent(idx)}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        <div className="space-y-2">
          <button
            onClick={() => setShowInstructions(true)}
            className="w-full py-2 bg-white border border-gray-400 rounded"
          >
            Instructions
          </button>

          <button className="w-full py-2 bg-teal-600 text-white rounded mt-4" onClick={() => handleSubmit(false)}>
            Submit Test
          </button>
        </div>
      </div>

      {/* Instructions Modal */}
      {showInstructions && <InstructionsBox />}
    </div>
  );
};

export default MockTestStart;