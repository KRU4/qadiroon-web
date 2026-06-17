import { query } from "./db.js";

export async function logAudit(user, action, entityType = null, entityId = null, details = null) {
  await query(
    `INSERT INTO audit_log (user_id, user_name, action, entity_type, entity_id, details)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [
      user?.id ?? null,
      user?.name ?? "System",
      action,
      entityType,
      entityId,
      details ? JSON.stringify(details) : null,
    ],
  );
}

export function relativeTime(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
