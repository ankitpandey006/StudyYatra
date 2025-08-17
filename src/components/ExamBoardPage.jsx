import React from 'react';
import { useParams } from 'react-router-dom';

const ExamBoardPage = () => {
  const { board, level } = useParams(); // Get params from the URL

  console.log("Board:", board);
  console.log("Level:", level);

  return (
    <div className="min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-4">
        {board.toUpperCase()} - Class {level}
      </h1>
      <p className="text-gray-600">
        Here you can display study materials, syllabus, books, previous year papers, etc., for the selected board and class.
      </p>
      {/* Your dynamic content can go here */}
    </div>
  );
};

export default ExamBoardPage;
