import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import {
  AlarmClock,
  ChevronLeft,
  ChevronRight,
  Info,
  CheckCircle2,
  Circle,
  Send,
  Loader2,
  AlertTriangle,
  X,
} from "lucide-react";

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
  const [loading, setLoading] = useState(true);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("studynest_user"));
    } catch {
      return null;
    }
  }, []);
  const userName = user?.name || "Guest";

  // stable id per question
  const getQuestionId = (q, idx) => q?.qNo || q?.id || `q-${idx + 1}`;

  // Load quiz by id
  useEffect(() => {
    let mounted = true;
    setLoading(true);

    const startTime = Date.now();
    const slowTimer = setTimeout(() => {
      if (mounted) setIsSlow(true);
    }, 3500);

    const fetchQuiz = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/quizzes/${id}`);
        const quiz = res.data?.quiz || null;

        const qs = Array.isArray(quiz?.questions) ? quiz.questions : [];
        const title = quiz?.title || "Mock Test";

        if (!mounted) return;

        setQuestions(qs);
        setQuizTitle(title);

        const durationMin = Number(quiz?.duration);
        if (!Number.isNaN(durationMin) && durationMin > 0) {
          setTimeLeft(durationMin * 60);
        } else {
          setTimeLeft(20 * 60);
        }

        const loadTime = (Date.now() - startTime) / 1000;
        console.log(`Quiz loaded in ${loadTime.toFixed(2)} seconds`);
      } catch (err) {
        console.error("Error fetching quiz:", err?.response?.data || err?.message);
        if (mounted) setQuestions([]);
      } finally {
        clearTimeout(slowTimer);
        if (mounted) {
          setIsSlow(false);
          setLoading(false);
        }
      }
    };

    fetchQuiz();

    return () => {
      mounted = false;
      clearTimeout(slowTimer);
    };
  }, [API_URL, id]);

  // Timer
  useEffect(() => {
    if (questions.length === 0) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
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

  // Submit (uses correctIndex normalized in backend)
  const handleSubmit = (auto = false) => {
    if (!auto) {
      const ok = window.confirm("Are you sure you want to submit the test?");
      if (!ok) return;
    }

    const attempted = Object.keys(selected).length;
    const total = questions.length;
    let correct = 0;

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      const qid = getQuestionId(q, i);
      const selectedIndex = selected[qid];

      if (selectedIndex === undefined) continue;

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

  const InstructionsModal = () => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl border border-slate-200 overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
              <Info className="h-5 w-5 text-indigo-700" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Test Instructions
              </h2>
              <p className="text-sm text-slate-600">
                Please read carefully before continuing.
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowInstructions(false)}
            className="h-10 w-10 inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6">
          <ul className="space-y-2 text-sm text-slate-700 leading-relaxed list-disc pl-5">
            <li>
              This test contains <strong>{questions.length}</strong> multiple-choice questions.
            </li>
            <li>Each question has four options. Only one is correct.</li>
            <li>Select an option to save your answer.</li>
            <li>You can move between questions using the sidebar.</li>
            <li>Answered questions will be marked in the sidebar.</li>
            <li>The test will auto-submit when the timer ends.</li>
            <li>Please avoid refreshing or closing the page during the test.</li>
          </ul>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-end">
            <button
              onClick={() => setShowInstructions(false)}
              className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition shadow-sm"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-sky-50 to-purple-50 px-4 flex items-center justify-center">
        <div className="w-full max-w-md bg-white/90 backdrop-blur border border-slate-200 rounded-2xl shadow-sm p-6 text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-700" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-900">Loading test</h2>
          <p className="mt-2 text-sm text-slate-600">
            Please wait while we fetch your questions.
          </p>
          {isSlow && (
            <div className="mt-3 inline-flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-xl">
              <AlertTriangle className="h-4 w-4" />
              Taking longer than usual.
            </div>
          )}
        </div>
      </div>
    );
  }

  // Not found / empty
  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-sky-50 to-purple-50 px-4 flex items-center justify-center">
        <div className="w-full max-w-md bg-white/90 backdrop-blur border border-slate-200 rounded-2xl shadow-sm p-6 text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-rose-700" />
          </div>
          <h2 className="mt-4 text-lg font-bold text-slate-900">No questions found</h2>
          <p className="mt-2 text-sm text-slate-600">
            This test is unavailable right now. Please try another test.
          </p>
          <button
            onClick={() => navigate("/mocktest")}
            className="mt-5 w-full inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition shadow-sm"
          >
            Back to Tests
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[current];
  const currentQId = getQuestionId(currentQuestion, current);

  const attemptedCount = Object.keys(selected).length;
  const totalCount = questions.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-sky-50 to-purple-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Main */}
          <div className="bg-white/90 backdrop-blur border border-slate-200 rounded-2xl shadow-sm">
            {/* Top bar */}
            <div className="p-4 sm:p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <div className="text-sm text-slate-500">Student</div>
                <div className="text-lg font-semibold text-slate-900">
                  {userName}
                </div>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-3">
                <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 font-semibold">
                  <AlarmClock className="h-4 w-4" />
                  <span>{formatTime(timeLeft)}</span>
                </div>
                <button
                  onClick={() => setShowInstructions(true)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
                >
                  <Info className="h-4 w-4" />
                  Instructions
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 text-center">
                {quizTitle}
              </h1>

              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-700">
                  Question {current + 1} of {totalCount}
                </div>
                <div className="text-sm text-slate-600">
                  Attempted: <span className="font-semibold">{attemptedCount}</span> / {totalCount}
                </div>
              </div>

              <div className="mt-3 rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
                <div className="text-sm sm:text-base font-semibold text-slate-900 leading-relaxed">
                  {currentQuestion?.question}
                </div>

                <div className="mt-4 space-y-2">
                  {Array.isArray(currentQuestion?.options) &&
                    currentQuestion.options.map((option, index) => {
                      const checked = selected[currentQId] === index;
                      return (
                        <label
                          key={index}
                          htmlFor={`q-${currentQId}-opt-${index}`}
                          className={`flex items-start gap-3 p-3 rounded-2xl border transition cursor-pointer
                            ${checked ? "border-indigo-300 bg-indigo-50" : "border-slate-200 bg-white hover:bg-slate-50"}`}
                        >
                          <input
                            type="radio"
                            id={`q-${currentQId}-opt-${index}`}
                            name={`q-${currentQId}`}
                            checked={checked}
                            onChange={() => handleOptionChange(index)}
                            className="mt-1"
                          />
                          <span className="text-sm sm:text-base text-slate-800 leading-relaxed">
                            {option}
                          </span>
                        </label>
                      );
                    })}
                </div>
              </div>

              {/* Navigation buttons */}
              <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:justify-between">
                <button
                  onClick={() => setCurrent((c) => Math.max(c - 1, 0))}
                  disabled={current === 0}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 transition disabled:opacity-60"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>

                <button
                  onClick={() => setCurrent((c) => Math.min(c + 1, totalCount - 1))}
                  disabled={current === totalCount - 1}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition shadow-sm disabled:opacity-60"
                >
                  Save & Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="bg-white/90 backdrop-blur border border-slate-200 rounded-2xl shadow-sm">
            <div className="p-4 sm:p-6 border-b border-slate-200">
              <h4 className="text-sm font-semibold text-slate-900">Questions</h4>
              <p className="mt-1 text-xs text-slate-600">
                Select a question to navigate.
              </p>
            </div>

            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const qid = getQuestionId(q, idx);
                  const isAnswered = selected[qid] !== undefined;
                  const isCurrent = current === idx;

                  return (
                    <button
                      key={qid}
                      onClick={() => setCurrent(idx)}
                      className={`h-10 rounded-xl text-sm font-semibold border transition
                        ${
                          isCurrent
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : isAnswered
                            ? "bg-emerald-50 border-emerald-200 text-emerald-800 hover:bg-emerald-100"
                            : "bg-white border-slate-200 text-slate-700 hover:bg-slate-50"
                        }`}
                      aria-label={`Go to question ${idx + 1}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <div className="inline-flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    Answered
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <Circle className="h-4 w-4 text-slate-400" />
                    Unanswered
                  </div>
                </div>

                <button
                  onClick={() => handleSubmit(false)}
                  className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition shadow-sm"
                >
                  <Send className="h-4 w-4" />
                  Submit Test
                </button>

                <button
                  onClick={() => setShowInstructions(true)}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 transition"
                >
                  <Info className="h-4 w-4" />
                  View Instructions
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>

      {showInstructions && <InstructionsModal />}
    </div>
  );
};

export default MockTestStart;