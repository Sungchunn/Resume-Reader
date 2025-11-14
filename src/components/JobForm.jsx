import React, { useState } from "react";

export function JobForm({ onSubmit, submitting, styles }) {
    const [roleName, setRoleName] = useState("");
    const [jobDescription, setJobDescription] = useState("");
    const [file, setFile] = useState(null);
    const [error, setError] = useState("");

    const handleSubmit = async () => {
        setError("");

        if (!roleName.trim()) {
            return setError("Please enter the job title / role name.");
        }
        if (!jobDescription.trim()) {
            return setError("Please paste the full job description.");
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
        <section style={styles.card}>
            {/* LEFT COLUMN – form */}
            <div style={styles.formColumn}>
                <h2 style={styles.h2}>Job &amp; Resume Details</h2>
                <p style={styles.formIntro}>
                    Upload the resume you want to improve, then add the job title and
                    description you are applying for. The AI agent evaluates your resume
                    against the role and generates an ATS-friendly LaTeX version you can
                    edit in real time.
                </p>

                <label style={styles.label}>Job title / role name *</label>
                <input
                    value={roleName}
                    onChange={(e) => setRoleName(e.target.value)}
                    placeholder="e.g., Data Engineer – Food Waste Analytics"
                    style={styles.input}
                />

                <label style={styles.label}>Job description *</label>
                <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the full job description here..."
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
                    {submitting
                        ? "Analyzing resume and generating LaTeX…"
                        : "Evaluate & Generate ATS Resume"}
                </button>
            </div>

            {/* RIGHT COLUMN – tips */}
            <aside style={styles.tipsColumn}>
                <div style={styles.tipsCard}>
                    <h3 style={styles.tipsTitle}>Tips for best results</h3>
                    <ul style={styles.tipsList}>
                        <li>
                            Use the exact job title from the posting so the agent can align
                            your resume language with the role.
                        </li>
                        <li>
                            Paste the complete job description, including responsibilities,
                            requirements, and any listed metrics or tools.
                        </li>
                        <li>
                            Upload the resume you actually use today so the evaluation and
                            LaTeX output reflect your real profile.
                        </li>
                    </ul>

                    <div style={styles.tipsSubCard}>
                        <div style={styles.tipsSubTitle}>What you get</div>
                        <p style={styles.tipsSubText}>
                            A structured evaluation of how well your resume matches the job,
                            plus editable LaTeX source for an ATS-optimized resume that you
                            can tweak and export for applications.
                        </p>
                    </div>
                </div>
            </aside>
        </section>
    );
}