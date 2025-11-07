// LaTeX compilation utility using LaTeX.Online service

/**
 * Compile LaTeX code to PDF using LaTeX.Online API
 * @param {string} latexCode - The LaTeX document code
 * @returns {Promise<Blob>} - PDF blob
 */
export const compileLatexToPdf = async (latexCode) => {
    try {
        // Create a FormData object with the LaTeX file
        const formData = new FormData();
        const latexBlob = new Blob([latexCode], { type: 'text/plain' });
        formData.append('file', latexBlob, 'resume.tex');

        // Use LaTeX.Online compilation service
        const response = await fetch('https://latexonline.cc/compile', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`LaTeX compilation failed: ${response.status} ${response.statusText}`);
        }

        // Return the PDF blob
        return await response.blob();
    } catch (error) {
        console.error('LaTeX compilation error:', error);
        throw error;
    }
};

/**
 * Alternative: Compile using latexonline.cc with direct URL
 * @param {string} latexCode - The LaTeX document code
 * @returns {Promise<Blob>} - PDF blob
 */
export const compileLatexToPdfAlt = async (latexCode) => {
    try {
        // Encode LaTeX to base64 for URL
        const encoder = new TextEncoder();
        const data = encoder.encode(latexCode);
        const base64 = btoa(String.fromCharCode(...data));

        const response = await fetch('https://latexonline.cc/compile', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: `text=${encodeURIComponent(latexCode)}&force=true`,
        });

        if (!response.ok) {
            throw new Error(`LaTeX compilation failed: ${response.status}`);
        }

        return await response.blob();
    } catch (error) {
        console.error('LaTeX compilation error:', error);
        throw error;
    }
};
