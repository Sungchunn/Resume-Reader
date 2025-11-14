// components/JobForm.jsx
import React, { useState } from "react";

export function JobForm({ onSubmit, submitting, styles }) {
    const [roleName, setRoleName] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [file, setFile] = useState(null);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        setError("");

        if (!roleName.trim()) {
            return setError("Please enter the Upwork role name / job title.");
        }
        if (!jobDescription.trim()) {
            return setError("Please paste the Upwork job description.");
        }
        if (!file) {
            return setError("Please upload your resume as a PDF file.");
        }

        try {
            await onSubmit({ roleName, jobDescription, file });
        } catch (err) {
            setError(err.message || "Unexpected error occurred.");
        }
    };

    return (
        <section style={styles.cardShell}>
            <div style={styles.cardInner}>
                {/* LEFT COLUMN – form */}
                <div style={styles.formColumn}>
                    <h2 style={styles.h2}>Job Details</h2>
                    <p style={styles.formIntro}>
                        Start with a precise role name and the full job description. The
                        more context, the better the proposal.
                    </p>

                    <label style={styles.label}>Upwork role name / job title *</label>
                    <input
                        value={roleName}
                        onChange={(e) => setRoleName(e.target.value)}
                        placeholder="e.g., SQL + Python Reporting Analyst Interview Expert"
                        style={styles.input}
                    />

                    <label style={styles.label}>Upwork job description *</label>
                    <textarea
                        value={jobDescription}
                        onChange={(e) => setJobDescription(e.target.value)}
                        placeholder="Paste the Upwork job description here..."
                        style={styles.textarea}
                    />

                    <label style={styles.label}>Resume (PDF) *</label>
                    <input
                        type="file"
                        accept="application/pdf"
                        style={styles.fileInput}
                        onChange={(e) => {
                            const selected = e.target.files?.[0] || null;
                            if (!selected) {
                                setFile(null);
                                return;
                            }
                            if (selected.type !== "application/pdf") {
                                setError("Please upload a PDF file.");
                                e.target.value = "";
                                setFile(null);
                                return;
                            }
                            setError("");
                            setFile(selected);
                        }}
                    />
                    {file && (
                        <div style={styles.fileMeta}>
                            Selected file: <strong>{file.name}</strong>
                        </div>
                    )}

                    {error && <div style={styles.error}>{error}</div>}

                    <button
                        onClick={handleSubmit}
                        disabled={submitting}
                        style={{
                            ...styles.primaryButton,
                            opacity: submitting ? 0.7 : 1,
                            cursor: submitting ? "not-allowed" : "pointer",
                        }}
                    >
                        {submitting ? "Processing CV Response…" : "Generate CV Response"}
                    </button>
                </div>

                {/* RIGHT COLUMN – tips */}
                <aside style={styles.tipsColumn}>
                    <div style={styles.tipsCard}>
                        <h3 style={styles.tipsTitle}>Tips for best results</h3>
                        <ul style={styles.tipsList}>
                            <li>
                                Include tech stack, deliverables, and any metrics mentioned in
                                the job post.
                            </li>
                            <li>
                                Mention timeline, budget, or collaboration style if the client
                                specifies it.
                            </li>
                            <li>
                                Upload the same resume you actually use on Upwork so the agent
                                can map it cleanly.
                            </li>
                        </ul>

                        <div style={styles.tipsSubCard}>
                            <div style={styles.tipsSubTitle}>What you get</div>
                            <p style={styles.tipsSubText}>
                                Structured proposal sections, a Mermaid workflow diagram, and
                                tailored talking points you can paste directly into your Upwork
                                proposal.
                            </p>
                        </div>
                    </div>
                </aside>
            </div>
        </section>
    );
}