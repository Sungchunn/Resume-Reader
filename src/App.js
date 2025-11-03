// src/App.js
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

// Two separate webhooks
const ANALYSIS_WEBHOOK = 'https://shreyahubcredo.app.n8n.cloud/webhook-test/2227bd6f-2f86-470d-a2d0-d8ff386eb788';
const PDF_WEBHOOK = 'https://shreyahubcredo.app.n8n.cloud/webhook-test/20db4528-631d-42c0-858d-930ba828178d';

const App = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [loadingProgress, setLoadingProgress] = useState('');
    const [formData, setFormData] = useState({
        job_title: '',
        job_description: '',
        company_url: '',
        file: null,
    });

    const objectUrlRef = useRef(null);

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
        setLoadingProgress('Preparing your resume...');

        try {
            if (!formData.file) throw new Error('Please attach a PDF file.');

            // Prepare form data for both webhooks (need separate instances)
            const createFormData = () => {
                const fd = new FormData();
                fd.append('job_title', formData.job_title);
                fd.append('job_description', formData.job_description);
                fd.append('company_url', formData.company_url);
                fd.append('file', formData.file);
                return fd;
            };

            console.log('Sending to both webhooks...');
            setLoadingProgress('Analyzing resume and generating improvements...');

            // Call both webhooks in parallel with separate FormData instances
            const [analysisResponse, pdfResponse] = await Promise.all([
                // Analysis webhook - returns JSON
                fetch(ANALYSIS_WEBHOOK, {
                    method: 'POST',
                    body: createFormData(),
                    headers: { Accept: 'application/json' },
                }),
                // PDF webhook - returns PDF binary
                fetch(PDF_WEBHOOK, {
                    method: 'POST',
                    body: createFormData(),
                    headers: { Accept: 'application/pdf' },
                })
            ]);

            console.log('Received responses from both webhooks');

            // Handle Analysis Response
            let analysisJson = null;
            if (!analysisResponse.ok) {
                throw new Error(`Analysis webhook failed (${analysisResponse.status})`);
            }

            setLoadingProgress('Processing analysis results...');
            const analysisContentType = analysisResponse.headers.get('content-type') || '';

            if (analysisContentType.includes('json')) {
                const jsonData = await analysisResponse.json();
                console.log('Received analysis JSON:', jsonData);

                // Parse different response formats
                if (Array.isArray(jsonData) && jsonData.length > 0 && jsonData[0].output) {
                    try {
                        analysisJson = JSON.parse(jsonData[0].output);
                        console.log('Parsed analysis from array format:', analysisJson);
                    } catch (parseError) {
                        console.error('Failed to parse output field:', parseError);
                        throw new Error('Failed to parse analysis JSON');
                    }
                } else if (jsonData && typeof jsonData === 'object' && !Array.isArray(jsonData)) {
                    analysisJson = jsonData;
                    console.log('Using direct object format:', analysisJson);
                } else if (Array.isArray(jsonData) && jsonData.length > 0 && jsonData[0].overall_score !== undefined) {
                    analysisJson = jsonData[0];
                    console.log('Using first array item as analysis:', analysisJson);
                } else {
                    console.error('Unrecognized analysis format:', jsonData);
                    throw new Error('Unexpected analysis response format');
                }
            } else {
                throw new Error(`Expected JSON from analysis webhook, got ${analysisContentType}`);
            }

            // Handle PDF Response
            let pdfUrl = null;
            if (!pdfResponse.ok) {
                console.warn(`PDF webhook failed (${pdfResponse.status}) - continuing without PDF`);
            } else {
                setLoadingProgress('Loading improved resume...');
                const pdfContentType = pdfResponse.headers.get('content-type') || '';

                if (pdfContentType.includes('pdf')) {
                    const pdfArrayBuffer = await pdfResponse.arrayBuffer();
                    const pdfBlob = new Blob([pdfArrayBuffer], { type: 'application/pdf' });
                    pdfUrl = URL.createObjectURL(pdfBlob);
                    objectUrlRef.current = pdfUrl;
                    console.log('Created PDF blob URL:', pdfUrl);
                } else {
                    console.warn(`Expected PDF, got ${pdfContentType}`);
                }
            }

            console.log('Analysis and PDF processing complete');

            // Navigate to analysis page with both data
            navigate('/analysis', {
                state: {
                    analysisData: analysisJson,
                    pdfUrl: pdfUrl,
                    hasPdf: !!pdfUrl
                }
            });

        } catch (err) {
            console.error('Error during submission:', err);
            setError(err?.message || 'Something went wrong!');
            setLoadingProgress('');
        } finally {
            setLoading(false);
        }
    };

    // Cleanup blob URLs on unmount
    useEffect(() => {
        return () => {
            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
            }
        };
    }, []);

    return (
        <div className="App">
            <header className="App-header">
                <h1>Resume Analyzer</h1>
            </header>
            <main>
                <form onSubmit={handleSubmit} className="card" encType="multipart/form-data">
                    {error && <div className="error">{error}</div>}
                    {loading && loadingProgress && (
                        <div className="loading-progress">
                            <div className="loading-spinner"></div>
                            <p>{loadingProgress}</p>
                        </div>
                    )}

                    <div className="form-group">
                        <label htmlFor="job_title">Job Title</label>
                        <input
                            type="text"
                            id="job_title"
                            name="job_title"
                            value={formData.job_title}
                            onChange={handleInputChange}
                            required
                            disabled={loading}
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
                            disabled={loading}
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
                            disabled={loading}
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
                            disabled={loading}
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
