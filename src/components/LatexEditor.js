import React, { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Document, Page, pdfjs } from 'react-pdf';
import { compileLatexToPdf } from '../utils/latexCompiler';
import '../App.css';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
).toString();

const LatexEditor = ({ initialCode }) => {
    const [latexCode, setLatexCode] = useState(initialCode || '');
    const [pdfUrl, setPdfUrl] = useState(null);
    const [numPages, setNumPages] = useState(null);
    const [compiling, setCompiling] = useState(false);
    const [compileError, setCompileError] = useState(null);
    const [pdfBlob, setPdfBlob] = useState(null);
    const [theme, setTheme] = useState(
        window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'vs-dark'
            : 'vs-light'
    );

    // Listen for system theme changes
    React.useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e) => {
            setTheme(e.matches ? 'vs-dark' : 'vs-light');
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const handleEditorChange = (value) => {
        setLatexCode(value || '');
        // Auto-compile will be triggered by useEffect
    };

    // Debounce auto-compile when code changes
    useEffect(() => {
        if (!latexCode) return;

        // Debounce: wait 2 seconds after user stops typing
        const timer = setTimeout(() => {
            handleCompile();
        }, 2000);

        return () => clearTimeout(timer);
    }, [latexCode]);

    const handleDownload = () => {
        const blob = new Blob([latexCode], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'resume.tex';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(latexCode).then(() => {
            alert('LaTeX code copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy:', err);
            alert('Failed to copy to clipboard');
        });
    };

    const handleCompile = async () => {
        setCompiling(true);
        setCompileError(null);

        try {
            const blob = await compileLatexToPdf(latexCode);
            setPdfBlob(blob);

            // Revoke old URL if exists
            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
            }

            // Create new blob URL
            const url = URL.createObjectURL(blob);
            setPdfUrl(url);
        } catch (error) {
            console.error('Compilation error:', error);
            setCompileError(error.message || 'Failed to compile LaTeX. Please check your code for errors.');
        } finally {
            setCompiling(false);
        }
    };

    const handleDownloadPdf = () => {
        if (pdfBlob) {
            const url = URL.createObjectURL(pdfBlob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'resume.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    };

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    // Auto-compile on initial load
    useEffect(() => {
        if (initialCode && !pdfUrl) {
            handleCompile();
        }
    }, [initialCode]);

    // Cleanup blob URL on unmount
    useEffect(() => {
        return () => {
            if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
            }
        };
    }, [pdfUrl]);

    return (
        <div className="latex-editor-container">
            <div className="editor-header">
                <h3>Suggested Resume (LaTeX)</h3>
                <div className="editor-actions">
                    <button onClick={handleCopy} className="copy-btn">
                        Copy Code
                    </button>
                    <button onClick={handleDownload} className="download-btn">
                        Download .tex
                    </button>
                    {pdfBlob && (
                        <button onClick={handleDownloadPdf} className="export-pdf-btn">
                            Export to PDF
                        </button>
                    )}
                </div>
            </div>
            <div className="editor-content-split">
                <div className="editor-wrapper">
                    <Editor
                        height="400px"
                        defaultLanguage="latex"
                        theme={theme}
                        value={latexCode}
                        onChange={handleEditorChange}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 13,
                            wordWrap: 'on',
                            lineNumbers: 'on',
                            scrollBeyondLastLine: false,
                            automaticLayout: true,
                            tabSize: 2,
                        }}
                    />
                </div>
                <div className="pdf-preview-section">
                    <div className="pdf-preview-header">
                        <h4>Real-time Preview</h4>
                        {compiling && <span className="compiling-indicator">Rendering...</span>}
                    </div>
                    {compileError && (
                        <div className="compile-error">
                            <strong>Compilation Error:</strong> {compileError}
                            <br /><small>Please check your LaTeX syntax and try again.</small>
                        </div>
                    )}
                    {pdfUrl && !compiling && (
                        <div className="pdf-preview-container">
                            <Document
                                file={pdfUrl}
                                onLoadSuccess={onDocumentLoadSuccess}
                                onLoadError={(err) => setCompileError(`PDF load error: ${err.message}`)}
                                className="pdf-document-preview"
                            >
                                {Array.from({ length: numPages || 0 }).map((_, i) => (
                                    <Page
                                        key={`page_${i + 1}`}
                                        pageNumber={i + 1}
                                        width={Math.min(window.innerWidth * 0.4, 800)}
                                        className="pdf-page-preview"
                                    />
                                ))}
                            </Document>
                        </div>
                    )}
                    {!pdfUrl && !compiling && !compileError && (
                        <div className="pdf-preview-placeholder">
                            <p>Loading preview... Your resume will appear here shortly.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LatexEditor;
