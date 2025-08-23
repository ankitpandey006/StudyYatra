// utils/fileValidator.js
exports.acceptedMimeTypes = ['application/pdf'];

exports.isValidFile = (file) =>
  file && exports.acceptedMimeTypes.includes(file.mimetype) && file.size <= 25 * 1024 * 1024; // 25MB
