// LaTeX compilation utility

/**
 * Compile LaTeX code to PDF using n8n webhook backend
 * Since external LaTeX APIs may have CORS issues, we'll use the n8n backend
 * @param {string} latexCode - The LaTeX document code
 * @returns {Promise<Blob>} - PDF blob
 */
export const compileLatexToPdf = async (latexCode) => {
    try {
        // Option 1: Try using the n8n webhook for LaTeX compilation
        // You'll need to add a LaTeX compilation endpoint to your n8n workflow
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
                    return await response.blob();
                }
            }
        } catch (n8nError) {
            console.log('n8n compilation not available, trying alternative...');
        }

        // Option 2: Use a CORS proxy with LaTeX.Online
        const formData = new FormData();
        const latexBlob = new Blob([latexCode], { type: 'text/plain' });
        formData.append('file', latexBlob, 'resume.tex');

        // Try direct compilation
        const response = await fetch('https://latexonline.cc/compile?target=resume.tex', {
            method: 'POST',
            body: formData,
        });

        if (response.ok) {
            return await response.blob();
        }

        // If all methods fail, throw descriptive error
        throw new Error('CORS_ERROR');

    } catch (error) {
        console.error('LaTeX compilation error:', error);

        if (error.message === 'CORS_ERROR' || error.message.includes('fetch') || error.message.includes('CORS')) {
            throw new Error('PREVIEW_UNAVAILABLE');
        }

        throw error;
    }
};
