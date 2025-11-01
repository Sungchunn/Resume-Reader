import React, { useCallback, useMemo, useRef, useState } from "react";

/**
 * App.js — One-page frontend for résumé upload + client chatbot
 *
 * How to use:
 * 1) Replace the two webhook URLs below with your n8n endpoints.
 *    - UPLOAD_WEBHOOK: receives multipart/form-data with fields: file, target_roles, email (optional)
 *      -> expected JSON response: {
 *           ats_score?: number,
 *           improved_markdown?: string,
 *           docx_url?: string,
 *           pdf_url?: string,
 *           gap_analysis?: object,
 *           notes_for_layout?: object
 *         }
 *    - CHAT_WEBHOOK: receives JSON { session_id, message }
 *      -> expected JSON response: { reply: string }
 * 2) Run with CRA/Vite/Next (client-side). No extra deps.
 */

// === CONFIG: plug your n8n webhooks here ===
const UPLOAD_WEBHOOK = "https://example.com/webhook/upload-resume"; // <-- REPLACE
const CHAT_WEBHOOK = "https://example.com/webhook/resume-chat"; // <-- REPLACE

// Simple utility: bytes → human size
function humanFileSize(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

const allowedMime = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document", // .docx
]);

export default function App() {
  // Upload form state
  const [file, setFile] = useState(null);
  const [targetRoles, setTargetRoles] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [result, setResult] = useState(null); // server JSON

  // Chatbot state
  const [sessionId] = useState(() => Math.random().toString(36).slice(2));
  const [chatInput, setChatInput] = useState("");
  const [chatBusy, setChatBusy] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! Ask me anything about your résumé optimization." },
  ]);
  const chatEndRef = useRef(null);

  const fileInfo = useMemo(() => {
    if (!file) return null;
    return `${file.name} • ${file.type || "unknown"} • ${humanFileSize(file.size || 0)}`;
  }, [file]);

  const onPickFile = useCallback((e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!allowedMime.has(f.type)) {
      setUploadError("Only PDF and DOCX are accepted.");
      setFile(null);
      return;
    }
    setUploadError("");
    setFile(f);
  }, []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (!f) return;
    if (!allowedMime.has(f.type)) {
      setUploadError("Only PDF and DOCX are accepted.");
      setFile(null);
      return;
    }
    setUploadError("");
    setFile(f);
  }, []);

  const prevent = (e) => e.preventDefault();

  const submitUpload = useCallback(async () => {
    setUploadError("");
    if (!file) {
      setUploadError("Please choose a PDF or DOCX file.");
      return;
    }
    if (!targetRoles.trim()) {
      setUploadError("Please enter target role(s).");
      return;
    }

    try {
      setSubmitting(true);
      const form = new FormData();
      form.append("file", file);
      form.append("target_roles", targetRoles);
      if (email.trim()) form.append("email", email.trim());

      const res = await fetch(UPLOAD_WEBHOOK, {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Upload failed: ${res.status} ${text}`);
      }

      const json = await res.json();
      setResult(json);
    } catch (err) {
      setUploadError(err.message || "Unexpected error");
    } finally {
      setSubmitting(false);
    }
  }, [email, file, targetRoles]);

  const sendChat = useCallback(async () => {
    const content = chatInput.trim();
    if (!content) return;
    setChatInput("");
    setMessages((m) => [...m, { role: "user", content }]);

    try {
      setChatBusy(true);
      const res = await fetch(CHAT_WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, message: content }),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Chat failed: ${res.status} ${text}`);
      }
      const data = await res.json();
      const reply = typeof data === "string" ? data : data.reply || "(no reply)";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: `Error: ${err.message || "unexpected error"}` },
      ]);
    } finally {
      setChatBusy(false);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: "smooth" }), 0);
    }
  }, [chatInput, sessionId]);

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Résumé Uploader & Chat</h1>
        <div style={{ color: "#6b7280", fontSize: 14 }}>Upload a PDF/DOCX, specify target roles, then chat.</div>
      </header>

      <main style={styles.mainGrid}>
        {/* Left: Upload & Results */}
        <section style={styles.card}>
          <h2 style={styles.h2}>Upload</h2>

          <div
            onDrop={onDrop}
            onDragOver={prevent}
            onDragEnter={prevent}
            onDragLeave={prevent}
            style={styles.dropzone}
            aria-label="Drop PDF/DOCX here"
          >
            <input
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={onPickFile}
              style={styles.fileInput}
              aria-label="Choose file"
            />
            <div style={{ textAlign: "center", pointerEvents: "none" }}>
              <div style={{ fontWeight: 600 }}>Drop your PDF/DOCX here or click to browse</div>
              <div style={{ color: "#6b7280", fontSize: 12 }}>Max ~15MB recommended</div>
              {fileInfo && (
                <div style={{ marginTop: 8, color: "#111827" }}>{fileInfo}</div>
              )}
            </div>
          </div>

          <label style={styles.label}>Target role(s)</label>
          <input
            value={targetRoles}
            onChange={(e) => setTargetRoles(e.target.value)}
            placeholder="e.g., Sales Automation Specialist; RevOps; Growth Engineer"
            style={styles.input}
          />

          <label style={styles.label}>Email (optional)</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={styles.input}
          />

          {uploadError && (
            <div role="alert" style={styles.error}>
              {uploadError}
            </div>
          )}

          <button
            onClick={submitUpload}
            disabled={submitting}
            style={{
              ...styles.button,
              opacity: submitting ? 0.7 : 1,
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "Processing…" : "Analyze & Improve"}
          </button>

          {result && (
            <div style={{ marginTop: 20 }}>
              <h3 style={styles.h3}>Result</h3>
              {typeof result.ats_score !== "undefined" && (
                <div style={styles.kv}><strong>ATS Score:</strong> {result.ats_score}</div>
              )}

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                {result.pdf_url && (
                  <a href={result.pdf_url} target="_blank" rel="noreferrer" style={styles.linkBtn}>Download PDF</a>
                )}
                {result.docx_url && (
                  <a href={result.docx_url} target="_blank" rel="noreferrer" style={styles.linkBtn}>Download DOCX</a>
                )}
              </div>

              {result.gap_analysis && (
                <details style={styles.details}>
                  <summary style={styles.summary}>Gap Analysis</summary>
                  <pre style={styles.pre}>{JSON.stringify(result.gap_analysis, null, 2)}</pre>
                </details>
              )}

              {result.improved_markdown && (
                <details style={styles.details} open>
                  <summary style={styles.summary}>Improved Markdown</summary>
                  <pre style={styles.pre}>{result.improved_markdown}</pre>
                </details>
              )}
            </div>
          )}
        </section>

        {/* Right: Chatbot */}
        <section style={styles.card}>
          <h2 style={styles.h2}>Chatbot</h2>

          <div style={styles.chatBox}>
            {messages.map((m, i) => (
              <div key={i} style={{
                ...styles.chatMsg,
                alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                background: m.role === "user" ? "#eef2ff" : "#f3f4f6",
              }}>
                <div style={{ fontSize: 12, color: "#6b7280" }}>{m.role}</div>
                <div>{m.content}</div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <div style={styles.chatControls}>
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Type your question…"
              style={{ ...styles.input, margin: 0, flex: 1 }}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (!chatBusy) sendChat();
                }
              }}
            />
            <button
              onClick={sendChat}
              disabled={chatBusy || !chatInput.trim()}
              style={{ ...styles.button, marginLeft: 8, opacity: chatBusy ? 0.7 : 1 }}
            >
              {chatBusy ? "Sending…" : "Send"}
            </button>
          </div>

          <div style={{ color: "#6b7280", fontSize: 12, marginTop: 8 }}>
            Tip: keep the same tab to preserve session. Session ID: {sessionId}
          </div>
        </section>
      </main>

      <footer style={styles.footer}>
        <div style={{ color: "#6b7280", fontSize: 12 }}>
          Frontend only. Wire to your n8n webhooks to go live.
        </div>
      </footer>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f9fafb",
    color: "#111827",
    display: "flex",
    flexDirection: "column",
  },
  header: {
    padding: "20px 24px",
    borderBottom: "1px solid #e5e7eb",
    background: "white",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 16,
    padding: 16,
  },
  card: {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 16,
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
    display: "flex",
    flexDirection: "column",
  },
  h2: { margin: 0, marginBottom: 12, fontSize: 18 },
  h3: { margin: 0, marginBottom: 8, fontSize: 16 },
  dropzone: {
    position: "relative",
    border: "2px dashed #c7d2fe",
    borderRadius: 12,
    padding: 18,
    background: "#eef2ff",
    marginBottom: 12,
    cursor: "pointer",
  },
  fileInput: {
    position: "absolute",
    inset: 0,
    opacity: 0,
    width: "100%",
    height: "100%",
    cursor: "pointer",
  },
  label: { fontSize: 13, color: "#374151", marginTop: 8, marginBottom: 4 },
  input: {
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: "10px 12px",
    outline: "none",
    fontSize: 14,
    background: "white",
    marginBottom: 10,
  },
  button: {
    background: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: 10,
    padding: "10px 14px",
    fontWeight: 600,
  },
  error: {
    background: "#fef2f2",
    color: "#991b1b",
    border: "1px solid #fecaca",
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  kv: { fontSize: 14, margin: "6px 0" },
  details: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    marginTop: 12,
  },
  summary: { padding: 10, cursor: "pointer", fontWeight: 600 },
  pre: {
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    margin: 0,
    padding: 12,
    fontSize: 12,
    borderTop: "1px solid #e5e7eb",
    background: "#fff",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    maxHeight: 320,
    overflow: "auto",
  },
  chatBox: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 12,
    height: 360,
    overflow: "auto",
    background: "#ffffff",
  },
  chatMsg: {
    maxWidth: "80%",
    padding: 10,
    borderRadius: 10,
    border: "1px solid #e5e7eb",
  },
  chatControls: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  linkBtn: {
    display: "inline-block",
    background: "#111827",
    color: "white",
    padding: "8px 10px",
    borderRadius: 8,
    textDecoration: "none",
    fontSize: 13,
  },
  footer: {
    marginTop: "auto",
    padding: 16,
    borderTop: "1px solid #e5e7eb",
    background: "white",
  },
};
