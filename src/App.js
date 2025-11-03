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

  const renderBeautifulValue = (key, value) => {
    // Special handling for common fields
    if (key === 'ats_score' && typeof value === 'number') {
      const scoreColor = value >= 80 ? '#10b981' : value >= 60 ? '#f59e0b' : '#ef4444';
      return (
        <div style={styles.scoreCard}>
          <div style={{ fontSize: 48, fontWeight: 700, color: scoreColor }}>
            {value}
          </div>
          <div style={{ fontSize: 14, color: '#6b7280', marginTop: 4 }}>
            out of 100
          </div>
          <div style={{ marginTop: 8, fontSize: 12 }}>
            {value >= 80 && <span style={{ color: '#10b981' }}>✓ Excellent</span>}
            {value >= 60 && value < 80 && <span style={{ color: '#f59e0b' }}>⚠ Good</span>}
            {value < 60 && <span style={{ color: '#ef4444' }}>✗ Needs Improvement</span>}
          </div>
        </div>
      );
    }

    if ((key.includes('url') || key.includes('link')) && typeof value === 'string') {
      return (
        <a href={value} target="_blank" rel="noreferrer" style={styles.urlLink}>
          🔗 {value}
        </a>
      );
    }

    if (typeof value === 'string' && value.length > 200) {
      return (
        <details style={styles.expandable}>
          <summary style={styles.expandableSummary}>
            📄 View Content ({value.length} characters)
          </summary>
          <div style={styles.expandableContent}>
            {value}
          </div>
        </details>
      );
    }

    if (typeof value === 'string') {
      return <div style={styles.textValue}>{value}</div>;
    }

    if (typeof value === 'number') {
      return <div style={styles.numberValue}>{value}</div>;
    }

    if (typeof value === 'boolean') {
      return (
        <div style={styles.booleanValue}>
          {value ? '✓ True' : '✗ False'}
        </div>
      );
    }

    if (value === null || value === undefined) {
      return <div style={styles.nullValue}>—</div>;
    }

    if (Array.isArray(value)) {
      return (
        <details style={styles.expandable}>
          <summary style={styles.expandableSummary}>
            📋 Array ({value.length} items)
          </summary>
          <div style={styles.arrayContent}>
            {value.map((item, idx) => (
              <div key={idx} style={styles.arrayItem}>
                <span style={styles.arrayIndex}>{idx + 1}.</span>
                {typeof item === 'object' ? JSON.stringify(item, null, 2) : String(item)}
              </div>
            ))}
          </div>
        </details>
      );
    }

    if (typeof value === 'object') {
      return (
        <details style={styles.expandable}>
          <summary style={styles.expandableSummary}>
            📦 Object ({Object.keys(value).length} properties)
          </summary>
          <div style={styles.objectContent}>
            {Object.entries(value).map(([k, v]) => (
              <div key={k} style={styles.objectRow}>
                <strong style={styles.objectKey}>{k}:</strong>
                <span style={styles.objectValue}>
                  {typeof v === 'object' ? JSON.stringify(v, null, 2) : String(v)}
                </span>
              </div>
            ))}
          </div>
        </details>
      );
    }

    return <div style={styles.textValue}>{String(value)}</div>;
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
                      {renderBeautifulValue(key, value)}
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
    maxWidth: 800,
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
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: 16,
    marginBottom: 24,
  },
  resultCard: {
    background: "white",
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    overflow: "hidden",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    transition: "transform 0.2s, box-shadow 0.2s",
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
  scoreCard: {
    textAlign: "center",
    padding: "12px 0",
  },
  urlLink: {
    color: "#4f46e5",
    textDecoration: "none",
    wordBreak: "break-all",
    display: "block",
    padding: "8px 12px",
    background: "#eef2ff",
    borderRadius: 8,
    fontSize: 13,
    transition: "background 0.2s",
  },
  textValue: {
    color: "#374151",
    fontSize: 14,
    lineHeight: 1.6,
  },
  numberValue: {
    color: "#0891b2",
    fontSize: 24,
    fontWeight: 700,
  },
  booleanValue: {
    fontSize: 14,
    fontWeight: 600,
    color: "#059669",
  },
  nullValue: {
    color: "#9ca3af",
    fontStyle: "italic",
    fontSize: 14,
  },
  expandable: {
    background: "#f9fafb",
    border: "1px solid #e5e7eb",
    borderRadius: 8,
    overflow: "hidden",
  },
  expandableSummary: {
    padding: "10px 12px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 13,
    color: "#4f46e5",
    userSelect: "none",
  },
  expandableContent: {
    padding: 12,
    background: "white",
    borderTop: "1px solid #e5e7eb",
    fontSize: 13,
    lineHeight: 1.6,
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    maxHeight: 300,
    overflow: "auto",
  },
  arrayContent: {
    padding: 12,
    background: "white",
    borderTop: "1px solid #e5e7eb",
  },
  arrayItem: {
    padding: "8px 0",
    borderBottom: "1px solid #f3f4f6",
    fontSize: 13,
    lineHeight: 1.5,
  },
  arrayIndex: {
    color: "#6b7280",
    fontWeight: 600,
    marginRight: 8,
  },
  objectContent: {
    padding: 12,
    background: "white",
    borderTop: "1px solid #e5e7eb",
  },
  objectRow: {
    padding: "8px 0",
    borderBottom: "1px solid #f3f4f6",
    fontSize: 13,
  },
  objectKey: {
    color: "#4338ca",
    marginRight: 8,
  },
  objectValue: {
    color: "#374151",
    wordBreak: "break-word",
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
