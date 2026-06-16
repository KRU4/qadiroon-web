import { useState, useEffect, useRef, useCallback } from "react";
import {
  IconRefresh,
  IconPlayerPlay,
  IconPlayerPause,
  IconArrowBarDown,
  IconTerminal2,
  IconChevronRight,
  IconFileText,
  IconAlertTriangle,
  IconClock,
  IconExclamationCircle,
} from "@tabler/icons-react";

const API_BASE = "/api";

function formatBytes(bytes) {
  if (!bytes) return "0 B";
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

function dedupeLogs(logs) {
  const seen = new Set();
  return logs.filter((entry) => {
    // Dedupe by line content + type (same line appearing twice = duplicate)
    const key = entry.type + "|" + entry.line;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export default function AdminPm2Logs() {
  const [logs, setLogs] = useState([]);
  const [fileInfo, setFileInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [autoScroll, setAutoScroll] = useState(true);
  const [filter, setFilter] = useState("all");
  const [live, setLive] = useState(true);
  const logEndRef = useRef(null);
  const offsetsRef = useRef({ out: 0, error: 0 });
  const pollRef = useRef(null);
  const initialLoadDone = useRef(false);
  const abortRef = useRef(null);

  // Initial full load
  const fetchLogs = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/admin/pm2/logs?lines=500`, {
        credentials: "include",
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (controller.signal.aborted) return;

      // Dedupe the initial batch too
      const deduped = dedupeLogs(data.logs);
      setLogs(deduped);
      setFileInfo(data.files);
      if (data.offsets) {
        offsetsRef.current = { ...data.offsets };
      }
      initialLoadDone.current = true;
    } catch (e) {
      if (e.name === "AbortError") return;
      console.error("PM2 logs error:", e);
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  // Incremental poll — only fetches lines written after last known offset
  const pollNewLogs = useCallback(async () => {
    if (!initialLoadDone.current) return;
    try {
      const params = new URLSearchParams();
      params.set("sinceOut", offsetsRef.current.out);
      params.set("sinceErr", offsetsRef.current.error);
      const res = await fetch(`${API_BASE}/admin/pm2/logs/since?${params}`, {
        credentials: "include",
      });
      if (!res.ok) return;
      const data = await res.json();

      if (data.offsets) {
        offsetsRef.current = { ...data.offsets };
      }

      if (data.logs && data.logs.length > 0) {
        setLogs((prev) => {
          // Dedupe the combined array: old + new
          const combined = [...prev, ...data.logs];
          // Keep only last 1000 lines to prevent memory bloat
          const trimmed = combined.slice(-1000);
          return dedupeLogs(trimmed);
        });
      }
    } catch {
      // Silently ignore poll errors
    }
  }, []);

  // Mount: initial load
  useEffect(() => {
    fetchLogs();
    return () => {
      if (abortRef.current) abortRef.current.abort();
    };
  }, [fetchLogs]);

  // Live polling: incremental only
  useEffect(() => {
    if (live) {
      pollRef.current = setInterval(pollNewLogs, 3000);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [live, pollNewLogs]);

  // Auto-scroll
  useEffect(() => {
    if (autoScroll && logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs.filter((l) => {
    if (filter === "all") return true;
    return l.type === filter;
  });

  const errorCount = logs.filter((l) => l.type === "error").length;

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <IconTerminal2 size={26} stroke={1.5} style={{ color: "#4f46e5" }} />
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: "#111827" }}>
            Process Logs
          </h1>
          <p style={{ margin: "2px 0 0", fontSize: 13, color: "#6b7280" }}>
            Qadroon News — stdout & stderr
          </p>
        </div>
      </div>

      {/* Controls bar */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 16,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => {
            initialLoadDone.current = false;
            fetchLogs();
          }}
          style={{
            padding: "6px 16px",
            background: "#3b82f6",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
          }}
        >
          <IconRefresh size={15} stroke={1.5} />
          Refresh Logs
        </button>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            cursor: "pointer",
            fontSize: 13,
            color: "#374151",
          }}
        >
          <input
            type="checkbox"
            checked={live}
            onChange={(e) => setLive(e.target.checked)}
          />
          {live ? (
            <IconPlayerPlay size={14} stroke={1.5} style={{ color: "#22c55e" }} />
          ) : (
            <IconPlayerPause size={14} stroke={1.5} style={{ color: "#9ca3af" }} />
          )}
          Live tail (3s)
        </label>

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            cursor: "pointer",
            fontSize: 13,
            color: "#374151",
          }}
        >
          <input
            type="checkbox"
            checked={autoScroll}
            onChange={(e) => setAutoScroll(e.target.checked)}
          />
          <IconArrowBarDown size={14} stroke={1.5} style={{ color: "#6366f1" }} />
          Auto-scroll
        </label>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: "6px 12px",
            borderRadius: 6,
            border: "1px solid #d1d5db",
            fontSize: 13,
            color: "#374151",
          }}
        >
          <option value="all">All entries</option>
          <option value="out">stdout</option>
          <option value="error">stderr</option>
        </select>

        {fileInfo && (
          <span style={{ fontSize: 12, color: "#6b7280", display: "flex", alignItems: "center", gap: 4 }}>
            <IconFileText size={13} stroke={1.5} />
            stdout: {formatBytes(fileInfo.out?.size)}
            {" | "}
            stderr: {formatBytes(fileInfo.error?.size)}
          </span>
        )}

        <span style={{ fontSize: 12, color: "#6b7280", marginLeft: "auto" }}>
          {filteredLogs.length} lines
          {errorCount > 0 && (
            <span style={{ color: "#ef4444", marginLeft: 8 }}>
              <IconAlertTriangle size={13} stroke={1.5} style={{ display: "inline", verticalAlign: -2 }} />
              {" "}{errorCount} errors
            </span>
          )}
        </span>
      </div>

      {/* Log viewer */}
      <div
        style={{
          background: "#1e1e2e",
          color: "#cdd6f4",
          borderRadius: 8,
          padding: 16,
          height: "calc(100vh - 220px)",
          overflow: "auto",
          fontFamily: "'Cascadia Code', 'Fira Code', 'JetBrains Mono', monospace",
          fontSize: 13,
          lineHeight: 1.7,
        }}
      >
        {loading ? (
          <p style={{ color: "#6c7086" }}>
            <IconClock size={14} stroke={1.5} style={{ display: "inline", verticalAlign: -2, marginRight: 6 }} />
            Loading logs...
          </p>
        ) : filteredLogs.length === 0 ? (
          <p style={{ color: "#6c7086" }}>
            <IconFileText size={14} stroke={1.5} style={{ display: "inline", verticalAlign: -2, marginRight: 6 }} />
            No logs yet. The process may not have produced output.
          </p>
        ) : (
          filteredLogs.map((entry, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 8,
                color: entry.type === "error" ? "#f38ba8" : "#a6e3a1",
                whiteSpace: "pre-wrap",
                wordBreak: "break-all",
              }}
            >
              <span style={{ flexShrink: 0, opacity: 0.6, fontSize: 11, marginTop: 2 }}>
                {entry.type === "error" ? (
                  <IconExclamationCircle size={13} stroke={1.5} />
                ) : (
                  <IconChevronRight size={13} stroke={1.5} />
                )}
              </span>
              <span>{entry.line}</span>
            </div>
          ))
        )}
        <div ref={logEndRef} />
      </div>
    </div>
  );
}
