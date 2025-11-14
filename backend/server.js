const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const { promisify } = require('util');

const execAsync = promisify(exec);
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Temp directory for LaTeX compilation
const TEMP_DIR = path.join(__dirname, 'tmp');

// Ensure temp directory exists
async function ensureTempDir() {
  try {
    await fs.mkdir(TEMP_DIR, { recursive: true });
  } catch (err) {
    console.error('Failed to create temp directory:', err);
  }
}

// Check which LaTeX compiler is available
async function detectCompiler() {
  try {
    await execAsync('tectonic --version');
    return 'tectonic';
  } catch {
    try {
      await execAsync('pdflatex --version');
      return 'pdflatex';
    } catch {
      return null;
    }
  }
}

// Sanitize LaTeX input to prevent command injection
function sanitizeLatex(latex) {
  // Basic validation
  if (typeof latex !== 'string') {
    throw new Error('LaTeX input must be a string');
  }

  if (latex.length > 1000000) { // 1MB limit
    throw new Error('LaTeX input too large (max 1MB)');
  }

  // Check for dangerous patterns
  const dangerousPatterns = [
    /\\write18/gi,
    /\\input\{[^}]*\|/gi,
    /\\immediate\\write/gi,
    /\\openout/gi,
    /\\openin/gi
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(latex)) {
      throw new Error('LaTeX contains potentially dangerous commands');
    }
  }

  return latex;
}

// Compile LaTeX to PDF
async function compileLatex(latexContent, compiler) {
  const jobId = crypto.randomUUID();
  const workDir = path.join(TEMP_DIR, jobId);
  const texFile = path.join(workDir, 'document.tex');
  const pdfFile = path.join(workDir, 'document.pdf');
  const logFile = path.join(workDir, 'document.log');

  try {
    // Create job directory
    await fs.mkdir(workDir, { recursive: true });

    // Write LaTeX content to file
    await fs.writeFile(texFile, latexContent, 'utf8');

    // Compile based on available compiler
    let compileCommand;
    if (compiler === 'tectonic') {
      compileCommand = `cd "${workDir}" && tectonic document.tex`;
    } else {
      // pdflatex with security restrictions
      compileCommand = `cd "${workDir}" && pdflatex -interaction=nonstopmode -halt-on-error -no-shell-escape document.tex`;
    }

    // Execute compilation (timeout: 30 seconds)
    const { stdout, stderr } = await execAsync(compileCommand, {
      timeout: 30000,
      maxBuffer: 10 * 1024 * 1024 // 10MB buffer
    });

    // Check if PDF was generated
    try {
      await fs.access(pdfFile);
    } catch {
      // PDF not generated, read log file for errors
      let logContent = '';
      try {
        logContent = await fs.readFile(logFile, 'utf8');
      } catch {
        logContent = stderr || stdout || 'No log available';
      }
      throw new Error(`Compilation failed:\n${logContent}`);
    }

    // Read the generated PDF
    const pdfBuffer = await fs.readFile(pdfFile);

    // Cleanup
    await cleanupDirectory(workDir);

    return pdfBuffer;

  } catch (error) {
    // Cleanup on error
    await cleanupDirectory(workDir);
    throw error;
  }
}

// Cleanup temp directory
async function cleanupDirectory(dir) {
  try {
    await fs.rm(dir, { recursive: true, force: true });
  } catch (err) {
    console.error('Cleanup failed:', err);
  }
}

// Health check endpoint
app.get('/health', async (req, res) => {
  const compiler = await detectCompiler();
  res.json({
    status: 'ok',
    compiler: compiler || 'none',
    timestamp: new Date().toISOString()
  });
});

// Main render endpoint
app.post('/render', async (req, res) => {
  try {
    const { latex } = req.body;

    if (!latex) {
      return res.status(400).json({ error: 'Missing "latex" field in request body' });
    }

    // Detect available compiler
    const compiler = await detectCompiler();
    if (!compiler) {
      return res.status(500).json({
        error: 'No LaTeX compiler found. Please install tectonic or pdflatex.'
      });
    }

    // Sanitize input
    let sanitizedLatex;
    try {
      sanitizedLatex = sanitizeLatex(latex);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }

    // Compile LaTeX to PDF
    const pdfBuffer = await compileLatex(sanitizedLatex, compiler);

    // Return PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="document.pdf"');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Render error:', error);

    // Extract meaningful error message
    let errorMessage = error.message || 'Unknown compilation error';

    // Truncate very long error messages
    if (errorMessage.length > 5000) {
      errorMessage = errorMessage.substring(0, 5000) + '\n... (truncated)';
    }

    res.status(500).json({
      error: 'LaTeX compilation failed',
      details: errorMessage,
      timestamp: new Date().toISOString()
    });
  }
});

// Periodic cleanup of old temp files (every hour)
setInterval(async () => {
  try {
    const files = await fs.readdir(TEMP_DIR);
    const now = Date.now();

    for (const file of files) {
      const filePath = path.join(TEMP_DIR, file);
      try {
        const stats = await fs.stat(filePath);
        // Delete files older than 1 hour
        if (now - stats.mtimeMs > 3600000) {
          await fs.rm(filePath, { recursive: true, force: true });
        }
      } catch (err) {
        // Ignore errors for individual files
      }
    }
  } catch (err) {
    console.error('Cleanup interval error:', err);
  }
}, 3600000); // Run every hour

// Start server
async function startServer() {
  await ensureTempDir();

  const compiler = await detectCompiler();
  console.log(`LaTeX compiler detected: ${compiler || 'NONE (install tectonic or pdflatex)'}`);

  app.listen(PORT, () => {
    console.log(`LaTeX PDF service running on http://localhost:${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
  });
}

startServer();
