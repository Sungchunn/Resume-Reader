# LaTeX Compilation Setup Guide

This guide explains how to enable real-time PDF preview by setting up LaTeX compilation in your n8n workflow.

## Why PDF Preview Unavailable?

External LaTeX compilation APIs (like LaTeX.Online) often have CORS restrictions that prevent browser-based compilation. To enable real-time PDF preview, you need to set up a LaTeX compilation endpoint in your n8n workflow.

## Option 1: Setup n8n LaTeX Compilation (Recommended)

### Prerequisites
- n8n instance with access to execute commands or Docker
- LaTeX distribution (TeX Live or similar)

### n8n Workflow Setup

1. **Create New Webhook Node**
   - Add a new Webhook node to your n8n workflow
   - Set HTTP Method: `POST`
   - Set Path: `/webhook-test/latex-compile`
   - Response Mode: `When Last Node Finishes`

2. **Add Execute Command Node** (if LaTeX installed on server)
   ```
   Node: Execute Command
   Command: bash

   Script:
   #!/bin/bash
   cd /tmp
   echo "$LATEX_CODE" > resume.tex
   pdflatex -interaction=nonstopmode resume.tex
   cat resume.pdf | base64
   ```

   Input from webhook: `{{ $json.latex }}`

3. **Alternative: Use Docker Node**
   ```
   Node: Docker
   Image: texlive/texlive:latest
   Command: pdflatex -interaction=nonstopmode /tmp/resume.tex

   Mount: LaTeX code to /tmp/resume.tex
   Output: /tmp/resume.pdf
   ```

4. **Add Function Node to Return PDF**
   ```javascript
   // Convert PDF to base64 or return as binary
   const pdfBuffer = $input.item.binary.data;
   return {
     json: {},
     binary: {
       data: pdfBuffer
     }
   };
   ```

5. **Configure Webhook Response**
   - Set Response Data: `Binary File Data`
   - Set Content-Type: `application/pdf`

### Testing the Endpoint

```bash
curl -X POST \
  https://shreyahubcredo.app.n8n.cloud/webhook-test/latex-compile \
  -H "Content-Type: application/json" \
  -d '{
    "latex": "\\documentclass{article}\\begin{document}Hello World\\end{document}"
  }' \
  --output test.pdf
```

## Option 2: Use Overleaf (Manual Export)

If you don't want to set up compilation:

1. Click **"Download .tex"** button in the app
2. Go to [Overleaf.com](https://www.overleaf.com)
3. Create new project → Upload LaTeX file
4. Compile and download PDF

### Overleaf Advantages
- No setup required
- Professional LaTeX environment
- Collaborative editing
- Version control

## Option 3: Local Compilation

### Install LaTeX Locally

**macOS:**
```bash
brew install --cask mactex
```

**Ubuntu/Debian:**
```bash
sudo apt-get install texlive-full
```

**Windows:**
Download and install [MiKTeX](https://miktex.org/download)

### Compile Resume

1. Download .tex file from the app
2. Run:
```bash
pdflatex resume.tex
```
3. Output: `resume.pdf`

### Recommended LaTeX IDEs
- TeXworks (included with MiKTeX and MacTeX)
- TeXstudio (cross-platform)
- VS Code with LaTeX Workshop extension

## Option 4: Use Cloud LaTeX Services

### LaTeX.Online (via CORS Proxy)
```bash
# You can set up a CORS proxy server
# Example: cors-anywhere, or custom nginx proxy
```

### Papeeria
- Online LaTeX editor
- Free tier available
- Upload .tex file and compile

### ShareLaTeX (Community Edition)
- Self-hosted alternative to Overleaf
- Full LaTeX environment

## Updating Frontend for n8n Endpoint

The frontend already checks for the n8n endpoint at:
```
https://shreyahubcredo.app.n8n.cloud/webhook-test/latex-compile
```

If you set up the endpoint, PDF preview will work automatically!

### Webhook Request Format
```json
{
  "latex": "\\documentclass{article}\\n\\begin{document}\\nHello\\n\\end{document}"
}
```

### Expected Response
- Content-Type: `application/pdf`
- Body: Binary PDF data

## Troubleshooting

### "Preview Unavailable" Message
**Cause**: n8n LaTeX endpoint not set up or CORS errors from external APIs

**Solutions**:
1. Set up n8n endpoint (see Option 1)
2. Use Overleaf for manual compilation
3. Compile locally with pdflatex

### LaTeX Compilation Errors in n8n
**Check**:
1. LaTeX distribution installed: `which pdflatex`
2. Required packages available
3. Workflow has proper file permissions
4. Check n8n execution logs for errors

### PDF Not Rendering in Browser
**Check**:
1. Content-Type header is `application/pdf`
2. Response is binary (not base64 string)
3. No CORS errors in browser console

### Large LaTeX Files Timeout
**Solutions**:
1. Increase n8n execution timeout
2. Optimize LaTeX code (remove unnecessary packages)
3. Use precompiled headers

## Security Considerations

### Input Sanitization
LaTeX code can execute shell commands. Sanitize input:

```javascript
// In n8n Function node
const latex = $json.latex;

// Remove dangerous commands
const dangerous = [
  '\\write18',
  '\\input{/etc/',
  '\\include{/etc/',
  '\\openin',
  '\\openout'
];

for (const cmd of dangerous) {
  if (latex.includes(cmd)) {
    throw new Error('Dangerous LaTeX command detected');
  }
}

return { latex };
```

### File System Access
- Run pdflatex in sandboxed environment
- Use Docker with limited permissions
- Don't allow arbitrary file reads

### Resource Limits
- Set compilation timeout (30 seconds)
- Limit memory usage
- Rate limit requests

## Performance Optimization

### Caching
Cache compiled PDFs based on LaTeX code hash:

```javascript
// In n8n Function node
const crypto = require('crypto');
const hash = crypto.createHash('md5').update(latex).digest('hex');

// Check cache first
// If miss, compile and store
```

### Async Compilation
For large documents:
1. Return immediately with job ID
2. Poll for compilation status
3. Download when ready

## Additional Resources

- [Overleaf Documentation](https://www.overleaf.com/learn)
- [LaTeX Wikibook](https://en.wikibooks.org/wiki/LaTeX)
- [TeX Live Installation](https://www.tug.org/texlive/)
- [n8n Documentation](https://docs.n8n.io/)
