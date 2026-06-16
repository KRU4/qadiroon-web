import { db } from "./db.js";

const MAX_ATTEMPTS = 5;
const WINDOW_MINUTES = 15;
const LOCK_MINUTES = 15;

export function getClientIp(req) {
  return req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.socket?.remoteAddress || "unknown";
}

export function isLockedOut(email, ip) {
  const now = new Date().toISOString();
  const lock = db
    .prepare(
      `SELECT locked_until FROM login_lockouts
       WHERE (email = ? OR ip = ?) AND locked_until > ?
       ORDER BY locked_until DESC LIMIT 1`,
    )
    .get(email, ip, now);
  if (!lock) return null;
  const mins = Math.ceil((new Date(lock.locked_until).getTime() - Date.now()) / 60000);
  return mins;
}

export function recordLoginAttempt(email, ip, success) {
  db.prepare(
    "INSERT INTO login_attempts (email, ip, success) VALUES (?, ?, ?)",
  ).run(email, ip, success ? 1 : 0);

  if (success) {
    db.prepare("DELETE FROM login_lockouts WHERE email = ? OR ip = ?").run(email, ip);
    return;
  }

  const since = new Date(Date.now() - WINDOW_MINUTES * 60000).toISOString();
  const failures = db
    .prepare(
      `SELECT COUNT(*) as c FROM login_attempts
       WHERE (email = ? OR ip = ?) AND success = 0 AND created_at > ?`,
    )
    .get(email, ip, since).c;

  if (failures >= MAX_ATTEMPTS) {
    const lockedUntil = new Date(Date.now() + LOCK_MINUTES * 60000).toISOString();
    db.prepare("INSERT INTO login_lockouts (email, ip, locked_until) VALUES (?, ?, ?)").run(
      email,
      ip,
      lockedUntil,
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
