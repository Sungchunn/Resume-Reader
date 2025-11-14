// components/ResultPage.jsx
import React from "react";

export function ResultPage({ result, onBack, roleName, styles }) {
    if (!result) {
        return (
            <section style={styles.card}>
                <button onClick={onBack} style={styles.secondaryButton}>
                    ← Back to Job Input
                </button>
                <p style={{ marginTop: 16 }}>
                    No analysis results found. Please go back and submit a job description
                    first.
                </p>
            </section>
        );
    }

    const item = Array.isArray(result) ? result[0] : result;

    const {
        painPointExtraction,
        technicalSolution,
        workflowMermaid,
        relevantExperience,
        solutionSummary,
        timeline,
        callToAction,
    } = item || {};

    const renderTextWithLineBreaks = (text) => {
        if (!text) return null;
        return text.split("\n").map((line, idx) => (
            <p key={idx} style={{ margin: "4px 0", lineHeight: 1.5 }}>
                {line}
            </p>
        ));
    };

    return (
        <section style={{ ...styles.card, maxWidth: 900 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                    <h2 style={styles.h2}>AI CV Response Overview</h2>
                    {roleName && (
                        <div style={styles.targetRole}>
                            Target Role: <strong>{roleName}</strong>
                        </div>
                    )}
                </div>
                <button onClick={onBack} style={styles.secondaryButton}>
                    ← Back to Job Input
                </button>
            </div>

            <section style={styles.sectionBlock}>
                <h3 style={styles.sectionTitle}>Pain Point Extraction</h3>
                <div style={styles.sectionBody}>
                    {renderTextWithLineBreaks(painPointExtraction)}
                </div>
            </section>

            <section style={styles.sectionBlock}>
                <h3 style={styles.sectionTitle}>Technical Solution</h3>
                <div style={styles.sectionBody}>
                    {renderTextWithLineBreaks(technicalSolution)}
                </div>
            </section>

            <section style={styles.sectionBlock}>
                <h3 style={styles.sectionTitle}>Workflow Diagram (Mermaid)</h3>
                <p style={styles.sectionHelpText}>
                    Copy this code into a Mermaid-compatible viewer (or a future diagram
                    component) to render the hiring workflow.
                </p>
                <pre style={styles.codeBlock}>{workflowMermaid}</pre>
            </section>

            <section style={styles.sectionBlock}>
                <h3 style={styles.sectionTitle}>Relevant Experience Mapping</h3>
                <ul style={styles.list}>
                    {Array.isArray(relevantExperience) &&
                        relevantExperience.map((exp, idx) => (
                            <li key={idx} style={styles.listItem}>
                                {exp}
                            </li>
                        ))}
                </ul>
            </section>

            <section style={styles.sectionBlock}>
                <h3 style={styles.sectionTitle}>Solution Summary</h3>
                <div style={styles.sectionBody}>
                    {renderTextWithLineBreaks(solutionSummary)}
                </div>
            </section>

            <section style={styles.sectionBlock}>
                <h3 style={styles.sectionTitle}>Timeline & Next Steps</h3>
                <div style={styles.sectionBody}>{renderTextWithLineBreaks(timeline)}</div>
                {callToAction && (
                    <div style={{ marginTop: 8, fontWeight: 600 }}>
                        {renderTextWithLineBreaks(callToAction)}
                    </div>
                )}
            </section>
        </section>
    );
}