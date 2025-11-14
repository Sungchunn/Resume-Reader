// App.jsx
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
                <div style={styles.headerTopRow}>
          <span style={styles.badge}>
            <span style={styles.badgeDot}></span>
            <span style={styles.badgeText}>Proposal Studio</span>
            <span style={styles.badgeTag}>Beta</span>
          </span>
                    <div style={styles.headerThemeHint}>
                        ● Theme synced to system ({isDarkMode ? "Dark" : "Light"} mode)
                    </div>
                </div>

                <h1 style={styles.headerTitle}>Upwork Proposal Analyzer</h1>
                <p style={styles.headerSubtitle}>
                    Paste an Upwork job and generate a structured, AI-tailored CV response
                    with a visual workflow diagram.
                </p>
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