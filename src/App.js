// src/App.js
import React, { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import './App.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// ✅ Robust worker wiring: import the ESM worker and let the bundler give us a URL.
// import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
// pdfjs.GlobalWorkerOptions.workerSrc = workerSrc;

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).toString();

// Use /webhook-test while running a test execution in n8n.
// Switch to /webhook when the workflow is activated.
const UPLOAD_WEBHOOK =
    'https://shreyahubcredo.app.n8n.cloud/webhook-test/2227bd6f-2f86-470d-a2d0-d8ff386eb788';

const App = () => {
    const [pdfUrl, setPdfUrl] = useState(null);
    const [pdfBlob, setPdfBlob] = useState(null);
    const [analysisData, setAnalysisData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [formData, setFormData] = useState({
        job_title: '',
        job_description: '',
        company_url: '',
        file: null,
    });

    const objectUrlRef = useRef(null);

    const onDocumentLoadSuccess = ({ numPages }) => setNumPages(numPages);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files?.[0] ?? null;
        setFormData((prev) => ({ ...prev, file }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setNumPages(null);
        setPdfBlob(null);
        setPdfUrl(null);
        setAnalysisData(null);

        try {
            if (!formData.file) throw new Error('Please attach a PDF file.');

            const data = new FormData();
            data.append('job_title', formData.job_title);
            data.append('job_description', formData.job_description);
            data.append('company_url', formData.company_url);
            data.append('file', formData.file);

            const response = await fetch(UPLOAD_WEBHOOK, {
                method: 'POST',
                body: data,
                headers: { Accept: 'application/json' },
            });

            if (!response.ok) {
                let msg = `Request failed (${response.status})`;
                try {
                    const hint = await response.text();
                    if (hint) msg += ` — ${hint.slice(0, 500)}`;
                } catch {}
                throw new Error(msg);
            }

            const ct = response.headers.get('content-type') || '';

            // Handle JSON response with analysis data
            if (ct.includes('json')) {
                const jsonData = await response.json();

                console.log('Received JSON response:', jsonData);

                // Try to parse different response formats
                let analysisJson = null;
                let pdfSource = null;

                // Format 1: Array with output field [{ output: "stringified json" }]
                if (Array.isArray(jsonData) && jsonData.length > 0 && jsonData[0].output) {
                    try {
                        analysisJson = JSON.parse(jsonData[0].output);
                        console.log('Parsed analysis from array format:', analysisJson);

                        // Check for PDF in array object
                        if (jsonData[0].pdf_url) {
                            pdfSource = jsonData[0].pdf_url;
                        } else if (jsonData[0].pdf_data) {
                            pdfSource = 'base64:' + jsonData[0].pdf_data;
                        }
                    } catch (parseError) {
                        console.error('Failed to parse output field:', parseError);
                        throw new Error('Failed to parse analysis JSON from output field');
                    }
                }
                // Format 2: Direct object with analysis fields
                else if (jsonData && typeof jsonData === 'object' && !Array.isArray(jsonData)) {
                    analysisJson = jsonData;
                    console.log('Using direct object format:', analysisJson);
                }
                // Format 3: Array with direct objects
                else if (Array.isArray(jsonData) && jsonData.length > 0 && jsonData[0].overall_score !== undefined) {
                    analysisJson = jsonData[0];
                    console.log('Using first array item as analysis:', analysisJson);
                }
                else {
                    console.error('Unrecognized response format:', jsonData);
                    throw new Error(`Unexpected response format. Received: ${JSON.stringify(jsonData).substring(0, 200)}...`);
                }

                // Set analysis data
                if (analysisJson) {
                    setAnalysisData(analysisJson);

                    // Check for PDF URL in the parsed analysis itself
                    if (!pdfSource && analysisJson.pdf_url) {
                        pdfSource = analysisJson.pdf_url;
                    }

                    // Handle PDF source
                    if (pdfSource) {
                        if (pdfSource.startsWith('base64:')) {
                            // Convert base64 to blob
                            try {
                                const base64Data = pdfSource.substring(7);
                                const binaryString = atob(base64Data);
                                const bytes = new Uint8Array(binaryString.length);
                                for (let i = 0; i < binaryString.length; i++) {
                                    bytes[i] = binaryString.charCodeAt(i);
                                }
                                const blob = new Blob([bytes], { type: 'application/pdf' });
                                setPdfBlob(blob);
                                console.log('Converted base64 PDF to blob');
                            } catch (b64Error) {
                                console.error('Failed to decode base64 PDF:', b64Error);
                            }
                        } else {
                            // Fetch from URL
                            try {
                                console.log('Fetching PDF from:', pdfSource);
                                const pdfResponse = await fetch(pdfSource);
                                const pdfBlob = await pdfResponse.blob();
                                setPdfBlob(pdfBlob);
                                console.log('Successfully fetched PDF from URL');
                            } catch (pdfError) {
                                console.error('Failed to fetch PDF:', pdfError);
                            }
                        }
                    } else {
                        console.warn('No PDF data found in response. Analysis will be shown without PDF.');
                    }
                } else {
                    throw new Error('Could not extract analysis data from response');
                }
            }
            // Handle PDF response directly
            else if (ct.includes('pdf')) {
                const ab = await response.arrayBuffer();
                const blob = new Blob([ab], { type: 'application/pdf' });
                setPdfBlob(blob);
            }
            else {
                throw new Error(`Unexpected content type: ${ct}`);
            }
        } catch (err) {
            setError(err?.message || 'Something went wrong!');
        } finally {
            setLoading(false);
        }
    };

    // Create/revoke object URL when pdfBlob changes
    useEffect(() => {
        if (!pdfBlob) {
            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
                objectUrlRef.current = null;
            }
            setPdfUrl(null);
            return;
        }
        const url = URL.createObjectURL(pdfBlob);
        objectUrlRef.current = url;
        setPdfUrl(url);

        return () => {
            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
                objectUrlRef.current = null;
            }
        };
    }, [pdfBlob]);

    // Rendering functions for analysis data
    const renderCategoryScores = (scores) => {
        return (
            <div className="category-scores-grid">
                {Object.entries(scores).map(([category, score]) => {
                    const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444';
                    return (
                        <div key={category} className="progress-item">
                            <div className="progress-header">
                                <span className="category-label">{category.replace(/_/g, ' ')}</span>
                                <span className="score-value" style={{ color }}>{score}</span>
                            </div>
                            <div className="progress-track">
                                <div className="progress-fill" style={{ width: `${score}%`, backgroundColor: color }}></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderList = (items, className) => {
        if (!items || items.length === 0) return null;
        return (
            <ul className={className}>
                {items.map((item, idx) => (
                    <li key={idx}>{item}</li>
                ))}
            </ul>
        );
    };

    const renderKeywords = (keywords) => {
        if (!keywords || keywords.length === 0) return null;
        return (
            <div className="keywords-grid">
                {keywords.map((keyword, idx) => (
                    <span key={idx} className="keyword-pill">{keyword}</span>
                ))}
            </div>
        );
    };

    const renderLearningPlan = (plan) => {
        if (!plan) return null;
        return (
            <div className="learning-plan">
                {plan.quick_wins_1_2_weeks && plan.quick_wins_1_2_weeks.length > 0 && (
                    <div className="learning-section">
                        <h4><span className="badge badge-quick">⚡ Quick Wins (1-2 weeks)</span></h4>
                        <ul className="learning-list">
                            {plan.quick_wins_1_2_weeks.map((item, idx) => (
                                <li key={idx}>{item}</li>
                            ))}
                        </ul>
                    </div>
                )}
                {plan.medium_horizon_1_2_months && plan.medium_horizon_1_2_months.length > 0 && (
                    <div className="learning-section">
                        <h4><span className="badge badge-medium">🎯 Medium Horizon (1-2 months)</span></h4>
                        <ul className="learning-list">
                            {plan.medium_horizon_1_2_months.map((item, idx) => (
                                <li key={idx}>{item}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>
        );
    };

    const renderCompanyInsights = (insights) => {
        if (!insights) return null;
        return (
            <div className="company-insights">
                {insights.highlights && insights.highlights.length > 0 && (
                    <div className="highlights-section">
                        <h4>Key Highlights</h4>
                        <ul className="highlights-list">
                            {insights.highlights.map((highlight, idx) => (
                                <li key={idx}>{highlight}</li>
                            ))}
                        </ul>
                    </div>
                )}
                {insights.sources && insights.sources.length > 0 && (
                    <div className="sources-section">
                        <h4>Sources</h4>
                        <div className="sources-list">
                            {insights.sources.map((source, idx) => (
                                <a key={idx} href={source} target="_blank" rel="noopener noreferrer" className="source-link">
                                    {source}
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const handleBack = () => {
        setPdfUrl(null);
        setPdfBlob(null);
        setAnalysisData(null);
        setError(null);
        setNumPages(null);
        setFormData({
            job_title: '',
            job_description: '',
            company_url: '',
            file: null,
        });
    };

    // Results view with analysis and PDF
    if (analysisData || pdfUrl) {
        return (
            <div className="App results-view">
                <header className="App-header">
                    <h1>Resume Analysis Report</h1>
                    <button onClick={handleBack} className="back-btn">Back to Form</button>
                </header>
                <main className="split-layout">
                    {/* Left: Analysis Section */}
                    {analysisData && (
                        <div className="analysis-panel">
                            {/* Overall Score */}
                            {analysisData.overall_score !== undefined && (
                                <div className="analysis-card">
                                    <h2>Overall Score</h2>
                                    <div className="score-display">
                                        <div className="score-circle" style={{
                                            backgroundColor: analysisData.overall_score >= 80 ? '#10b981' :
                                                analysisData.overall_score >= 60 ? '#f59e0b' : '#ef4444'
                                        }}>
                                            {analysisData.overall_score}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Category Scores */}
                            {analysisData.category_scores && (
                                <div className="analysis-card">
                                    <h2>Category Scores</h2>
                                    {renderCategoryScores(analysisData.category_scores)}
                                </div>
                            )}

                            {/* Strengths */}
                            {analysisData.strengths && analysisData.strengths.length > 0 && (
                                <div className="analysis-card">
                                    <h2>✓ Strengths</h2>
                                    {renderList(analysisData.strengths, 'strengths-list')}
                                </div>
                            )}

                            {/* Improvement Areas */}
                            {analysisData.improvement_areas && analysisData.improvement_areas.length > 0 && (
                                <div className="analysis-card">
                                    <h2>⚠ Areas for Improvement</h2>
                                    {renderList(analysisData.improvement_areas, 'improvement-list')}
                                </div>
                            )}

                            {/* Keyword Recommendations */}
                            {analysisData.keyword_recommendations && analysisData.keyword_recommendations.length > 0 && (
                                <div className="analysis-card">
                                    <h2>🔑 Keyword Recommendations</h2>
                                    {renderKeywords(analysisData.keyword_recommendations)}
                                </div>
                            )}

                            {/* Tailored Bullets */}
                            {analysisData.tailored_bullets && analysisData.tailored_bullets.length > 0 && (
                                <div className="analysis-card">
                                    <h2>→ Tailored Bullet Points</h2>
                                    {renderList(analysisData.tailored_bullets, 'bullets-list')}
                                </div>
                            )}

                            {/* ATS Tips */}
                            {analysisData.ats_tips && analysisData.ats_tips.length > 0 && (
                                <div className="analysis-card">
                                    <h2>💡 ATS Tips</h2>
                                    {renderList(analysisData.ats_tips, 'tips-list')}
                                </div>
                            )}

                            {/* Gaps and Learning Plan */}
                            {analysisData.gaps_and_learning_plan && (
                                <div className="analysis-card">
                                    <h2>📚 Learning Plan</h2>
                                    {renderLearningPlan(analysisData.gaps_and_learning_plan)}
                                </div>
                            )}

                            {/* Company Insights */}
                            {analysisData.company_insights && (
                                <div className="analysis-card">
                                    <h2>🏢 Company Insights</h2>
                                    {renderCompanyInsights(analysisData.company_insights)}
                                </div>
                            )}

                            {/* Summary */}
                            {analysisData.summary && (
                                <div className="analysis-card">
                                    <h2>📄 Summary</h2>
                                    <div className="summary-box">
                                        {analysisData.summary}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Right: PDF Viewer */}
                    {pdfUrl && (
                        <div className="pdf-panel">
                            <Document
                                file={pdfUrl}
                                onLoadSuccess={onDocumentLoadSuccess}
                                onLoadError={(err) => setError(`PDF load error: ${String(err?.message || err)}`)}
                                className="pdf-document"
                            >
                                {Array.from({ length: numPages || 0 }).map((_, i) => (
                                    <Page key={`page_${i + 1}`} pageNumber={i + 1} className="pdf-page" />
                                ))}
                            </Document>
                            {error && <div className="error" style={{ marginTop: 12 }}>{error}</div>}
                        </div>
                    )}
                </main>
            </div>
        );
    }

    return (
        <div className="App">
            <header className="App-header">
                <h1>Resume Analyzer</h1>
            </header>
            <main>
                <form onSubmit={handleSubmit} className="card" encType="multipart/form-data">
                    {error && <div className="error">{error}</div>}

                    <div className="form-group">
                        <label htmlFor="job_title">Job Title</label>
                        <input
                            type="text"
                            id="job_title"
                            name="job_title"
                            value={formData.job_title}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="company_url">Company URL (Optional)</label>
                        <input
                            type="url"
                            id="company_url"
                            name="company_url"
                            placeholder="https://example.com"
                            value={formData.company_url}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="job_description">Job Description</label>
                        <textarea
                            id="job_description"
                            name="job_description"
                            value={formData.job_description}
                            onChange={handleInputChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="file">Resume (PDF)</label>
                        <input
                            type="file"
                            id="file"
                            name="file"
                            accept="application/pdf,.pdf"
                            onChange={handleFileChange}
                            required
                        />
                    </div>

                    <button type="submit" className="submit-btn" disabled={loading}>
                        {loading ? 'Analyzing...' : 'Analyze Resume'}
                    </button>
                </form>
            </main>
        </div>
    );
};

export default App;