import React, { useState } from "react";
import { uploadJob } from "./api/upload";
import { JobForm } from "./components/JobForm";
import { ResultPage } from "./components/ResultPage";
import { useSystemTheme } from "./hooks/useSystemTheme";
import { getStyles } from "./styles/themeStyles";

export default function App() {
    const isDarkMode = useSystemTheme();
    const styles = getStyles(isDarkMode);

    const [submitting, setSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [lastRoleName, setLastRoleName] = useState("");
    const [view, setView] = useState("form");

    const handleSubmit = async ({ roleName, jobDescription, file }) => {
        setSubmitting(true);
        try {
            const json = await uploadJob({ roleName, jobDescription, file });
            setResult(json);
            setLastRoleName(roleName);
            setView("result");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div style={styles.page}>
            <header style={styles.header}>
                <div style={styles.headerInner}>
                    <div style={styles.headerTopRow}>
            <span style={styles.badge}>
                <span style={styles.badgeDot} />
                <span style={styles.badgeText}>Resume Studio</span>
                <span style={styles.badgeTag}>Beta</span>
            </span>

                        <div style={styles.headerThemeHint}>
                            ● Theme synced to system ({isDarkMode ? "Dark" : "Light"} mode)
                        </div>
                    </div>

                    <h1 style={styles.headerTitle}>AI ATS Resume Optimizer</h1>

                    <p style={styles.headerSubtitle}>
                        Connect your resume, job title, and job description to an AI agent
                        running in n8n. It evaluates the match and returns editable LaTeX
                        for an ATS-optimized resume tailored to that specific role.
                    </p>
                </div>
            </header>

            <main style={styles.main}>
                {view === "form" && (
                    <JobForm
                        submitting={submitting}
                        onSubmit={handleSubmit}
                        styles={styles}
                    />
                )}

                {view === "result" && (
                    <ResultPage
                        result={result}
                        roleName={lastRoleName}
                        onBack={() => setView("form")}
                        styles={styles}
                    />
                )}
            </main>
        </div>
    );
}