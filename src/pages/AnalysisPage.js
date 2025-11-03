import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import '../App.css';

const AnalysisPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { analysisData, hasPdf } = location.state || {};

    // Redirect if no data
    React.useEffect(() => {
        if (!analysisData) {
            navigate('/');
        }
    }, [analysisData, navigate]);

    if (!analysisData) {
        return null;
    }

    // Rendering functions
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

    return (
        <div className="App analysis-page">
            <header className="App-header">
                <h1>Resume Analysis Report</h1>
                <div className="header-actions">
                    <Link to="/" className="back-btn">Back to Form</Link>
                    {hasPdf && (
                        <Link to="/pdf" state={{ pdfUrl: location.state.pdfUrl }} className="view-pdf-btn">
                            View Improved Resume
                        </Link>
                    )}
                </div>
            </header>
            <main className="analysis-container">
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
            </main>
        </div>
    );
};

export default AnalysisPage;
