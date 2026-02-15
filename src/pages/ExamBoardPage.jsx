import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { BookOpen, FileText, ClipboardList, PenTool, Headphones, ArrowRight } from "lucide-react";

const ExamBoardPage = () => {
  const { board, level } = useParams();

  const boardTitle = useMemo(() => {
    if (!board) return "";
    return board.replace(/-/g, " ").toUpperCase();
  }, [board]);

  const classTitle = useMemo(() => {
    if (!level) return "";
    const val = String(level).replace(/-/g, " ");
    return val.toUpperCase();
  }, [level]);

  const sections = [
    {
      title: "Books",
      desc: "Explore subject-wise books for your class.",
      to: "/books",
      icon: <BookOpen className="h-5 w-5" />,
    },
    {
      title: "Notes",
      desc: "Chapter-wise notes in a clear format.",
      to: "/notes",
      icon: <FileText className="h-5 w-5" />,
    },
    {
      title: "PYQs",
      desc: "Previous year questions for practice.",
      to: "/pyq",
      icon: <ClipboardList className="h-5 w-5" />,
    },
    {
      title: "Mock Tests",
      desc: "Test your preparation with timed quizzes.",
      to: "/mocktest",
      icon: <PenTool className="h-5 w-5" />,
    },
    {
      title: "Audio",
      desc: "Learn by listening anywhere.",
      to: "/audiobooks",
      icon: <Headphones className="h-5 w-5" />,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-sky-50 to-purple-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14">
        {/* Header */}
        <div className="bg-white/85 backdrop-blur border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xs font-semibold tracking-wide text-indigo-700 bg-indigo-50 border border-indigo-100 inline-flex px-3 py-1 rounded-full">
                Exam Board
              </div>

              <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold text-slate-900">
                {boardTitle} <span className="text-slate-400">/</span> Class {classTitle}
              </h1>

              <p className="mt-2 text-slate-600 max-w-2xl leading-relaxed">
                Choose what you want to study. You can find books, notes, PYQs, mock tests and audio
                resources for your selected board and class.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/mocktest"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition shadow-sm hover:shadow-md"
              >
                Start Mock Test
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                to="/notes"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white text-slate-900 font-medium border border-slate-200 hover:bg-slate-50 transition"
              >
                Browse Notes
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Sections */}
        <div className="mt-8 sm:mt-10">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">
            Learning Resources
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Open any section to continue your preparation.
          </p>

          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sections.map((item, idx) => (
              <Link
                key={idx}
                to={item.to}
                className="
                  group bg-white/90 backdrop-blur
                  border border-slate-200 rounded-2xl p-6
                  shadow-sm hover:shadow-lg hover:-translate-y-0.5
                  transition-all duration-300
                "
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-indigo-700">
                      {item.icon}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">
                        {item.title}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">
                        {item.desc}
                      </p>
                    </div>
                  </div>

                  <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-indigo-700 group-hover:translate-x-1 transition" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-10 text-center text-sm text-slate-500">
          Tip: Start with Notes, then practice PYQs, and finish with Mock Tests.
        </div>
      </div>
    </div>
  );
};

export default ExamBoardPage;