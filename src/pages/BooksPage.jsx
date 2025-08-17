import React, { useState } from 'react';
import ResourceCard from '../components/ResourceCard';

const BooksPage = () => {
  const [selectedSubject, setSelectedSubject] = useState('All');

  const class10Books = [
    {
      title: 'Class 10 Hindi',
      description: 'NCERT Hindi Book - क्षितिज, काव्यांश, स्पर्श',
      subject: 'Hindi',
      viewLink: '/ebooks/class10/hindi.pdf',
      downloadLink: '/ebooks/class10/hindi.pdf',
    },
    {
      title: 'Class 10 English',
      description: 'NCERT English Book - First Flight, Footprints',
      subject: 'English',
      viewLink: '/ebooks/class10/english.pdf',
      downloadLink: '/ebooks/class10/english.pdf',
    },
    {
      title: 'Class 10 Sanskrit',
      description: 'NCERT Sanskrit Book - शेमुषी',
      subject: 'Sanskrit',
      viewLink: '/ebooks/class10/sanskrit.pdf',
      downloadLink: '/ebooks/class10/sanskrit.pdf',
    },
    {
      title: 'Class 10 Mathematics',
      description: 'NCERT Maths Book - Full Chapters',
      subject: 'Maths',
      viewLink: '/ebooks/class10/maths.pdf',
      downloadLink: '/ebooks/class10/maths.pdf',
    },
    {
      title: 'Class 10 Science',
      description: 'NCERT Science Book - Physics, Chem, Bio',
      subject: 'Science',
      viewLink: '/ebooks/class10/science.pdf',
      downloadLink: '/ebooks/class10/science.pdf',
    },
    {
      title: 'Class 10 Social Science',
      description: 'History, Civics, Geography, Economics',
      subject: 'Social Science',
      viewLink: '/ebooks/class10/social.pdf',
      downloadLink: '/ebooks/class10/social.pdf',
    },
  ];

  const class12Books = [
    {
      title: 'Class 12 Hindi',
      description: 'NCERT Hindi Book - आरोह, वितान',
      subject: 'Hindi',
      viewLink: '/ebooks/class12/hindi.pdf',
      downloadLink: '/ebooks/class12/hindi.pdf',
    },
    {
      title: 'Class 12 English',
      description: 'NCERT English Book - Flamingo, Vistas',
      subject: 'English',
      viewLink: '/ebooks/class12/english.pdf',
      downloadLink: '/ebooks/class12/english.pdf',
    },
    {
      title: 'Class 12 Mathematics',
      description: 'NCERT Maths Book - Part 1 & 2',
      subject: 'Maths',
      viewLink: '/ebooks/class12/maths.pdf',
      downloadLink: '/ebooks/class12/maths.pdf',
    },
    {
      title: 'Class 12 Physics',
      description: 'NCERT Physics Book - Part 1 & 2',
      subject: 'Physics',
      viewLink: '/ebooks/class12/physics.pdf',
      downloadLink: '/ebooks/class12/physics.pdf',
    },
    {
      title: 'Class 12 Chemistry',
      description: 'NCERT Chemistry Book - Part 1 & 2',
      subject: 'Chemistry',
      viewLink: '/ebooks/class12/chemistry.pdf',
      downloadLink: '/ebooks/class12/chemistry.pdf',
    },
    {
      title: 'Class 12 Biology',
      description: 'NCERT Biology Book - Complete',
      subject: 'Biology',
      viewLink: '/ebooks/class12/biology.pdf',
      downloadLink: '/ebooks/class12/biology.pdf',
    },
  ];

  const subjects = [
    'All',
    'Hindi',
    'English',
    'Sanskrit',
    'Maths',
    'Science',
    'Social Science',
    'Physics',
    'Chemistry',
    'Biology',
  ];

  const filterBooks = (books) => {
    if (selectedSubject === 'All') return books;
    return books.filter((book) => book.subject === selectedSubject);
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold text-center mb-6">📚 Class 10th & 12th NCERT eBooks</h1>

      {/* Filter Dropdown */}
      <div className="flex justify-center mb-8">
        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {subjects.map((subj, i) => (
            <option key={i} value={subj}>
              {subj}
            </option>
          ))}
        </select>
      </div>

      {/* Class 10 Books */}
      <section className="mb-12">
        <h2 className="text-2xl font-semibold text-indigo-700 mb-4">📗 Class 10 eBooks</h2>
        <div className="flex flex-wrap gap-6 justify-center">
          {filterBooks(class10Books).length ? (
            filterBooks(class10Books).map((book, i) => (
              <div key={i} className="w-full sm:w-[80%] md:w-[45%] lg:w-[30%]">
                <ResourceCard {...book} />
              </div>
            ))
          ) : (
            <p className="text-gray-500">No books found.</p>
          )}
        </div>
      </section>

      {/* Class 12 Books */}
      <section>
        <h2 className="text-2xl font-semibold text-indigo-700 mb-4">📙 Class 12 eBooks</h2>
        <div className="flex flex-wrap gap-6 justify-center">
          {filterBooks(class12Books).length ? (
            filterBooks(class12Books).map((book, i) => (
              <div key={i} className="w-full sm:w-[80%] md:w-[45%] lg:w-[30%]">
                <ResourceCard {...book} />
              </div>
            ))
          ) : (
            <p className="text-gray-500">No books found.</p>
          )}
        </div>
      </section>
    </div>
  );
};

export default BooksPage;
