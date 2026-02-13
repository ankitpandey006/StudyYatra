import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  FiSearch,
  FiDownload,
  FiFilter,
  FiX,
  FiChevronsRight,
  FiSliders,
  FiEye,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

// ✅ Keep subject names SAME as upload dropdown (Math not Mathematics)
const SUBJECTS = [
  "Math",
  "Science",
  "English",
  "Hindi",
  "Sanskrit",
  "Social Science",
  "Physics",
  "Chemistry",
  "Biology",
];

/**
 * ✅ Cloudinary helper (safe)
 * - Keeps the actual resource type from the stored URL (image/raw/video) to prevent 404
 * - View: open in browser
 * - Download: add fl_attachment:true to force download
 */
const normalizeCloudinaryUrl = (url = "") => {
  if (!url) return url;
  if (!url.includes("res.cloudinary.com")) return url;

  const match = url.match(/\/(image|raw|video)\/upload\//);
  const resourceType = match?.[1] || "raw";

  return url
    .replace("/image/upload/", `/${resourceType}/upload/`)
    .replace("/raw/upload/", `/${resourceType}/upload/`)
    .replace("/video/upload/", `/${resourceType}/upload/`);
};

const getCloudinaryViewUrl = (url = "") => normalizeCloudinaryUrl(url);

const getCloudinaryDownloadUrl = (url = "") => {
  let u = normalizeCloudinaryUrl(url);

  if (u.includes("/upload/") && !u.includes("fl_attachment:true")) {
    u = u.replace("/upload/", "/upload/fl_attachment:true/");
  }
  return u;
};

// --- Custom Hook ---
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

// --- Reusable Filter Checkbox ---
const FilterCheckbox = ({ id, label, count, checked, onChange }) => (
  <div className="flex items-center justify-between text-gray-700 hover:bg-indigo-50 p-2 rounded-md transition-colors duration-200">
    <label htmlFor={id} className="font-medium cursor-pointer flex-grow">
      {label}
    </label>
    <div className="flex items-center gap-2">
      <span className="text-xs font-semibold bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
        {count}
      </span>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
      />
    </div>
  </div>
);

// --- Filter Panel ---
const FilterPanel = ({
  searchTerm,
  setSearchTerm,
  classes,
  selectedClasses,
  setSelectedClasses,
  years,
  selectedYears,
  setSelectedYears,
  subjects,
  selectedSubjects,
  setSelectedSubjects,
  handleFilterChange,
  clearAllFilters,
  activeFilterCount,
}) => (
  <div className="space-y-6">
    <div className="bg-white p-4 rounded-lg shadow">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-800">Search & Filter</h2>
        {activeFilterCount > 0 && (
          <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2 py-1 rounded-full">
            {activeFilterCount} Active
          </span>
        )}
      </div>
      <div className="relative">
        <FiSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search papers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border border-gray-300 p-2 pl-10 rounded-lg focus:ring-2 focus:ring-indigo-500"
        />
      </div>
    </div>

    {/* Class Filter */}
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold mb-2">Class</h3>
      <div className="space-y-1">
        {classes.map(({ value, count }) => (
          <FilterCheckbox
            key={value}
            id={`class-${value}`}
            label={value}
            count={count}
            checked={selectedClasses.includes(value)}
            onChange={() => handleFilterChange(setSelectedClasses, value)}
          />
        ))}
      </div>
    </div>

    {/* Subject Filter */}
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold mb-2">Subject</h3>
      <div className="space-y-1 max-h-60 overflow-y-auto">
        {subjects.map(({ value, count }) => (
          <FilterCheckbox
            key={value}
            id={`subject-${value}`}
            label={value}
            count={count}
            checked={selectedSubjects.includes(value)}
            onChange={() => handleFilterChange(setSelectedSubjects, value)}
          />
        ))}
      </div>
    </div>

    {/* Year Filter */}
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="font-semibold mb-2">Year</h3>
      <div className="space-y-1 max-h-60 overflow-y-auto">
        {years.map(({ value, count }) => (
          <FilterCheckbox
            key={value}
            id={`year-${value}`}
            label={String(value)}
            count={count}
            checked={selectedYears.includes(value)}
            onChange={() => handleFilterChange(setSelectedYears, value)}
          />
        ))}
      </div>
    </div>

    <button
      onClick={clearAllFilters}
      className="w-full flex items-center justify-center gap-2 text-sm bg-red-100 text-red-700 font-bold py-2 px-4 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
      disabled={activeFilterCount === 0}
    >
      <FiX /> Clear All Filters
    </button>
  </div>
);

// --- Preview Modal ---
const PreviewModal = ({ file, onClose }) => {
  if (!file) return null;

  const viewUrl = getCloudinaryViewUrl(file.fileUrl);
  const downloadUrl = getCloudinaryDownloadUrl(file.fileUrl);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-2xl w-full max-w-4xl h-[90vh] flex flex-col"
      >
        <header className="flex items-center justify-between p-4 border-b">
          <h3 className="font-bold text-lg text-gray-800">
            {`${file.subject} - ${file.year}`}
          </h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-900">
            <FiX size={24} />
          </button>
        </header>

        <div className="flex-1 p-2">
          <iframe
            src={viewUrl}
            title={`Preview of ${file.title || file.publicId}`}
            className="w-full h-full border-0 rounded"
          />
        </div>

        <div className="p-4 border-t flex justify-end">
          <a
            href={downloadUrl}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <FiDownload /> Download
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
};

// --- PYQ Card ---
const PYQCard = ({ pyq, onPreview }) => {
  const viewUrl = getCloudinaryViewUrl(pyq.fileUrl);
  const downloadUrl = getCloudinaryDownloadUrl(pyq.fileUrl);

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden border border-gray-200"
    >
      <div className="p-4">
        <div className="flex items-center gap-3">
          <div className="text-xl p-2 bg-indigo-50 text-indigo-600 rounded-md">📄</div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{pyq.year}</h3>
            <p className="text-sm text-gray-600">
              Class {pyq.classLevel} – {pyq.subject}
            </p>
            {pyq.title && (
              <p className="text-xs text-gray-500 mt-1 line-clamp-1">{pyq.title}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 bg-gray-50 border-t">
        <button
          onClick={onPreview}
          className="flex items-center justify-center gap-2 py-2.5 text-gray-600 font-semibold hover:bg-gray-200"
        >
          <FiEye /> Preview
        </button>
        <a
          href={downloadUrl}
          className="flex items-center justify-center gap-2 py-2.5 text-indigo-700 font-semibold hover:bg-indigo-100 border-l"
        >
          <FiDownload /> Download
        </a>
      </div>
    </motion.div>
  );
};

// --- Main Component ---
const PYQPage = () => {
  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5050";

  const [loading, setLoading] = useState(true);
  const [allPapers, setAllPapers] = useState([]);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);

  const [selectedClasses, setSelectedClasses] = useState([]); // "Class 10" / "Class 12"
  const [selectedYears, setSelectedYears] = useState([]); // number
  const [selectedSubjects, setSelectedSubjects] = useState([]); // "Math" etc.
  const [searchTerm, setSearchTerm] = useState("");

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // ✅ Load from backend (public)
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        // ✅ fetch all pyq (filters client-side)
        const res = await axios.get(`${API_URL}/api/upload/public`, {
          params: { type: "pyq" },
        });

        const uploads = res.data?.uploads || [];

        // normalize year => number
        const normalized = uploads
          .map((u) => ({
            ...u,
            year: u.year ? Number(u.year) : null,
            classLevel: String(u.classLevel || ""),
          }))
          .filter((u) => u.year && u.classLevel); // only valid records

        setAllPapers(normalized);
      } catch (e) {
        console.error(e);
        setAllPapers([]);
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line
  }, []);

  // --- Build filter options ---
  const { classes, years, subjects } = useMemo(() => {
    const classCounts = {},
      yearCounts = {},
      subjectCounts = {};
    allPapers.forEach((p) => {
      classCounts[p.classLevel] = (classCounts[p.classLevel] || 0) + 1;
      yearCounts[p.year] = (yearCounts[p.year] || 0) + 1;
      subjectCounts[p.subject] = (subjectCounts[p.subject] || 0) + 1;
    });

    return {
      classes: Object.entries(classCounts)
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => Number(a.value) - Number(b.value))
        .map((x) => ({ ...x, value: `Class ${x.value}` })), // display label
      years: Object.entries(yearCounts)
        .map(([value, count]) => ({ value: Number(value), count }))
        .sort((a, b) => b.value - a.value),
      subjects: Object.entries(subjectCounts)
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => a.value.localeCompare(b.value)),
    };
  }, [allPapers]);

  const activeFilterCount = useMemo(() => {
    let count = selectedClasses.length + selectedYears.length + selectedSubjects.length;
    if (debouncedSearchTerm.trim()) count += 1;
    return count;
  }, [selectedClasses, selectedYears, selectedSubjects, debouncedSearchTerm]);

  // --- Filtering ---
  const filteredPYQs = useMemo(() => {
    const searchLower = debouncedSearchTerm.toLowerCase();

    return allPapers.filter((pyq) => {
      const clsLabel = `Class ${pyq.classLevel}`;

      return (
        (selectedClasses.length === 0 || selectedClasses.includes(clsLabel)) &&
        (selectedYears.length === 0 || selectedYears.includes(pyq.year)) &&
        (selectedSubjects.length === 0 || selectedSubjects.includes(pyq.subject)) &&
        (`Bihar Board Class ${pyq.classLevel} ${pyq.subject} ${pyq.year}`
          .toLowerCase()
          .includes(searchLower))
      );
    });
  }, [selectedClasses, selectedYears, selectedSubjects, debouncedSearchTerm, allPapers]);

  const groupedBySubject = useMemo(() => {
    const grouped = {};
    filteredPYQs.forEach((pyq) => {
      if (!grouped[pyq.subject]) grouped[pyq.subject] = [];
      grouped[pyq.subject].push(pyq);
    });
    Object.values(grouped).forEach((group) => group.sort((a, b) => b.year - a.year));
    return grouped;
  }, [filteredPYQs]);

  const sortedSubjects = useMemo(() => Object.keys(groupedBySubject).sort(), [groupedBySubject]);

  const handleFilterChange = (setter, value) => {
    setter((prev) => (prev.includes(value) ? prev.filter((i) => i !== value) : [...prev, value]));
  };

  const clearAllFilters = () => {
    setSelectedClasses([]);
    setSelectedYears([]);
    setSelectedSubjects([]);
    setSearchTerm("");
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <header className="bg-white shadow-sm sticky top-0 z-20">
        <div className="max-w-screen-xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-3xl text-indigo-600">📘</div>
            <h1 className="text-xl font-bold text-gray-800">Bihar Board PYQ</h1>
          </div>
          <button
            onClick={() => setIsFilterOpen(true)}
            className="relative lg:hidden flex items-center gap-2 bg-indigo-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-indigo-700"
          >
            <FiSliders />
            Filter
            {activeFilterCount > 0 && (
              <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white border-2 border-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <div className="max-w-screen-xl mx-auto p-4 flex gap-8">
        {/* Mobile Filter Panel */}
        <AnimatePresence>
          {isFilterOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsFilterOpen(false)}
                className="bg-black/60 fixed inset-0 z-30 lg:hidden"
              />
              <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="fixed top-0 left-0 h-full w-full max-w-xs bg-gray-100 z-40 p-4 overflow-y-auto"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">Filters</h2>
                  <button onClick={() => setIsFilterOpen(false)}>
                    <FiX size={24} />
                  </button>
                </div>

                <FilterPanel
                  {...{
                    searchTerm,
                    setSearchTerm,
                    classes,
                    selectedClasses,
                    setSelectedClasses,
                    years,
                    selectedYears,
                    setSelectedYears,
                    subjects,
                    selectedSubjects,
                    setSelectedSubjects,
                    handleFilterChange,
                    clearAllFilters,
                    activeFilterCount,
                  }}
                />

                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="mt-6 w-full bg-indigo-700 text-white font-bold py-2.5 rounded-lg"
                >
                  View {filteredPYQs.length} Results
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Sidebar Filters */}
        <aside className="hidden lg:block lg:w-1/4 xl:w-1/5">
          <div className="sticky top-24">
            <FilterPanel
              {...{
                searchTerm,
                setSearchTerm,
                classes,
                selectedClasses,
                setSelectedClasses,
                years,
                selectedYears,
                setSelectedYears,
                subjects,
                selectedSubjects,
                setSelectedSubjects,
                handleFilterChange,
                clearAllFilters,
                activeFilterCount,
              }}
            />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow p-5 h-40 animate-pulse"></div>
              ))}
            </div>
          ) : sortedSubjects.length > 0 ? (
            <div className="space-y-12">
              {sortedSubjects.map((subject) => (
                <section key={subject}>
                  <div className="flex items-center gap-3 mb-4">
                    <FiChevronsRight className="text-indigo-500 text-2xl" />
                    <h2 className="text-3xl font-bold text-gray-800">{subject}</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {groupedBySubject[subject].map((pyq) => (
                      <PYQCard key={pyq.id} pyq={pyq} onPreview={() => setPreviewFile(pyq)} />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 px-6 bg-white rounded-lg shadow">
              <FiFilter className="mx-auto text-7xl text-gray-400 mb-5" />
              <h3 className="text-3xl font-bold text-gray-800">No Papers Found</h3>
              <p className="text-gray-500 mt-3 text-lg">
                Try adjusting your search or clearing the filters.
              </p>
            </div>
          )}
        </main>
      </div>

      <AnimatePresence>
        {previewFile && <PreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />}
      </AnimatePresence>
    </div>
  );
};

export default PYQPage;
