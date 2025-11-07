import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import '../App.css';

const LatexEditor = ({ initialCode }) => {
    const [latexCode, setLatexCode] = useState(initialCode || '');
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
    };

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
                </div>
            </div>
            <div className="editor-wrapper">
                <Editor
                    height="calc(100vh - 200px)"
                    defaultLanguage="latex"
                    theme={theme}
                    value={latexCode}
                    onChange={handleEditorChange}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        wordWrap: 'on',
                        lineNumbers: 'on',
                        scrollBeyondLastLine: false,
                        automaticLayout: true,
                        tabSize: 2,
                    }}
                />
            </div>
        </div>
    );
};

export default LatexEditor;
