// LaTeX compilation utility

/**
 * Compile LaTeX code to PDF using local backend server
 * @param {string} latexCode - The LaTeX document code
 * @returns {Promise<Blob>} - PDF blob
 */
export const compileLatexToPdf = async (latexCode) => {
    try {
        // Option 1: Try local backend server (preferred)
        const localBackendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';

        try {
            const response = await fetch(`${localBackendUrl}/api/compile-latex`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ latex: latexCode })
            });

            if (response.ok) {
                const contentType = response.headers.get('content-type');
                if (contentType && contentType.includes('pdf')) {
                    console.log('✓ LaTeX compiled successfully via local backend');
                    return await response.blob();
                }
            }

            // If backend returned an error, try to get the error message
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error('Backend compilation error:', errorData);
                throw new Error(errorData.message || 'Compilation failed');
            }
        } catch (localError) {
            console.log('Local backend not available:', localError.message);

            // Option 2: Try n8n webhook for LaTeX compilation
            const n8nCompileUrl = 'https://shreyahubcredo.app.n8n.cloud/webhook-test/latex-compile';

            try {
                const response = await fetch(n8nCompileUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ latex: latexCode })
                });

                if (response.ok) {
                    const contentType = response.headers.get('content-type');
                    if (contentType && contentType.includes('pdf')) {
                        console.log('✓ LaTeX compiled successfully via n8n webhook');
                        return await response.blob();
                    }
                }
            } catch (n8nError) {
                console.log('n8n compilation not available, trying alternative...');
            }

            // Option 3: Try external LaTeX.Online service
            const formData = new FormData();
            const latexBlob = new Blob([latexCode], { type: 'text/plain' });
            formData.append('file', latexBlob, 'resume.tex');

            try {
                const response = await fetch('https://latexonline.cc/compile?target=resume.tex', {
                    method: 'POST',
                    body: formData,
                });

                if (response.ok) {
                    console.log('✓ LaTeX compiled successfully via LaTeX.Online');
                    return await response.blob();
                }
            } catch (externalError) {
                console.log('External LaTeX.Online not available');
            }

            // If all methods fail, throw descriptive error
            throw new Error('CORS_ERROR');
        }

    } catch (error) {
        console.error('LaTeX compilation error:', error);

        if (error.message === 'CORS_ERROR' || error.message.includes('fetch') || error.message.includes('CORS') || error.message.includes('Failed to fetch')) {
            throw new Error('PREVIEW_UNAVAILABLE');
        }

        throw error;
    }
};
