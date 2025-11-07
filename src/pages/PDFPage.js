import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Document, Page, pdfjs } from 'react-pdf';
import '../App.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).toString();

const PDFPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state || {};

    const [pdfUrl, setPdfUrl] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [error, setError] = useState(null);
    const [fileName, setFileName] = useState('improved-resume.pdf');

    useEffect(() => {
        // Redirect if no PDF data provided
        if (!state || (!state.arrayBuffer && !state.pdfUrl)) {
            navigate('/');
            return;
        }

        let url = null;

        // Prefer an already-provided URL (for backwards compatibility)
        if (state.pdfUrl && (state.pdfUrl.startsWith('blob:') || state.pdfUrl.startsWith('http'))) {
            url = state.pdfUrl;
            setPdfUrl(url);
            if (state.fileName) setFileName(state.fileName);
        }
        // Create blob URL from ArrayBuffer
        else if (state.arrayBuffer) {
            try {
                const blob = new Blob([state.arrayBuffer], {
                    type: state.mime || 'application/pdf'
                });
                url = URL.createObjectURL(blob);
                setPdfUrl(url);
                if (state.fileName) setFileName(state.fileName);
            } catch (err) {
                setError('Failed to load PDF from ArrayBuffer');
                console.error('PDF loading error:', err);
            }
        }
        // Handle base64 data (if still used)
        else if (state.pdfUrl) {
            try {
                const binaryString = atob(state.pdfUrl);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                const blob = new Blob([bytes], { type: 'application/pdf' });
                url = URL.createObjectURL(blob);
                setPdfUrl(url);
            } catch (err) {
                setError('Failed to load PDF from base64');
                console.error('PDF loading error:', err);
            }
        }

        // Cleanup: revoke blob URL when component unmounts
        return () => {
            if (url && url.startsWith('blob:')) {
                URL.revokeObjectURL(url);
            }
        };
    }, [state, navigate]);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    const handleDownload = () => {
        if (pdfUrl) {
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = fileName;
            link.click();
        }
    };

    if (!pdfUrl && !error) {
        return (
            <div className="App">
                <header className="App-header">
                    <h1>Loading PDF...</h1>
                </header>
            </div>
        );
    }

    return (
        <div className="App pdf-page">
            <header className="App-header">
                <h1>Improved Resume</h1>
                <div className="header-actions">
                    <Link to="/analysis" state={location.state} className="back-btn">
                        Back to Analysis
                    </Link>
                    <button onClick={handleDownload} className="download-btn">
                        Download PDF
                    </button>
                </div>
            </header>
            <main className="pdf-container">
                {error && <div className="error">{error}</div>}
                {pdfUrl && (
                    <Document
                        file={pdfUrl}
                        onLoadSuccess={onDocumentLoadSuccess}
                        onLoadError={(err) => setError(`PDF load error: ${String(err?.message || err)}`)}
                        className="pdf-document"
                    >
                        {Array.from({ length: numPages || 0 }).map((_, i) => (
                            <Page key={`page_${i + 1}`} pageNumber={i + 1} className="pdf-page-item" />
                        ))}
                    </Document>
                )}
            </main>
        </div>
    );
};

export default PDFPage;
