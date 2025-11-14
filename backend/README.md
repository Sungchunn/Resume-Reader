# Resume Analyzer Backend - LaTeX Compilation Service

Node.js/Express backend service that compiles LaTeX code to PDF for the Resume Analyzer application.

## Features

- **LaTeX to PDF Compilation**: Converts LaTeX code to PDF using `pdflatex`
- **Security Scanning**: Blocks dangerous LaTeX commands (shell escape, file access)
- **CORS Enabled**: Allows requests from React frontend
- **Error Handling**: Detailed error messages for debugging
- **Health Check**: `/health` endpoint for monitoring

## Prerequisites

### 1. Install LaTeX Distribution

**macOS:**
```bash
brew install --cask mactex
# Or for minimal install:
brew install --cask basictex
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install texlive-full
# Or minimal install:
sudo apt-get install texlive-latex-base texlive-latex-extra
```

**Windows:**
Download and install [MiKTeX](https://miktex.org/download)

### 2. Verify Installation

```bash
which pdflatex
# Should output: /usr/local/texlive/2024/bin/x86_64-darwin/pdflatex (or similar)

pdflatex --version
# Should show pdfTeX version
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

The server will start on `http://localhost:3001`

## API Endpoints

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "latex-compiler"
}
```

### Compile LaTeX
```http
POST /api/compile-latex
Content-Type: application/json

{
  "latex": "\\documentclass{article}\\begin{document}Hello World\\end{document}"
}
```

**Success Response:**
- Status: 200
- Content-Type: `application/pdf`
- Body: PDF binary data

**Error Response:**
```json
{
  "error": "LaTeX compilation failed",
  "message": "Error message here",
  "hint": "Check your LaTeX syntax..."
}
```

## Testing the Backend

### Using curl
```bash
# Test health endpoint
curl http://localhost:3001/health

# Test LaTeX compilation
curl -X POST http://localhost:3001/api/compile-latex \
  -H "Content-Type: application/json" \
  -d '{"latex":"\\documentclass{article}\\begin{document}Test\\end{document}"}' \
  --output test.pdf

# Check if PDF was created
open test.pdf  # macOS
# or
xdg-open test.pdf  # Linux
```

### Using the Frontend
1. Start the backend: `npm start` (in backend directory)
2. Start the frontend: `npm start` (in root directory)
3. Submit a resume analysis
4. PDF preview should now work automatically!

## Security Features

### Blocked LaTeX Commands
The backend blocks potentially dangerous LaTeX commands:
- `\write18` - Shell escape
- `\input{/etc/...}` - File system reads
- `\include{/etc/...}` - File includes
- `\openin` / `\openout` - File operations
- `\immediate\write` - Immediate writes
- `\def\input` - Input redefinition

### Rate Limiting (TODO)
Consider adding rate limiting in production:
```bash
npm install express-rate-limit
```

## Configuration

### Environment Variables

Create `.env` file:
```env
PORT=3001
CORS_ORIGIN=http://localhost:3000
NODE_ENV=production
```

### CORS Configuration
Edit `server.js` to add more allowed origins:
```javascript
app.use(cors({
    origin: [
        'http://localhost:3000',
        'https://your-production-domain.com'
    ],
    methods: ['GET', 'POST'],
    credentials: true
}));
```

## Troubleshooting

### "pdflatex not found"
**Problem**: LaTeX distribution not installed or not in PATH

**Solution**:
1. Install LaTeX (see Prerequisites)
2. Restart terminal/IDE
3. Verify: `which pdflatex`

### "Permission denied" errors
**Problem**: No write permissions for temp files

**Solution**:
```bash
mkdir -p logs latex-inputs
chmod 755 logs latex-inputs
```

### Frontend can't connect
**Problem**: CORS or backend not running

**Solution**:
1. Check backend is running: `curl http://localhost:3001/health`
2. Check CORS origin matches frontend URL
3. Check no firewall blocking port 3001

### LaTeX compilation errors
**Problem**: Missing LaTeX packages

**Solution**:
Install full LaTeX distribution:
```bash
# macOS
brew install --cask mactex

# Ubuntu
sudo apt-get install texlive-full
```

## Development

### File Structure
```
backend/
├── server.js           # Main Express server
├── package.json        # Dependencies
├── .gitignore         # Git ignore rules
├── logs/              # Compilation logs (auto-created)
├── latex-inputs/      # Temp LaTeX files (auto-created)
└── README.md          # This file
```

### Adding Features

**Add middleware:**
```javascript
// In server.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

**Add logging:**
```javascript
const morgan = require('morgan');
app.use(morgan('combined'));
```

## Deployment

### Using PM2 (Production)
```bash
npm install -g pm2
pm2 start server.js --name latex-backend
pm2 save
pm2 startup
```

### Using Docker
```dockerfile
FROM node:18
RUN apt-get update && apt-get install -y texlive-full
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3001
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t latex-backend .
docker run -p 3001:3001 latex-backend
```

### Environment Variables for Production
```env
PORT=3001
NODE_ENV=production
CORS_ORIGIN=https://your-domain.com
```

## Performance

### Compilation Time
- Simple resume: ~2-3 seconds
- Complex resume with packages: ~5-8 seconds

### Optimization Tips
1. **Use pdflatex once**: Set `passes: 1` for faster compilation (if no references)
2. **Cache compiled PDFs**: Store based on LaTeX hash
3. **Use worker threads**: For multiple concurrent compilations
4. **CDN for packages**: Use precompiled headers

## License

MIT

## Support

For issues:
1. Check backend logs
2. Test with curl
3. Verify pdflatex is working: `pdflatex --version`
4. Check frontend console for errors
