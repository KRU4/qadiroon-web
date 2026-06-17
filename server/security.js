import { query } from "./db.js";

const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;
const LOCK_MINUTES = 15;

export function getClientIp(req) {
  return req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown";
}

export async function isLockedOut(email, ip) {
  const now = new Date().toISOString();
  const lock = (await query(
    `SELECT locked_until FROM login_lockouts
     WHERE (email = $1 OR ip = $2) AND locked_until > $3
     ORDER BY locked_until DESC LIMIT 1`,
    [email, ip, now],
  )).rows[0];
  if (!lock) return null;
  const mins = Math.ceil((new Date(lock.locked_until).getTime() - Date.now()) / 60000);
  return mins;
}

export async function recordLoginAttempt(email, ip, success) {
  await query(
    "INSERT INTO login_attempts (email, ip, success) VALUES ($1, $2, $3)",
    [email, ip, success ? 1 : 0],
  );

  if (success) {
    await query("DELETE FROM login_lockouts WHERE email = $1 OR ip = $2", [email, ip]);
    return;
  }

  const since = new Date(Date.now() - WINDOW_MINUTES * 60000).toISOString();
  const failures = (await query(
    `SELECT COUNT(*) as c FROM login_attempts
     WHERE (email = $1 OR ip = $2) AND success = 0 AND created_at > $3`,
    [email, ip, since],
  )).rows[0].c;

  if (parseInt(failures) >= MAX_ATTEMPTS) {
    const lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60000).toISOString();
    await query(
      "INSERT INTO login_lockouts (email, ip, locked_until) VALUES ($1, $2, $3)",
      [email, ip, lockedUntil],
    );
  }
}

export function securityHeaders(_req, res, next) {
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data: https:;",
  );
  next();
}
