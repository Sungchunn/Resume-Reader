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
  const [jobTitle, setJobTitle] = useState("");
  const [companyUrl, setCompanyUrl] = useState("");
  const [jobDescription, setJobDescription] = useState("");
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
    setResult(null);
    if (!file) return setUploadError("Please select a PDF or DOCX file.");
    if (!jobTitle.trim()) return setUploadError("Please enter the job title.");
    if (!jobDescription.trim()) return setUploadError("Please enter the job description.");

    try {
      setSubmitting(true);
      const form = new FormData();
      form.append("file", file, file.name);
      form.append("job_title", jobTitle.trim());
      form.append("job_description", jobDescription.trim());
      if (companyUrl.trim()) {
        form.append("company_url", companyUrl.trim());
      }

      console.log("Sending to webhook:", UPLOAD_WEBHOOK);
      for (let [key, val] of form.entries()) {
        if (key === 'file') {
          console.log(`FormData: ${key} =`, val.name, val.type, val.size);
        } else {
          console.log(`FormData: ${key} =`, val);
        }
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
      console.log("Webhook response:", json);
      setResult(json);
    } catch (err) {
      console.error("Upload error:", err);
      setUploadError(err.message || "Unexpected error occurred.");
    } finally {
      setSubmitting(false);
    }
  }, [file, jobTitle, companyUrl, jobDescription]);

  // Recursively render values in a beautiful, parsed format
  const renderValue = (value, depth = 0) => {
    // Null or undefined
    if (value === null || value === undefined) {
      return <span style={styles.nullValue}>—</span>;
    }

    // Boolean
    if (typeof value === 'boolean') {
      return (
        <span style={{ ...styles.booleanValue, color: value ? '#10b981' : '#ef4444' }}>
          {value ? '✓ Yes' : '✗ No'}
        </span>
      );
    }

    // Number
    if (typeof value === 'number') {
      return <span style={styles.numberValue}>{value.toLocaleString()}</span>;
    }

    // String
    if (typeof value === 'string') {
      // Check if it's a URL
      if (value.match(/^https?:\/\//)) {
        return (
          <a href={value} target="_blank" rel="noreferrer" style={styles.linkValue}>
            🔗 {value}
          </a>
        );
      }

      // Long text - make it collapsible
      if (value.length > 300) {
        return (
          <details style={styles.textExpandable}>
            <summary style={styles.textExpandableSummary}>
              {value.substring(0, 150)}... <span style={{ color: '#4f46e5' }}>(click to read more)</span>
            </summary>
            <div style={styles.textExpandableContent}>
              {value}
            </div>
          </details>
        );
      }

      // Regular text
      return <span style={styles.textValue}>{value}</span>;
    }

    // Array
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span style={styles.emptyValue}>Empty list</span>;
      }

      return (
        <div style={{ ...styles.arrayContainer, marginLeft: depth > 0 ? 16 : 0 }}>
          {value.map((item, idx) => (
            <div key={idx} style={styles.arrayItem}>
              <span style={styles.arrayBullet}>•</span>
              <div style={styles.arrayItemContent}>
                {renderValue(item, depth + 1)}
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Object
    if (typeof value === 'object') {
      const entries = Object.entries(value);
      if (entries.length === 0) {
        return <span style={styles.emptyValue}>Empty object</span>;
      }

      return (
        <div style={{ ...styles.objectContainer, marginLeft: depth > 0 ? 16 : 0 }}>
          {entries.map(([key, val]) => (
            <div key={key} style={styles.objectRow}>
              <div style={styles.objectKey}>{key}:</div>
              <div style={styles.objectValue}>
                {renderValue(val, depth + 1)}
              </div>
            </div>
          ))}
        </div>
      );
    }

    // Fallback
    return <span style={styles.textValue}>{String(value)}</span>;
  };

  // Special rendering for specific field types
  const renderFieldValue = (key, value) => {
    // ATS Score gets special treatment
    if (key === 'ats_score' && typeof value === 'number') {
      const scoreColor = value >= 80 ? '#10b981' : value >= 60 ? '#f59e0b' : '#ef4444';
      const scoreBg = value >= 80 ? '#d1fae5' : value >= 60 ? '#fef3c7' : '#fee2e2';

      return (
        <div style={styles.scoreContainer}>
          <div style={{ ...styles.scoreCircle, background: scoreBg, borderColor: scoreColor }}>
            <div style={{ ...styles.scoreNumber, color: scoreColor }}>{value}</div>
            <div style={styles.scoreLabel}>out of 100</div>
          </div>
          <div style={{ marginTop: 12 }}>
            {value >= 80 && (
              <div style={{ ...styles.scoreBadge, background: '#d1fae5', color: '#10b981' }}>
                ✓ Excellent Score
              </div>
            )}
            {value >= 60 && value < 80 && (
              <div style={{ ...styles.scoreBadge, background: '#fef3c7', color: '#f59e0b' }}>
                ⚠ Good Score
              </div>
            )}
            {value < 60 && (
              <div style={{ ...styles.scoreBadge, background: '#fee2e2', color: '#ef4444' }}>
                ✗ Needs Improvement
              </div>
            )}
          </div>
        </div>
      );
    }

    // Default to generic value renderer
    return renderValue(value);
  };

  const formatFieldName = (key) => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={{ margin: 0, fontSize: 22 }}>Résumé Analyzer</h1>
        <div style={{ color: "#6b7280", fontSize: 14 }}>
          Upload your resume and enter the job details you're applying for.
        </div>
      </header>

      <main style={styles.main}>
        <section style={styles.card}>
          <h2 style={styles.h2}>Job Application Details</h2>

          <label style={styles.label}>Job Title *</label>
          <input
            value={jobTitle}
            onChange={(e) => setJobTitle(e.target.value)}
            placeholder="e.g., Senior Software Engineer"
            style={styles.input}
            disabled={submitting}
          />

          <label style={styles.label}>Company Website URL</label>
          <input
            value={companyUrl}
            onChange={(e) => setCompanyUrl(e.target.value)}
            placeholder="e.g., https://www.company.com"
            style={styles.input}
            type="url"
            disabled={submitting}
          />

          <label style={styles.label}>Job Description *</label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here..."
            style={styles.textarea}
            rows={8}
            disabled={submitting}
          />

          <label style={styles.label}>Your Resume (PDF/DOCX) *</label>
          <div
            onDrop={onDrop}
            onDragOver={prevent}
            onDragEnter={prevent}
            style={{
              ...styles.dropzone,
              opacity: submitting ? 0.6 : 1,
              pointerEvents: submitting ? 'none' : 'auto'
            }}
          >
            <input
              type="file"
              accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={onPickFile}
              style={styles.fileInput}
              disabled={submitting}
            />
            <div style={{ textAlign: "center", pointerEvents: "none" }}>
              <div style={{ fontWeight: 600 }}>Drop PDF/DOCX here or click to browse</div>
              <div style={{ color: "#6b7280", fontSize: 12 }}>Max 15MB</div>
              {fileInfo && <div style={{ marginTop: 8 }}>{fileInfo}</div>}
            </div>
          </div>

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

          {submitting && (
            <div style={styles.loadingBox}>
              <div style={styles.spinner}></div>
              <div style={{ marginTop: 12 }}>
                <strong>Analyzing your resume...</strong>
                <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
                  This may take 20-30 seconds. Please wait.
                </div>
              </div>
            </div>
          )}

          {result && (
            <div style={{ marginTop: 24 }}>
              <div style={styles.successBanner}>
                <span style={{ fontSize: 24 }}>✓</span>
                <div style={{ marginLeft: 12 }}>
                  <strong>Analysis Complete!</strong>
                  <div style={{ fontSize: 13, marginTop: 2 }}>
                    Your resume has been successfully analyzed and improved.
                  </div>
                </div>
              </div>

              <h3 style={styles.sectionTitle}>📊 Analysis Results</h3>

              <div style={styles.resultsGrid}>
                {Object.entries(result).map(([key, value]) => (
                  <div key={key} style={styles.resultCard}>
                    <div style={styles.resultCardHeader}>
                      {formatFieldName(key)}
                    </div>
                    <div style={styles.resultCardBody}>
                      {renderFieldValue(key, value)}
                    </div>
                  </div>
                ))}
              </div>

              <details style={styles.rawDataSection}>
                <summary style={styles.rawDataSummary}>
                  🔍 View Raw JSON Response
                </summary>
                <pre style={styles.rawDataPre}>
                  {JSON.stringify(result, null, 2)}
                </pre>
              </details>
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
    padding: 24,
    maxWidth: 900,
    width: "100%",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  h2: { marginBottom: 16, fontSize: 20, fontWeight: 600 },
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
  label: { display: "block", fontSize: 13, fontWeight: 600, marginTop: 12, marginBottom: 4, color: "#374151" },
  input: {
    width: "100%",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: "10px 12px",
    outline: "none",
    marginBottom: 10,
    fontSize: 14,
  },
  textarea: {
    width: "100%",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: "10px 12px",
    outline: "none",
    marginBottom: 10,
    fontSize: 14,
    fontFamily: "sans-serif",
    resize: "vertical",
  },
  button: {
    background: "#4f46e5",
    color: "white",
    border: "none",
    borderRadius: 10,
    padding: "12px 16px",
    fontWeight: 600,
    width: "100%",
    fontSize: 15,
    marginTop: 8,
    cursor: "pointer",
  },
  error: {
    background: "#fef2f2",
    color: "#991b1b",
    border: "1px solid #fecaca",
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  loadingBox: {
    marginTop: 20,
    padding: 24,
    background: "#eef2ff",
    border: "1px solid #c7d2fe",
    borderRadius: 12,
    textAlign: "center",
  },
  spinner: {
    width: 40,
    height: 40,
    margin: "0 auto",
    border: "4px solid #e5e7eb",
    borderTop: "4px solid #4f46e5",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  successBanner: {
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "white",
    padding: 20,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    marginBottom: 24,
    boxShadow: "0 4px 6px rgba(16, 185, 129, 0.2)",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 16,
    color: "#111827",
  },
  resultsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: 16,
    marginBottom: 24,
  },
  resultCard: {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  resultCardHeader: {
    background: "#f9fafb",
    padding: "12px 16px",
    fontWeight: 600,
    fontSize: 13,
    color: "#4338ca",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    borderBottom: "1px solid #e5e7eb",
  },
  resultCardBody: {
    padding: 16,
  },
  scoreContainer: {
    textAlign: "center",
  },
  scoreCircle: {
    width: 120,
    height: 120,
    margin: "0 auto",
    borderRadius: "50%",
    border: "4px solid",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  scoreNumber: {
    fontSize: 36,
    fontWeight: 700,
    lineHeight: 1,
  },
  scoreLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 4,
  },
  scoreBadge: {
    display: "inline-block",
    padding: "6px 12px",
    borderRadius: 20,
    fontSize: 13,
    fontWeight: 600,
  },
  textValue: {
    color: "#111827",
    fontSize: 14,
    lineHeight: 1.6,
    wordBreak: "break-word",
  },
  numberValue: {
    color: "#0891b2",
    fontSize: 20,
    fontWeight: 600,
  },
  booleanValue: {
    fontSize: 14,
    fontWeight: 600,
  },
  nullValue: {
    color: "#9ca3af",
    fontStyle: "italic",
    fontSize: 14,
  },
  linkValue: {
    color: "#4f46e5",
    textDecoration: "none",
    wordBreak: "break-all",
    fontSize: 13,
    padding: "8px 12px",
    background: "#eef2ff",
    borderRadius: 8,
    display: "inline-block",
  },
  emptyValue: {
    color: "#9ca3af",
    fontStyle: "italic",
    fontSize: 13,
  },
  textExpandable: {
    marginTop: 4,
  },
  textExpandableSummary: {
    cursor: "pointer",
    fontSize: 14,
    lineHeight: 1.6,
    color: "#374151",
  },
  textExpandableContent: {
    marginTop: 8,
    padding: 12,
    background: "#f9fafb",
    borderRadius: 8,
    fontSize: 13,
    lineHeight: 1.6,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
  },
  arrayContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  arrayItem: {
    display: "flex",
    alignItems: "flex-start",
    gap: 8,
  },
  arrayBullet: {
    color: "#4f46e5",
    fontSize: 18,
    lineHeight: 1.4,
    fontWeight: 700,
  },
  arrayItemContent: {
    flex: 1,
    paddingTop: 2,
  },
  objectContainer: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  objectRow: {
    display: "grid",
    gridTemplateColumns: "140px 1fr",
    gap: 12,
    alignItems: "start",
  },
  objectKey: {
    fontSize: 13,
    fontWeight: 600,
    color: "#6b7280",
    textTransform: "capitalize",
  },
  objectValue: {
    fontSize: 14,
    color: "#111827",
  },
  rawDataSection: {
    marginTop: 24,
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    overflow: "hidden",
  },
  rawDataSummary: {
    padding: "12px 16px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 14,
    color: "#6b7280",
    userSelect: "none",
  },
  rawDataPre: {
    margin: 0,
    padding: 16,
    background: "#1f2937",
    color: "#f3f4f6",
    fontSize: 12,
    lineHeight: 1.6,
    overflow: "auto",
    maxHeight: 400,
    borderTop: "1px solid #e5e7eb",
  },
};
