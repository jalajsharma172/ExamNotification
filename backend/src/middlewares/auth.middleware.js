import env from '../config/env.js';

/**
 * Basic authentication middleware to protect sensitive endpoints.
 * Checks for a Bearer token matching the CRON_SECRET env variable.
 * If CRON_SECRET is not configured, it issues a warning and allows the request.
 */
export function checkCronAuth(req, res, next) {
  const secret = env.cronSecret;
  if (!secret) {
    console.warn('⚠️ CRON_SECRET is not configured. Accessing protected endpoint without authorization.');
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: 'Unauthorized: Missing or invalid authorization scheme. Expecting Bearer token.',
      code: 'UNAUTHORIZED'
    });
  }

  const token = authHeader.split(' ')[1];
  if (token !== secret) {
    return res.status(403).json({
      success: false,
      error: 'Forbidden: Invalid cron secret token.',
      code: 'FORBIDDEN'
    });
  }

  return next();
}
