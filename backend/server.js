const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const latex = require('node-latex');
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST'],
    credentials: true
}));

app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', service: 'latex-compiler' });
});

// LaTeX compilation endpoint
app.post('/api/compile-latex', async (req, res) => {
    const { latex: latexCode } = req.body;

    if (!latexCode) {
        return res.status(400).json({ error: 'LaTeX code is required' });
    }

    console.log('Received LaTeX compilation request');

    try {
        // Security: Basic sanitization to prevent malicious code
        const dangerousPatterns = [
            '\\write18',
            '\\input{/etc/',
            '\\include{/etc/',
            '\\openin',
            '\\openout',
            '\\immediate\\write',
            '\\def\\input'
        ];

        for (const pattern of dangerousPatterns) {
            if (latexCode.includes(pattern)) {
                console.error('Dangerous LaTeX pattern detected:', pattern);
                return res.status(400).json({
                    error: 'Potentially dangerous LaTeX code detected',
                    message: 'The LaTeX code contains patterns that could be unsafe'
                });
            }
        }

        // LaTeX compilation options
        const options = {
            inputs: path.join(__dirname, 'latex-inputs'),
            cmd: 'pdflatex',
            passes: 1, // Single pass for speed (most resumes don't need references)
            errorLogs: path.join(__dirname, 'logs')
        };

        // Create a readable stream from the LaTeX code
        const input = Readable.from([latexCode]);

        // Ensure directories exist
        if (!fs.existsSync(options.inputs)) {
            fs.mkdirSync(options.inputs, { recursive: true });
        }
        if (!fs.existsSync(options.errorLogs)) {
            fs.mkdirSync(options.errorLogs, { recursive: true });
        }

        // Compile LaTeX to PDF
        const output = latex(input, options);

        // Set response headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename=resume.pdf');

        // Pipe the PDF output to response
        output.pipe(res);

        output.on('error', (err) => {
            console.error('LaTeX compilation error:', err);
            if (!res.headersSent) {
                res.status(500).json({
                    error: 'LaTeX compilation failed',
                    message: err.message,
                    hint: 'Check your LaTeX syntax. Common issues: missing packages, syntax errors, or invalid commands.'
                });
            }
        });

        output.on('finish', () => {
            console.log('LaTeX compilation successful');
        });

    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`LaTeX Compilation Server running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`Compile endpoint: http://localhost:${PORT}/api/compile-latex`);

    // Check if pdflatex is available
    const { execSync } = require('child_process');
    try {
        execSync('which pdflatex', { stdio: 'pipe' });
        console.log('✓ pdflatex is installed and available');
    } catch (error) {
        console.warn('⚠ WARNING: pdflatex not found in PATH');
        console.warn('Please install LaTeX distribution (TeX Live, MiKTeX, or MacTeX)');
        console.warn('macOS: brew install --cask mactex');
        console.warn('Ubuntu: sudo apt-get install texlive-full');
    }
});

module.exports = app;
