# LaTeX to PDF Backend Service

A production-ready Node.js service that compiles LaTeX documents to PDF using tectonic or pdflatex.

## Features

- ✅ Real LaTeX compilation (tectonic or pdflatex)
- ✅ Security: Input sanitization, no shell injection
- ✅ Automatic temp file cleanup
- ✅ Error handling with compilation logs
- ✅ CORS enabled for frontend integration
- ✅ Health check endpoint

## Prerequisites

### Install a LaTeX Compiler

**Option 1: Tectonic (Recommended - Lightweight)**
```bash
# macOS
brew install tectonic

# Ubuntu/Debian
sudo snap install tectonic

# Windows (via Chocolatey)
choco install tectonic
```

**Option 2: pdflatex (Full TeX Distribution)**
```bash
# macOS
brew install mactex-no-gui

# Ubuntu/Debian
sudo apt-get install texlive-latex-base texlive-fonts-recommended

# Windows
# Download MiKTeX from https://miktex.org/
```

## Installation

```bash
cd backend
npm install
```

## Running the Server

### Development Mode (with auto-reload)
```bash
npm run dev
```

### Production Mode
```bash
npm start
```

The server runs on **http://localhost:3001** by default.

## API Endpoints

### POST /render

Compiles LaTeX to PDF.

**Request:**
```json
{
  "latex": "\\documentclass{article}\n\\begin{document}\nHello World\n\\end{document}"
}
```

**Response (Success):**
- Content-Type: `application/pdf`
- Binary PDF stream

**Response (Error):**
```json
{
  "error": "LaTeX compilation failed",
  "details": "! Undefined control sequence...",
  "timestamp": "2025-11-14T08:30:00.000Z"
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "compiler": "tectonic",
  "timestamp": "2025-11-14T08:30:00.000Z"
}
```

## Security Features

1. **Input Sanitization**: Blocks dangerous LaTeX commands (`\write18`, `\input{|...}`, etc.)
2. **Size Limits**: Maximum 1MB LaTeX input, 10MB buffer
3. **Timeouts**: 30-second compilation timeout
4. **No Shell Escape**: pdflatex runs with `-no-shell-escape`
5. **Isolated Temp Files**: Each job runs in a unique temporary directory
6. **Automatic Cleanup**: Old temp files deleted after 1 hour

## Environment Variables

```bash
PORT=3001  # Server port (default: 3001)
```

## Testing

```bash
# Test health check
curl http://localhost:3001/health

# Test PDF generation
curl -X POST http://localhost:3001/render \
  -H "Content-Type: application/json" \
  -d '{"latex": "\\documentclass{article}\\begin{document}Hello World\\end{document}"}' \
  --output test.pdf
```

## Production Deployment

1. **Use a process manager:**
   ```bash
   npm install -g pm2
   pm2 start server.js --name latex-service
   ```

2. **Set up reverse proxy (Nginx):**
   ```nginx
   location /api/render {
       proxy_pass http://localhost:3001/render;
       proxy_set_header Host $host;
       client_max_body_size 10M;
   }
   ```

3. **Environment variables:**
   ```bash
   export NODE_ENV=production
   export PORT=3001
   ```

## Troubleshooting

**"No LaTeX compiler found"**
- Install tectonic or pdflatex (see Prerequisites)
- Verify installation: `tectonic --version` or `pdflatex --version`

**Compilation timeout**
- Check LaTeX document complexity
- Increase timeout in `server.js` (line 98)

**Permission errors**
- Ensure temp directory is writable: `chmod 755 backend/tmp`

## License

MIT
