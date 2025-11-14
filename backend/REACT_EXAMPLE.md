# React Frontend Integration Example

## Simple Fetch Example

```javascript
async function compileToPDF(latexCode) {
  try {
    const response = await fetch('http://localhost:3001/render', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ latex: latexCode })
    });

    if (!response.ok) {
      // Handle error response
      const errorData = await response.json();
      throw new Error(errorData.details || errorData.error);
    }

    // Get PDF as blob
    const pdfBlob = await response.blob();

    // Create download link or display in iframe
    const url = URL.createObjectURL(pdfBlob);

    // Option 1: Download PDF
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume.pdf';
    a.click();

    // Option 2: Display in iframe
    // document.getElementById('pdf-viewer').src = url;

    // Cleanup
    URL.revokeObjectURL(url);

  } catch (error) {
    console.error('PDF compilation failed:', error);
    alert('Failed to compile PDF: ' + error.message);
  }
}
```

## Complete React Component

```jsx
import React, { useState } from 'react';

function PdfCompiler({ latexSource }) {
  const [isCompiling, setIsCompiling] = useState(false);
  const [error, setError] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);

  const handleCompilePDF = async () => {
    setIsCompiling(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:3001/render', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ latex: latexSource })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error);
      }

      const pdfBlob = await response.blob();

      // Revoke old URL if exists
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }

      // Create new URL
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);

    } catch (err) {
      setError(err.message);
      console.error('Compilation error:', err);
    } finally {
      setIsCompiling(false);
    }
  };

  const handleDownload = () => {
    if (!pdfUrl) return;

    const a = document.createElement('a');
    a.href = pdfUrl;
    a.download = 'document.pdf';
    a.click();
  };

  return (
    <div style={{ padding: '20px' }}>
      <button
        onClick={handleCompilePDF}
        disabled={isCompiling}
        style={{
          padding: '10px 20px',
          backgroundColor: isCompiling ? '#ccc' : '#4f46e5',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: isCompiling ? 'not-allowed' : 'pointer',
          marginRight: '10px'
        }}
      >
        {isCompiling ? 'Compiling...' : 'Compile to PDF'}
      </button>

      {pdfUrl && (
        <button
          onClick={handleDownload}
          style={{
            padding: '10px 20px',
            backgroundColor: '#10b981',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Download PDF
        </button>
      )}

      {error && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#fee2e2',
          color: '#991b1b',
          borderRadius: '6px',
          whiteSpace: 'pre-wrap',
          maxHeight: '300px',
          overflow: 'auto'
        }}>
          <strong>Compilation Error:</strong><br />
          {error}
        </div>
      )}

      {pdfUrl && (
        <div style={{ marginTop: '20px' }}>
          <iframe
            src={pdfUrl}
            style={{
              width: '100%',
              height: '800px',
              border: '1px solid #ddd',
              borderRadius: '8px'
            }}
            title="PDF Preview"
          />
        </div>
      )}
    </div>
  );
}

export default PdfCompiler;
```

## Integration with Your Existing ResultLatex Component

Update your `ResultLatex.jsx` to add PDF export:

```jsx
import React, { useEffect, useState, useRef } from "react";
import { parse, HtmlGenerator } from "latex.js";

export function ResultLatex({ output, styles }) {
    const [source, setSource] = useState(output || "");
    const [renderError, setRenderError] = useState(null);
    const [isCompiling, setIsCompiling] = useState(false);
    const previewRef = useRef(null);

    useEffect(() => {
        setSource(output || "");
    }, [output]);

    // Existing HTML rendering
    const handleRenderLatex = () => {
        setRenderError(null);
        if (!previewRef.current) return;

        try {
            const generator = new HtmlGenerator({ hyphenate: false });
            const doc = parse(source, { generator });
            const fragment = doc.domFragment();

            previewRef.current.innerHTML = "";
            previewRef.current.appendChild(fragment);
        } catch (error) {
            setRenderError(error.message || "Failed to render LaTeX");
            console.error("LaTeX rendering error:", error);
        }
    };

    // NEW: PDF compilation
    const handleExportPDF = async () => {
        setIsCompiling(true);
        setRenderError(null);

        try {
            const response = await fetch('http://localhost:3001/render', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ latex: source })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.details || errorData.error);
            }

            const pdfBlob = await response.blob();
            const url = URL.createObjectURL(pdfBlob);

            const a = document.createElement('a');
            a.href = url;
            a.download = 'resume.pdf';
            a.click();

            URL.revokeObjectURL(url);

        } catch (error) {
            setRenderError(error.message || "Failed to compile PDF");
            console.error("PDF compilation error:", error);
        } finally {
            setIsCompiling(false);
        }
    };

    return (
        <div style={styles.latexInner}>
            <div style={styles.latexHeaderRow}>
                <div>
                    <h3 style={styles.sectionTitle}>LaTeX Resume Editor</h3>
                    <p style={styles.sectionNote}>
                        Left: editable LaTeX generated by the AI agent. Right: a visual
                        preview styled like a PDF page.
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={handleRenderLatex}
                        style={{
                            padding: "10px 20px",
                            backgroundColor: "#4f46e5",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontWeight: "600",
                            fontSize: "14px"
                        }}
                    >
                        Render LaTeX
                    </button>
                    <button
                        onClick={handleExportPDF}
                        disabled={isCompiling}
                        style={{
                            padding: "10px 20px",
                            backgroundColor: isCompiling ? "#9ca3af" : "#10b981",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: isCompiling ? "not-allowed" : "pointer",
                            fontWeight: "600",
                            fontSize: "14px"
                        }}
                    >
                        {isCompiling ? "Compiling..." : "Export PDF"}
                    </button>
                </div>
            </div>

            {/* Rest of your component remains the same */}
            {/* ... */}
        </div>
    );
}
```

## Usage in Your App

1. **Start the backend:**
   ```bash
   cd backend
   npm install
   npm start
   ```

2. **Use in React:**
   ```jsx
   import { ResultLatex } from './components/ResultLatex';

   function App() {
     const latexCode = `\\documentclass{article}
   \\begin{document}
   Hello World
   \\end{document}`;

     return <ResultLatex output={latexCode} styles={yourStyles} />;
   }
   ```

3. **Click "Export PDF"** to download the compiled PDF!

## CORS Configuration

If deploying to production, update CORS in `server.js`:

```javascript
app.use(cors({
  origin: ['http://localhost:3000', 'https://yourdomain.com'],
  methods: ['POST', 'GET'],
  credentials: true
}));
```
