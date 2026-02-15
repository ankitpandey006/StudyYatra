import React from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  FileText,
  ClipboardList,
  FileAudio,
  PenTool,
  ArrowRight,
  MessageSquareText,
} from "lucide-react";
import logo from "../assets/logo.jpeg";

const featuresTop = [
  {
    to: "/books",
    title: "Books / पुस्तकें",
    icon: <BookOpen className="h-6 w-6 text-indigo-600" />,
    desc: "All books in one place. सभी विषयों की पुस्तकें एक जगह।",
  },
  {
    to: "/notes",
    title: "Notes / नोट्स",
    icon: <FileText className="h-6 w-6 text-pink-600" />,
    desc: "Chapter-wise notes. क्लास-वार और टॉपिक-वार नोट्स।",
  },
  {
    to: "/pyq",
    title: "PYQ / पिछले वर्षों के प्रश्न",
    icon: <ClipboardList className="h-6 w-6 text-amber-600" />,
    desc: "Past questions for practice. पुराने प्रश्नों से तैयारी करें।",
  },
];

const featuresBottom = [
  {
    to: "/mocktest",
    title: "Mock Test / मॉक टेस्ट",
    icon: <PenTool className="h-6 w-6 text-teal-600" />,
    desc: "Instant quizzes to check your progress. जल्दी से टेस्ट दें।",
  },
  {
    to: "/audio",
    title: "Audio Books / ऑडियो बुक्स",
    icon: <FileAudio className="h-6 w-6 text-rose-600" />,
    desc: "Learn by listening. चलते-फिरते पढ़ाई करें।",
  },
];

const FeatureCard = ({ to, title, icon, desc }) => (
  <Link
    to={to}
    className="
      group bg-white/90 backdrop-blur
      p-6 rounded-2xl border border-white/70 shadow-sm
      hover:shadow-lg hover:-translate-y-1
      transition-all duration-300
      focus:outline-none focus:ring-2 focus:ring-indigo-300
    "
  >
    <div className="flex items-start justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gray-50 border border-gray-100">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
      </div>

      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition" />
    </div>

    <p className="mt-3 text-gray-600 leading-relaxed">{desc}</p>
  </Link>
);

const HomePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-sky-50 to-purple-50 text-gray-800">
      <div className="px-4 py-12 sm:py-16">
        <div className="mx-auto w-full max-w-7xl space-y-10">
          {/* Header */}
          <div className="text-center">
            <div className="relative inline-block">
              <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-300 via-purple-300 to-pink-300 blur-2xl opacity-25" />
              <div className="relative p-1 rounded-full bg-white shadow-md">
                <img
                  src={logo}
                  alt="StudyYatra Logo"
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-indigo-50"
                />
              </div>
            </div>

            <h1 className="mt-5 text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight">
              Welcome to <span className="text-indigo-700">StudyYatra</span>
            </h1>

            <p className="mt-3 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Books, Notes, PYQs, Mock Tests and Audio — Hindi & English.
            </p>

            {/* CTA */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/mocktest"
                className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl hover:bg-indigo-700 transition shadow-sm hover:shadow-md"
              >
                Start Mock Test
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                to="/books"
                className="inline-flex items-center gap-2 bg-white text-gray-900 px-6 py-2.5 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition"
              >
                Browse Books
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Founder Message (Replaced Quote) */}
          <div className="bg-white/90 backdrop-blur p-6 rounded-2xl shadow-sm border border-white/70 max-w-3xl mx-auto">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-100">
                <MessageSquareText className="h-5 w-5 text-emerald-700" />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Founder’s Message
                </h3>

                <p className="mt-2 text-gray-700 leading-relaxed">
                  The goal of StudyYatra is to provide students with a reliable and well-structured learning platform.
                 We aim to make education simple, digital, and effective for every learner.
                </p>
                <p className="mt-3 text-sm text-gray-500 font-medium">
                 Ankit Pandey & Mohit Kumar
                </p>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-5">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              What you can study here
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuresTop.map((item, idx) => (
                <FeatureCard key={idx} {...item} />
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {featuresBottom.map((item, idx) => (
                <FeatureCard key={idx} {...item} />
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-gray-500">
            Keep learning daily. छोटे-छोटे कदम, बड़ी सफलता।
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;