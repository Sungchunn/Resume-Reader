// src/App.js
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './App.css';

const UPLOAD_WEBHOOK =
    'https://shreyahubcredo.app.n8n.cloud/webhook-test/2227bd6f-2f86-470d-a2d0-d8ff386eb788';

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
                            pdfSource = jsonData[0].pdf_data;
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

                // Check for PDF URL in the parsed analysis itself
                if (!pdfSource && analysisJson.pdf_url) {
                    pdfSource = analysisJson.pdf_url;
                }

                // Handle PDF source - convert to blob URL if needed
                let pdfUrl = null;
                if (pdfSource) {
                    if (pdfSource.startsWith('http')) {
                        // Direct URL - use as is
                        pdfUrl = pdfSource;
                        console.log('Using PDF URL:', pdfUrl);
                    } else {
                        // Assume base64 - convert to blob URL
                        try {
                            const binaryString = atob(pdfSource);
                            const bytes = new Uint8Array(binaryString.length);
                            for (let i = 0; i < binaryString.length; i++) {
                                bytes[i] = binaryString.charCodeAt(i);
                            }
                            const blob = new Blob([bytes], { type: 'application/pdf' });
                            pdfUrl = URL.createObjectURL(blob);
                            objectUrlRef.current = pdfUrl;
                            console.log('Converted base64 PDF to blob URL');
                        } catch (b64Error) {
                            console.error('Failed to decode base64 PDF:', b64Error);
                        }
                    }
                } else {
                    console.warn('No PDF data found in response. Analysis will be shown without PDF.');
                }

                // Navigate to analysis page with data
                navigate('/analysis', {
                    state: {
                        analysisData: analysisJson,
                        pdfUrl: pdfUrl,
                        hasPdf: !!pdfUrl
                    }
                });
            }
            // Handle PDF response directly
            else if (ct.includes('pdf')) {
                const ab = await response.arrayBuffer();
                const blob = new Blob([ab], { type: 'application/pdf' });
                const pdfUrl = URL.createObjectURL(blob);
                objectUrlRef.current = pdfUrl;

                // Navigate directly to PDF page
                navigate('/pdf', {
                    state: { pdfUrl }
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
