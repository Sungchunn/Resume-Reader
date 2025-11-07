// src/App.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

const UPLOAD_WEBHOOK = 'https://shreyahubcredo.app.n8n.cloud/webhook-test/2227bd6f-2f86-470d-a2d0-d8ff386eb788';

// Transform flat webhook format to expected structure
const transformAnalysisData = (data) => {
    if (!data) return data;

    // If data is already in the expected format, return as-is
    if (data.strengths && Array.isArray(data.strengths)) {
        return data;
    }

    const transformed = { ...data };

    // Extract category scores (fields starting with cs_)
    const categoryScores = {};
    Object.keys(data).forEach(key => {
        if (key.startsWith('cs_')) {
            const categoryName = key.replace('cs_', '').replace(/_/g, ' ');
            categoryScores[categoryName] = data[key];
        }
    });
    if (Object.keys(categoryScores).length > 0) {
        transformed.category_scores = categoryScores;
    }

    // Convert numbered fields to arrays
    const convertToArray = (prefix) => {
        const items = [];
        let index = 1;
        while (data[`${prefix}_${index}`]) {
            items.push(data[`${prefix}_${index}`]);
            index++;
        }
        // If no numbered fields, check for _all field
        if (items.length === 0 && data[`${prefix}_all`]) {
            // Split by | or newline
            const allText = data[`${prefix}_all`];
            return allText.split(/\s*\|\s*/).filter(s => s.trim());
        }
        return items.length > 0 ? items : undefined;
    };

    // Transform strengths
    const strengths = convertToArray('strengths');
    if (strengths) transformed.strengths = strengths;

    // Transform improvement areas
    const improvements = convertToArray('improvement');
    if (improvements) transformed.improvement_areas = improvements;

    // Transform tailored bullets
    const bullets = convertToArray('tailored_bullet');
    if (bullets) transformed.tailored_bullets = bullets;

    // Transform keyword recommendations
    if (data.keyword_recommendations_all) {
        transformed.keyword_recommendations = data.keyword_recommendations_all
            .split(/\s*\|\s*/)
            .filter(s => s.trim());
    }

    // Transform ATS tips
    if (data.ats_tips_all) {
        transformed.ats_tips = data.ats_tips_all
            .split(/\s*\|\s*/)
            .filter(s => s.trim());
    }

    // Transform learning plan
    const quickWins = convertToArray('quick_win');
    const mediumHorizon = convertToArray('medium_horizon');
    if (quickWins || mediumHorizon) {
        transformed.gaps_and_learning_plan = {};
        if (quickWins) transformed.gaps_and_learning_plan.quick_wins_1_2_weeks = quickWins;
        if (mediumHorizon) transformed.gaps_and_learning_plan.medium_horizon_1_2_months = mediumHorizon;
    }

    // Transform company insights
    if (data.company_highlights_all || data.company_sources_all) {
        transformed.company_insights = {};
        if (data.company_highlights_all) {
            transformed.company_insights.highlights = data.company_highlights_all
                .split(/\s*\|\s*/)
                .filter(s => s.trim());
        }
        if (data.company_sources_all) {
            transformed.company_insights.sources = data.company_sources_all
                .split(/\s*\|\s*/)
                .filter(s => s.trim());
        }
    }

    return transformed;
};

const App = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        job_title: '',
        job_description: '',
        company_url: '',
        file: null,
    });

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

            // Handle JSON response with analysis data and LaTeX
            if (ct.includes('json')) {
                const jsonData = await response.json();
                console.log('Received JSON response:', jsonData);

                let analysisJson = null;
                let latexCode = null;

                // Format 1: Array with output field [{ output: "stringified json" }]
                if (Array.isArray(jsonData) && jsonData.length > 0 && jsonData[0].output) {
                    try {
                        analysisJson = JSON.parse(jsonData[0].output);
                        console.log('Parsed analysis from array format:', analysisJson);

                        // Check for LaTeX in array object
                        if (jsonData[0].latex || jsonData[0].latex_code) {
                            latexCode = jsonData[0].latex || jsonData[0].latex_code;
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

                    // Check if LaTeX is in a second array element
                    if (jsonData.length > 1 && jsonData[1].output) {
                        latexCode = jsonData[1].output;
                        console.log('Found LaTeX in second array element');
                    }
                }
                else {
                    console.error('Unrecognized response format:', jsonData);
                    throw new Error(`Unexpected response format. Received: ${JSON.stringify(jsonData).substring(0, 200)}...`);
                }

                // Check for LaTeX in the parsed analysis itself
                if (!latexCode && (analysisJson.latex || analysisJson.latex_code)) {
                    latexCode = analysisJson.latex || analysisJson.latex_code;
                }

                // Also check all array elements for latex/latex_code if we have an array
                if (!latexCode && Array.isArray(jsonData)) {
                    for (const item of jsonData) {
                        if (item.output && typeof item.output === 'string' && item.output.includes('\\documentclass')) {
                            latexCode = item.output;
                            console.log('Found LaTeX in array element output field');
                            break;
                        }
                        if (item.latex || item.latex_code) {
                            latexCode = item.latex || item.latex_code;
                            console.log('Found LaTeX in array element');
                            break;
                        }
                    }
                }

                if (!latexCode) {
                    console.warn('No LaTeX code found in response. Analysis will be shown without LaTeX editor.');
                }

                // Transform flat webhook format to expected structure
                const transformedAnalysis = transformAnalysisData(analysisJson);

                // Navigate to analysis page with data
                navigate('/analysis', {
                    state: {
                        analysisData: transformedAnalysis,
                        latexCode: latexCode,
                        hasLatex: !!latexCode
                    }
                });
            }
            // Handle PDF response directly
            else if (ct.includes('pdf')) {
                const ab = await response.arrayBuffer();

                // Try to read filename from Content-Disposition
                const cd = response.headers.get('content-disposition') || '';
                const fnameMatch = /filename\*?=(?:UTF-8'')?["']?([^"';\n]+)["']?/i.exec(cd);
                const fileName = fnameMatch ? decodeURIComponent(fnameMatch[1]) : 'improved-resume.pdf';

                // Pass ArrayBuffer instead of creating blob URL here
                navigate('/pdf', {
                    state: {
                        arrayBuffer: ab,
                        fileName: fileName,
                        mime: 'application/pdf'
                    }
                });
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
