import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, FileText, ClipboardList,
  FileAudio, PenTool,
} from 'lucide-react';
import logo from '../assets/logo.jpeg';

const featuresTop = [
  {
    to: '/books',
    title: 'Books / पुस्तकें',
    icon: <BookOpen className="h-8 w-8 text-indigo-600" />,
    desc: 'Explore a wide range of books. सभी विषयों की पुस्तकें एक जगह।',
  },
  {
    to: '/notes',
    title: 'Notes / नोट्स',
    icon: <FileText className="h-8 w-8 text-pink-600" />,
    desc: 'Access detailed notes to boost your understanding. क्लास-वार नोट्स।',
  },
  {
    to: '/pyq',
    title: 'PYQ / पिछले वर्षों के प्रश्न',
    icon: <ClipboardList className="h-8 w-8 text-amber-600" />,
    desc: 'Practice past papers. बेहतर तैयारी के लिए पुराने प्रश्न हल करें।',
  },
];

const featuresBottom = [
  {
    to: '/mocktest',
    title: 'Mock Test / मॉक टेस्ट',
    icon: <PenTool className="h-8 w-8 text-teal-600" />,
    desc: 'Take interactive quizzes. प्रश्नोत्तरी के जरिए तैयारी जांचें।',
  },
  {
    to: '/audio',
    title: 'Audio Books / ऑडियो बुक्स',
    icon: <FileAudio className="h-8 w-8 text-rose-600" />,
    desc: 'Listen and learn anywhere. चलते-फिरते पढ़ाई करें।',
  },
];

const HomePage = () => {
  return (
    <div className="bg-gradient-to-br from-indigo-100 via-blue-200 to-purple-200 text-gray-800 min-h-screen flex flex-col justify-center items-center px-4 py-12">
      <div className="space-y-12 w-full max-w-7xl">

        {/* Logo + Heading Section */}
        <div className="text-center">
          <div className="relative inline-block">
            {/* Background Effect */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-400 via-purple-400 to-pink-400 blur-2xl opacity-40 animate-pulse"></div>
            {/* Logo Container */}
            <div className="relative p-1 rounded-full bg-white shadow-xl hover:scale-105 transition-transform duration-300">
              <img
                src={logo}
                alt="StudyNest Logo"
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-full object-cover border-4 border-indigo-100 shadow-md"
              />
            </div>
          </div>

          <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold text-indigo-700 drop-shadow-md">
            Welcome to StudyYatra
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 mt-2 max-w-xl mx-auto">
            Your smart study partner for Books, Notes, Tests, and more...
          </p>
        </div>

        {/* Motivational Quote */}
        <div className="bg-white bg-opacity-90 p-4 sm:p-6 rounded-xl shadow-md text-center mx-auto max-w-2xl border-l-4 border-indigo-500">
          <p className="italic text-lg sm:text-xl font-medium text-indigo-600">
            “शिक्षा सबसे शक्तिशाली हथियार है जिससे आप दुनिया को बदल सकते हैं।” – नेल्सन मंडेला
          </p>
        </div>

        {/* Top 3 Features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuresTop.map((item, idx) => (
            <Link
              key={idx}
              to={item.to}
              className="bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-transform duration-300 border border-gray-200"
            >
              <div className="flex items-center gap-4 mb-3">
                {item.icon}
                <h3 className="text-xl font-bold text-indigo-700">{item.title}</h3>
              </div>
              <p className="text-gray-600">{item.desc}</p>
            </Link>
          ))}
        </div>

        {/* Bottom 2 Features Centered */}
        <div className="flex flex-wrap justify-center gap-6">
          {featuresBottom.map((item, idx) => (
            <Link
              key={idx}
              to={item.to}
              className="bg-white p-6 w-full sm:w-[300px] rounded-2xl shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-transform duration-300 border border-gray-200"
            >
              <div className="flex items-center gap-4 mb-3">
                {item.icon}
                <h3 className="text-xl font-bold text-indigo-700">{item.title}</h3>
              </div>
              <p className="text-gray-600">{item.desc}</p>
            </Link>
          ))}
        </div>

        {/* Daily Quiz CTA */}
        <div className="mt-12 text-center bg-white bg-opacity-90 p-6 rounded-2xl shadow-md border-l-4 border-green-500 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-green-700 mb-2">🧠 Daily Brain Booster</h2>
          <p className="text-gray-700 mb-4">
            आज का क्विज़ लें और रोज़ अभ्यास करें! हिंदी और इंग्लिश दोनों में।
          </p>
          <Link
            to="/mocktest"
            className="inline-block bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Start Today’s Quiz
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
