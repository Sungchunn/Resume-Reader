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
                headers: { Accept: 'application/pdf' },
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
            const ab = await response.arrayBuffer();

            if (ct.includes('json') || ct.includes('text')) {
                const textPreview = new TextDecoder().decode(new Uint8Array(ab)).slice(0, 500);
                throw new Error(`Expected a PDF but got ${ct}. Server said: ${textPreview}`);
            }

            const blob = new Blob([ab], { type: ct.includes('pdf') ? ct : 'application/pdf' });
            setPdfBlob(blob);
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

    const handleBack = () => {
        setPdfUrl(null);
        setPdfBlob(null);
        setError(null);
        setNumPages(null);
        setFormData({
            job_title: '',
            job_description: '',
            company_url: '',
            file: null,
        });
    };

    if (pdfUrl) {
        return (
            <div className="App">
                <header className="App-header">
                    <h1>Resume Analysis Report</h1>
                    <button onClick={handleBack} className="back-btn">Back to Form</button>
                </header>
                <main className="pdf-main">
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