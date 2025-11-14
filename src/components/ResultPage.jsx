// components/ResultPage.jsx
import React from "react";
import { ResultEvaluation } from "./ResultEvaluation";
import { ResultLatex } from "./ResultLatex";

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

    // Normalise result into an array
    const arrayResult = Array.isArray(result) ? result : [result];

    // LaTeX output comes from the first item
    const latexOutput = arrayResult[0]?.output || "";

    // Evaluation object is the one that has overall_score
    const evalItem =
        arrayResult.find((it) => typeof it.overall_score === "number") || {};

    const {
        overall_score,
        strengths_all,
        improvement_areas_all,
        keyword_recommendations_all,
        quick_wins_all,
        medium_horizon_all,
        ats_tips_all,
        summary,
        ...restEval
    } = evalItem;

    const splitPiped = (text) =>
        text ? text.split("|").map((t) => t.trim()).filter(Boolean) : [];

    const strengths = splitPiped(strengths_all);
    const improvements = splitPiped(improvement_areas_all);
    const keywords = splitPiped(keyword_recommendations_all);
    const quickWins = splitPiped(quick_wins_all);
    const mediumHorizon = splitPiped(medium_horizon_all);
    const atsTips = splitPiped(ats_tips_all);

    const scoreEntries = Object.entries(restEval)
        .filter(
            ([key, value]) =>
                key.startsWith("cs_") && typeof value === "number" && !Number.isNaN(value)
        )
        .map(([key, value]) => {
            const label = key
                .replace(/^cs_/, "")
                .replace(/_/g, " ")
                .replace(/\b\w/g, (ch) => ch.toUpperCase());
            return { label, value };
        });

    const evaluation = {
        overallScore: overall_score,
        summary,
        strengths,
        improvements,
        keywords,
        quickWins,
        mediumHorizon,
        atsTips,
        scoreEntries,
    };

    return (
        <div style={styles.resultLayout}>
            {/* Top card – ATS evaluation */}
            <section
                style={{
                    ...styles.card,
                    width: "100%",
                }}
            >
                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 12,
                        marginBottom: 12,
                    }}
                >
                    <div>
                        <h2 style={styles.h2}>ATS Match Evaluation</h2>
                        {roleName && (
                            <div
                                style={{
                                    marginTop: 4,
                                    fontSize: 13,
                                    color: "#6b7280",
                                }}
                            >
                                Target role: <strong>{roleName}</strong>
                            </div>
                        )}
                    </div>
                    <button onClick={onBack} style={styles.secondaryButton}>
                        ← Back to Job Input
                    </button>
                </div>

                <ResultEvaluation evaluation={evaluation} styles={styles} />
            </section>

            {/* Bottom split – LaTeX editor + preview */}
            <section style={styles.latexShell}>
                <ResultLatex output={latexOutput} styles={styles} />
            </section>
        </div>
    );
}