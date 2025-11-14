// components/ResultEvaluation.jsx
import React from "react";

export function ResultEvaluation({ evaluation, styles }) {
    const {
        overallScore,
        summary,
        strengths,
        improvements,
        keywords,
        quickWins,
        mediumHorizon,
        atsTips,
        scoreEntries,
    } = evaluation;

    const subTextColor = "#6b7280";

    return (
        <div
            style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)",
                gap: 20,
            }}
        >
            {/* Left: main narrative */}
            <div>
                <div
                    style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: 10,
                        marginBottom: 12,
                    }}
                >
                    <div style={{ fontSize: 36, fontWeight: 700 }}>
                        {typeof overallScore === "number" ? overallScore : "—"}
                        <span style={{ fontSize: 18 }}>%</span>
                    </div>
                    <div style={{ fontSize: 13, color: subTextColor }}>
                        Overall ATS fit score based on skills, experience, keywords, and
                        role alignment.
                    </div>
                </div>

                {summary && (
                    <div
                        style={{
                            fontSize: 14,
                            marginBottom: 14,
                            lineHeight: 1.5,
                        }}
                    >
                        {summary}
                    </div>
                )}

                {strengths && strengths.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                        <h3
                            style={{
                                margin: "0 0 4px",
                                fontSize: 14,
                                fontWeight: 600,
                            }}
                        >
                            Strengths
                        </h3>
                        <ul
                            style={{
                                margin: 0,
                                paddingLeft: 18,
                                fontSize: 13,
                                color: subTextColor,
                            }}
                        >
                            {strengths.map((s, idx) => (
                                <li key={`str-${idx}`} style={{ marginBottom: 4 }}>
                                    {s}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {improvements && improvements.length > 0 && (
                    <div>
                        <h3
                            style={{
                                margin: "0 0 4px",
                                fontSize: 14,
                                fontWeight: 600,
                            }}
                        >
                            Improvement areas
                        </h3>
                        <ul
                            style={{
                                margin: 0,
                                paddingLeft: 18,
                                fontSize: 13,
                                color: subTextColor,
                            }}
                        >
                            {improvements.map((s, idx) => (
                                <li key={`imp-${idx}`} style={{ marginBottom: 4 }}>
                                    {s}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Right: breakdown, tips, keywords */}
            <div
                style={{
                    borderRadius: 16,
                    border: "1px dashed rgba(148,163,184,0.6)",
                    padding: 14,
                    background: "rgba(249,250,251,0.6)",
                    fontSize: 13,
                }}
            >
                {scoreEntries && scoreEntries.length > 0 && (
                    <>
                        <div
                            style={{
                                fontWeight: 600,
                                marginBottom: 6,
                            }}
                        >
                            Score breakdown
                        </div>
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                                gap: 6,
                                marginBottom: 10,
                            }}
                        >
                            {scoreEntries.map((entry, idx) => (
                                <div
                                    key={`score-${idx}`}
                                    style={{
                                        padding: "6px 8px",
                                        borderRadius: 8,
                                        border: "1px solid rgba(203,213,225,0.9)",
                                        display: "flex",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                        gap: 6,
                                    }}
                                >
                  <span style={{ fontSize: 11, color: subTextColor }}>
                    {entry.label}
                  </span>
                                    <span style={{ fontSize: 13, fontWeight: 600 }}>
                    {entry.value}
                  </span>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {atsTips && atsTips.length > 0 && (
                    <>
                        <div
                            style={{
                                fontWeight: 600,
                                marginBottom: 4,
                            }}
                        >
                            ATS tips
                        </div>
                        <ul
                            style={{
                                margin: 0,
                                paddingLeft: 18,
                                fontSize: 12,
                                color: subTextColor,
                            }}
                        >
                            {atsTips.map((tip, idx) => (
                                <li key={`tip-${idx}`} style={{ marginBottom: 3 }}>
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </>
                )}

                {quickWins && quickWins.length > 0 && (
                    <>
                        <div
                            style={{
                                marginTop: 10,
                                fontWeight: 600,
                                marginBottom: 4,
                            }}
                        >
                            Quick wins (1–2 weeks)
                        </div>
                        <ul
                            style={{
                                margin: 0,
                                paddingLeft: 18,
                                fontSize: 12,
                                color: subTextColor,
                            }}
                        >
                            {quickWins.map((q, idx) => (
                                <li key={`qw-${idx}`} style={{ marginBottom: 3 }}>
                                    {q}
                                </li>
                            ))}
                        </ul>
                    </>
                )}

                {mediumHorizon && mediumHorizon.length > 0 && (
                    <>
                        <div
                            style={{
                                marginTop: 10,
                                fontWeight: 600,
                                marginBottom: 4,
                            }}
                        >
                            Medium horizon (projects)
                        </div>
                        <ul
                            style={{
                                margin: 0,
                                paddingLeft: 18,
                                fontSize: 12,
                                color: subTextColor,
                            }}
                        >
                            {mediumHorizon.map((m, idx) => (
                                <li key={`mh-${idx}`} style={{ marginBottom: 3 }}>
                                    {m}
                                </li>
                            ))}
                        </ul>
                    </>
                )}

                {keywords && keywords.length > 0 && (
                    <>
                        <div
                            style={{
                                marginTop: 10,
                                fontWeight: 600,
                                marginBottom: 4,
                            }}
                        >
                            Recommended keywords
                        </div>
                        <div
                            style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: 6,
                            }}
                        >
                            {keywords.map((kw, idx) => (
                                <span
                                    key={`kw-${idx}`}
                                    style={{
                                        fontSize: 11,
                                        padding: "2px 8px",
                                        borderRadius: 999,
                                        border: "1px solid rgba(148,163,184,0.7)",
                                    }}
                                >
                  {kw}
                </span>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}