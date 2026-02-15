import React from "react";
import { Eye, Download, Tag } from "lucide-react";

/**
 * Keep Cloudinary resource type unchanged (prevents 404).
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
 * VIEW → open in new tab
 */
const getViewUrl = (url = "") => normalizeCloudinaryUrl(url);

/**
 * DOWNLOAD → force download with fl_attachment:true
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
    <div className="bg-white/90 backdrop-blur border border-slate-200 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col h-full">
      {/* Content */}
      <div className="p-5 sm:p-6">
        {subject && (
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full">
            <Tag className="h-3.5 w-3.5" />
            <span className="truncate">{subject}</span>
          </div>
        )}

        <h3 className="mt-3 text-base sm:text-lg font-semibold text-slate-900 leading-snug">
          {title}
        </h3>

        {description && (
          <p className="mt-2 text-sm text-slate-600 leading-relaxed line-clamp-3">
            {description}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="mt-auto p-5 sm:p-6 pt-0">
        <div className="grid grid-cols-2 gap-3">
          <a
            href={viewUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 transition"
          >
            <Eye size={16} />
            View
          </a>

          <a
            href={downloadUrl}
            className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-md transition"
          >
            <Download size={16} />
            Download
          </a>
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;