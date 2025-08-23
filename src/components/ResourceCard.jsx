import React from 'react';
import { Eye, Download } from 'lucide-react';

const ResourceCard = ({ title, description, viewLink, downloadLink, subject }) => {
  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border hover:shadow-md transition duration-200 flex flex-col justify-between h-full">
      <div>
        {subject && (
          <div className="text-sm text-indigo-600 font-medium mb-1">📘 {subject}</div>
        )}
        <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-4">{description}</p>
      </div>
      <div className="flex justify-between items-center mt-auto gap-3">
        <a
          href={viewLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-700 text-white rounded hover:bg-indigo-600 transition"
        >
          <Eye size={16} /> View
        </a>
        <a
          href={downloadLink}
          download
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition"
        >
          <Download size={16} /> Download
        </a>
      </div>
    </div>
  );
};

export default ResourceCard;
