import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const logsDir = path.join(__dirname, "..", "..", "logs");
const pm2OutLog = path.join(logsDir, "pm2-out.log");
const pm2ErrLog = path.join(logsDir, "pm2-error.log");

/**
 * Read the last `maxLines` lines from a file, deduplicated by content hash.
 * Returns { lines, size } where size is the file's byte size.
 */
function tailFile(filePath, maxLines = 500) {
  try {
    if (!fs.existsSync(filePath)) return { lines: [], size: 0 };
    const stat = fs.statSync(filePath);
    if (stat.size === 0) return { lines: [], size: 0 };

    // Read from the end — grab last ~64KB or the whole file, whichever is smaller
    const readSize = Math.min(stat.size, 65536);
    const fd = fs.openSync(filePath, "r");
    const buf = Buffer.alloc(readSize);
    fs.readSync(fd, buf, 0, readSize, stat.size - readSize);
    fs.closeSync(fd);

    const content = buf.toString("utf8");
    // Strip partial first line (we started mid-file)
    const firstNewline = content.indexOf("\n");
    const clean = firstNewline >= 0 ? content.slice(firstNewline + 1) : content;
    const lines = clean.split("\n").filter(Boolean).slice(-maxLines);

    return { lines, size: stat.size };
  } catch {
    return { lines: [], size: 0 };
  }
}

/**
 * Read new content from a file since a given byte offset.
 */
function readSince(filePath, since) {
  try {
    if (!fs.existsSync(filePath)) return { lines: [], size: 0 };
    const stat = fs.statSync(filePath);
    if (stat.size <= since) return { lines: [], size: stat.size };

    const len = stat.size - since;
    const fd = fs.openSync(filePath, "r");
    const buf = Buffer.alloc(len);
    fs.readSync(fd, buf, 0, len, since);
    fs.closeSync(fd);

    const lines = buf.toString("utf8").split("\n").filter(Boolean);
    return { lines, size: stat.size };
  } catch {
    return { lines: [], size: 0 };
  }
}

export function registerPm2Routes(app, { requireAuth }) {
  // ── Initial load: return last N lines + current file sizes as offsets ──
  app.get("/api/admin/pm2/logs", requireAuth, (_req, res) => {
    const maxLines = parseInt(_req.query.lines) || 500;
    const out = tailFile(pm2OutLog, maxLines);
    const err = tailFile(pm2ErrLog, maxLines);

    const logs = [
      ...out.lines.map((l) => ({ type: "out", line: l })),
      ...err.lines.map((l) => ({ type: "error", line: l })),
    ].sort((a, b) => {
      const ta = a.line.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/);
      const tb = b.line.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/);
      if (ta && tb) return ta[0].localeCompare(tb[0]);
      return 0;
    });

    res.json({
      logs,
      offsets: { out: out.size, error: err.size },
      files: {
        out: { size: out.size },
        error: { size: err.size },
      },
    });
  });

  // ── Incremental poll: only lines written since given offsets ──
  app.get("/api/admin/pm2/logs/since", requireAuth, (req, res) => {
    const sinceOut = parseInt(req.query.sinceOut) || 0;
    const sinceErr = parseInt(req.query.sinceErr) || 0;

    const out = readSince(pm2OutLog, sinceOut);
    const err = readSince(pm2ErrLog, sinceErr);

    const logs = [
      ...out.lines.map((l) => ({ type: "out", line: l })),
      ...err.lines.map((l) => ({ type: "error", line: l })),
    ].sort((a, b) => {
      const ta = a.line.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/);
      const tb = b.line.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/);
      if (ta && tb) return ta[0].localeCompare(tb[0]);
      return 0;
    });

    res.json({
      logs,
      offsets: { out: out.size, error: err.size },
    });
  });
}
