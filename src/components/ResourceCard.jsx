import React from "react";
import { Eye, Download } from "lucide-react";

/**
 * Detect actual Cloudinary resource type from URL
 * and keep it unchanged (prevents 404).
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

/**
 * VIEW → Open in browser (no forced attachment)
 */
const getViewUrl = (url = "") => {
  return normalizeCloudinaryUrl(url);
};

/**
 * DOWNLOAD → Force download using fl_attachment:true
 */
const getDownloadUrl = (url = "") => {
  let u = normalizeCloudinaryUrl(url);

  if (u.includes("/upload/") && !u.includes("fl_attachment:true")) {
    u = u.replace("/upload/", "/upload/fl_attachment:true/");
  }

  return u;
};

const ResourceCard = ({
  title,
  description,
  viewLink,
  downloadLink,
  subject,
}) => {
  const viewUrl = getViewUrl(viewLink);
  const downloadUrl = getDownloadUrl(downloadLink);

  return (
    <div className="bg-white p-5 rounded-xl shadow-sm border hover:shadow-md transition duration-200 flex flex-col justify-between h-full">
      <div>
        {subject && (
          <div className="text-sm text-indigo-600 font-medium mb-1">
            📘 {subject}
          </div>
        )}

        <h3 className="text-lg font-semibold text-gray-800 mb-2">
          {title}
        </h3>

        {description && (
          <p className="text-gray-600 text-sm mb-4">
            {description}
          </p>
        )}
      </div>

      <div className="flex justify-between items-center mt-auto gap-3">
        {/* VIEW BUTTON */}
        <a
          href={viewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-indigo-700 text-white rounded hover:bg-indigo-600 transition"
        >
          <Eye size={16} /> View
        </a>

        {/* DOWNLOAD BUTTON */}
        <a
          href={downloadUrl}
          className="flex items-center gap-1 px-3 py-1.5 text-sm bg-green-500 text-white rounded hover:bg-green-600 transition"
        >
          <Download size={16} /> Download
        </a>
      </div>
    </div>
  );
};

export default ResourceCard;
