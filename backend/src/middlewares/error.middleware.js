/**
 * Global centralized error handling middleware.
 */
export default function errorMiddleware(err, req, res, next) {
  console.error('💥 Server Error:', err);
  const status = err.status || 500;
  return res.status(status).json({
    success: false,
    error: err.message || 'Internal Server Error',
    code: err.code || 'INTERNAL_SERVER_ERROR'
  });
}
