import React, { useState } from 'react';

const AudioPage = () => {
  const [currentAudio, setCurrentAudio] = useState(null);
  const [currentTitle, setCurrentTitle] = useState('');
  const [currentAuthor, setCurrentAuthor] = useState('');
  const [selectedBoard, setSelectedBoard] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  const boards = ['Bihar Board', 'UP Board', 'CBSE Board'];
  const classes = ['10th', '12th'];
  const subjects = ['Mathematics', 'Science', 'English', 'Hindi', 'Physics', 'Chemistry', 'Biology'];

  const audioBooks = [
    { board: 'Bihar Board', class: '10th', subject: 'Mathematics', title: 'Algebra Basics', author: 'John Doe', file: 'algebra-basics.mp3' },
    { board: 'Bihar Board', class: '10th', subject: 'Science', title: 'Physics Fundamentals', author: 'Jane Smith', file: 'physics-fundamentals.mp3' },
    { board: 'CBSE Board', class: '12th', subject: 'Physics', title: 'Quantum Mechanics', author: 'Albert Einstein', file: 'quantum-mechanics.mp3' },
    { board: 'UP Board', class: '12th', subject: 'Chemistry', title: 'Organic Chemistry', author: 'Marie Curie', file: 'organic-chemistry.mp3' },
    { board: 'CBSE Board', class: '10th', subject: 'English', title: 'Shakespearean Literature', author: 'William Shakespeare', file: 'shakespeare-literature.mp3' },
  ];

  const handlePlayAudio = (audioFile, title, author) => {
    setCurrentAudio(audioFile);
    setCurrentTitle(title);
    setCurrentAuthor(author);
  };

  const filteredAudioBooks = audioBooks.filter(
    (audio) =>
      (!selectedBoard || audio.board === selectedBoard) &&
      (!selectedClass || audio.class === selectedClass) &&
      (!selectedSubject || audio.subject === selectedSubject)
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white p-6 rounded-lg shadow-lg">
        <h2 className="text-3xl font-bold text-blue-600 mb-6">Audio Books</h2>
        <p className="text-gray-600 mb-4">Explore our collection of audio books and listen using the player below.</p>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Board</label>
            <select
              value={selectedBoard}
              onChange={(e) => setSelectedBoard(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded-md"
            >
              <option value="">All Boards</option>
              {boards.map((board) => (
                <option key={board} value={board}>
                  {board}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded-md"
            >
              <option value="">All Classes</option>
              {classes.map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Subject</label>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full border border-gray-300 p-2 rounded-md"
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

        {/* Audio Book List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
          {filteredAudioBooks.map((audio, index) => (
            <div
              key={index}
              className="bg-gray-50 p-4 rounded-lg shadow-md flex flex-col justify-between"
            >
              <div>
                <h3 className="text-lg font-semibold text-blue-600">{audio.title}</h3>
                <p className="text-sm text-gray-600">By {audio.author}</p>
                <p className="text-sm text-gray-600">Board: {audio.board}</p>
                <p className="text-sm text-gray-600">Class: {audio.class}</p>
                <p className="text-sm text-gray-600">Subject: {audio.subject}</p>
              </div>
              <button
                onClick={() => handlePlayAudio(audio.file, audio.title, audio.author)}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                Play
              </button>
            </div>
          ))}
        </div>

        {/* Single Audio Player */}
        {currentAudio && (
          <div className="bg-gray-50 p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold text-blue-600 mb-2">{currentTitle}</h3>
            <p className="text-sm text-gray-600 mb-4">By {currentAuthor}</p>
            <audio controls className="w-full">
              <source src={`/audio/${currentAudio}`} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioPage;
