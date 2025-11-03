import React, { useState, useEffect, useRef } from 'react';
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
    const { pdfUrl: passedPdfUrl } = location.state || {};

    const [pdfUrl, setPdfUrl] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [error, setError] = useState(null);
    const objectUrlRef = useRef(null);

    useEffect(() => {
        // Redirect if no PDF URL provided
        if (!passedPdfUrl) {
            navigate('/');
            return;
        }

        // If it's already a blob URL or http URL, use it directly
        if (passedPdfUrl.startsWith('blob:') || passedPdfUrl.startsWith('http')) {
            setPdfUrl(passedPdfUrl);
        } else {
            // Create blob URL from base64 if needed
            try {
                const binaryString = atob(passedPdfUrl);
                const bytes = new Uint8Array(binaryString.length);
                for (let i = 0; i < binaryString.length; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }
                const blob = new Blob([bytes], { type: 'application/pdf' });
                const url = URL.createObjectURL(blob);
                objectUrlRef.current = url;
                setPdfUrl(url);
            } catch (err) {
                setError('Failed to load PDF');
                console.error('PDF loading error:', err);
            }
        }

        return () => {
            if (objectUrlRef.current) {
                URL.revokeObjectURL(objectUrlRef.current);
            }
        };
    }, [passedPdfUrl, navigate]);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    const handleDownload = () => {
        if (pdfUrl) {
            const link = document.createElement('a');
            link.href = pdfUrl;
            link.download = 'improved-resume.pdf';
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
