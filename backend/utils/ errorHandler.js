// utils/errorHandler.js
exports.asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

exports.notFound = (req, res) => res.status(404).json({ message: 'Route not found' });

exports.errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({ message: err.message || 'Server Error' });
};
