import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  BarChart3,
  User,
  ClipboardList,
  CheckCircle2,
  XCircle,
  Target,
  ArrowLeft,
  RotateCcw,
  LogIn,
} from "lucide-react";

const ResultPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const result = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("mock-test-result"));
    } catch {
      return null;
    }
  }, []);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-sky-50 to-purple-50 px-4 flex items-center justify-center">
        <div className="w-full max-w-md bg-white/90 backdrop-blur border border-slate-200 rounded-2xl shadow-sm p-6 text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
            <LogIn className="h-6 w-6 text-indigo-700" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-slate-900">
            Login required
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Please login to view your mock test results.
          </p>

          <button
            onClick={() => navigate("/login")}
            className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition shadow-sm"
          >
            Go to Login
          </button>

          <button
            onClick={() => navigate("/")}
            className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-sky-50 to-purple-50 px-4 flex items-center justify-center">
        <div className="w-full max-w-md bg-white/90 backdrop-blur border border-slate-200 rounded-2xl shadow-sm p-6 text-center">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-rose-50 border border-rose-100 flex items-center justify-center">
            <XCircle className="h-6 w-6 text-rose-700" />
          </div>
          <h2 className="mt-4 text-xl font-bold text-slate-900">
            Result not found
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            We could not find your result. Please take a test again.
          </p>

          <button
            onClick={() => navigate("/mocktest")}
            className="mt-5 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition shadow-sm"
          >
            <RotateCcw className="h-4 w-4" />
            Take a Test
          </button>

          <button
            onClick={() => navigate("/")}
            className="mt-3 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 transition"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const name = currentUser?.displayName || result?.name || "Student";
  const total = Number(result?.total || 0);
  const attempted = Number(result?.attempted || 0);
  const skipped = Number(result?.skipped || Math.max(total - attempted, 0));
  const correct = Number(result?.correct || 0);
  const percentage = Number(result?.percentage || 0);

  const performance = useMemo(() => {
    if (percentage >= 80)
      return {
        label: "Excellent",
        note: "Strong performance. Keep it consistent.",
        tone: "text-emerald-700",
        bg: "bg-emerald-50 border-emerald-100",
      };
    if (percentage >= 50)
      return {
        label: "Good",
        note: "Good attempt. Practice a bit more to improve.",
        tone: "text-amber-700",
        bg: "bg-amber-50 border-amber-100",
      };
    return {
      label: "Needs Improvement",
      note: "Focus on basics and try again.",
      tone: "text-rose-700",
      bg: "bg-rose-50 border-rose-100",
    };
  }, [percentage]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-sky-50 to-purple-50">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-14">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
              <BarChart3 className="h-4 w-4" />
              Mock Test Result
            </div>
            <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900">
              Result Summary
            </h1>
            <p className="mt-2 text-sm sm:text-base text-slate-600">
              Review your score and key stats.
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-900 hover:bg-slate-50 transition"
            >
              <ArrowLeft className="h-4 w-4" />
              Home
            </button>
            <button
              onClick={() => navigate("/mocktest")}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition shadow-sm"
            >
              <RotateCcw className="h-4 w-4" />
              Retake Test
            </button>
          </div>
        </div>

        {/* Cards */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Score Card */}
          <div className="lg:col-span-1 bg-white/90 backdrop-blur border border-slate-200 rounded-2xl shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-700">Score</div>
              <div
                className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${performance.bg} ${performance.tone}`}
              >
                {performance.label}
              </div>
            </div>

            <div className="mt-4">
              <div className="text-4xl font-extrabold text-slate-900">
                {percentage}%
              </div>
              <p className={`mt-2 text-sm ${performance.tone}`}>
                {performance.note}
              </p>
            </div>

            {/* Progress bar */}
            <div className="mt-5">
              <div className="h-2.5 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full"
                  style={{ width: `${Math.min(Math.max(percentage, 0), 100)}%` }}
                />
              </div>
              <div className="mt-2 text-xs text-slate-500">
                Correct: {correct} / {total}
              </div>
            </div>
          </div>

          {/* Details Card */}
          <div className="lg:col-span-2 bg-white/90 backdrop-blur border border-slate-200 rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center">
                <User className="h-5 w-5 text-indigo-700" />
              </div>
              <div>
                <div className="text-sm text-slate-500">Student</div>
                <div className="text-lg font-semibold text-slate-900">{name}</div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2 text-slate-700 font-semibold">
                  <ClipboardList className="h-4 w-4 text-indigo-700" />
                  Total Questions
                </div>
                <div className="mt-2 text-2xl font-bold text-slate-900">
                  {total}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2 text-slate-700 font-semibold">
                  <Target className="h-4 w-4 text-indigo-700" />
                  Attempted
                </div>
                <div className="mt-2 text-2xl font-bold text-slate-900">
                  {attempted}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2 text-slate-700 font-semibold">
                  <XCircle className="h-4 w-4 text-indigo-700" />
                  Skipped
                </div>
                <div className="mt-2 text-2xl font-bold text-slate-900">
                  {skipped}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-4">
                <div className="flex items-center gap-2 text-slate-700 font-semibold">
                  <CheckCircle2 className="h-4 w-4 text-indigo-700" />
                  Correct
                </div>
                <div className="mt-2 text-2xl font-bold text-slate-900">
                  {correct}
                </div>
              </div>
            </div>

            <div className="mt-6 text-sm text-slate-600">
              Tip: Revise weak topics, then retake the test to improve your score.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultPage;