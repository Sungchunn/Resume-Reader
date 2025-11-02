import React, { useCallback, useMemo, useState } from "react";

const UPLOAD_WEBHOOK =
  "https://shreyahubcredo.app.n8n.cloud/webhook-test/2227bd6f-2f86-470d-a2d0-d8ff386eb788";

const allowedMime = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

function humanFileSize(bytes) {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

export default function App() {
  const [file, setFile] = useState(null);
  const [targetRoles, setTargetRoles] = useState("");
  const [email, setEmail] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const fileInfo = useMemo(() => {
    if (!file) return null;
    return `${file.name} • ${file.type || "unknown"} • ${humanFileSize(file.size || 0)}`;
  }, [file]);

  const handleFile = useCallback((f) => {
    if (!f) return;
    if (!allowedMime.has(f.type)) {
      setUploadError("Only PDF and DOCX files are accepted.");
      setFile(null);
      return;
    }
    setUploadError("");
    setFile(f);
  }, []);

  const onPickFile = (e) => handleFile(e.target.files?.[0]);
  const onDrop = (e) => {
    e.preventDefault();
    handleFile(e.dataTransfer.files?.[0]);
  };
  const prevent = (e) => e.preventDefault();

  const submitUpload = useCallback(async () => {
    setUploadError("");
    if (!file) return setUploadError("Please select a PDF or DOCX file.");
    if (!targetRoles.trim()) return setUploadError("Please enter target role(s).");

    try {
      setSubmitting(true);
      const form = new FormData();
      form.append("file", file, file.name);
      form.append("target_roles", targetRoles.trim());
      if (email.trim()) form.append("email", email.trim());

      // For debugging: log what's being sent
      for (let [key, val] of form.entries()) {
        console.log("FormData:", key, val);
      }

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
      setUploadError(err.message || "Unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  }, [file, targetRoles, email]);

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Résumé Analyzer</h1>
        <div style={{ color: "#6b7280", fontSize: 14 }}>
          Upload résumé (PDF/DOCX) + specify target roles.
        </div>
      </header>

      <main style={styles.main}>
        <section style={styles.card}>
          <h2 style={styles.h2}>Upload</h2>

          <div
            onDrop={onDrop}
            onDragOver={prevent}
            onDragEnter={prevent}
            style={styles.dropzone}
          >
            <input
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={onPickFile}
              style={styles.fileInput}
            />
            <div style={{ textAlign: "center", pointerEvents: "none" }}>
              <div style={{ fontWeight: 600 }}>Drop PDF/DOCX here or click to browse</div>
              <div style={{ color: "#6b7280", fontSize: 12 }}>Max 15MB</div>
              {fileInfo && <div style={{ marginTop: 8 }}>{fileInfo}</div>}
            </div>
          </div>

          <label style={styles.label}>Target role(s)</label>
          <input
            value={targetRoles}
            onChange={(e) => setTargetRoles(e.target.value)}
            placeholder="e.g., Sales Automation Specialist; RevOps Engineer"
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

          {uploadError && <div style={styles.error}>{uploadError}</div>}

          <button
            onClick={submitUpload}
            disabled={submitting}
            style={{
              ...styles.button,
              opacity: submitting ? 0.7 : 1,
              cursor: submitting ? "not-allowed" : "pointer",
            }}
          >
            {submitting ? "Processing…" : "Analyze Résumé"}
          </button>

          {result && (
            <div style={{ marginTop: 20 }}>
              <h3 style={styles.h3}>Results</h3>
              {result.ats_score && (
                <div style={styles.kv}>
                  <strong>ATS Score:</strong> {result.ats_score}
                </div>
              )}

              <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                {result.pdf_url && (
                  <a href={result.pdf_url} target="_blank" rel="noreferrer" style={styles.linkBtn}>
                    Download PDF
                  </a>
                )}
                {result.docx_url && (
                  <a href={result.docx_url} target="_blank" rel="noreferrer" style={styles.linkBtn}>
                    Download DOCX
                  </a>
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
      </main>
    </div>
  );
}

const styles = {
  page: { fontFamily: "sans-serif", background: "#f9fafb", minHeight: "100vh", color: "#111827" },
  header: {
    padding: "20px 24px",
    borderBottom: "1px solid #e5e7eb",
    background: "white",
  },
  main: { display: "flex", justifyContent: "center", padding: 16 },
  card: {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 20,
    maxWidth: 600,
    width: "100%",
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },
  h2: { marginBottom: 12 },
  h3: { marginTop: 20, marginBottom: 8 },
  dropzone: {
    position: "relative",
    border: "2px dashed #c7d2fe",
    borderRadius: 12,
    padding: 20,
    background: "#eef2ff",
    marginBottom: 12,
    cursor: "pointer",
  },
  fileInput: { position: "absolute", inset: 0, opacity: 0, width: "100%", height: "100%" },
  label: { display: "block", fontSize: 13, marginTop: 8, marginBottom: 4 },
  input: {
    width: "100%",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: "10px 12px",
    outline: "none",
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
  linkBtn: {
    display: "inline-block",
    background: "#111827",
    color: "white",
    padding: "8px 10px",
    borderRadius: 8,
    textDecoration: "none",
    fontSize: 13,
  },
};
