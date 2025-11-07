# Resume Analyzer with LaTeX Editor

React-based resume analysis tool that provides scoring, feedback, and an editable LaTeX resume template.

## Quick Start

### Frontend Only (without PDF preview)
```bash
npm install
npm start
```

Visit `http://localhost:3000`

### Full Setup (with PDF preview)
```bash
# Terminal 1 - Start backend
cd backend
npm install
npm start

# Terminal 2 - Start frontend
npm install
npm start
```

Backend runs on `http://localhost:3001`, Frontend on `http://localhost:3000`

## Features

- **Interactive LaTeX Editor**: Edit the suggested resume directly in the browser
- **Real-time PDF Preview**: See your resume as you edit (requires setup - see below)
- **Dark Mode Support**: Automatic theme switching based on system preferences
- **Download & Copy**: Export LaTeX code as .tex file or copy to clipboard
- **Export to PDF**: Download compiled PDF with one click (when preview enabled)
- **Comprehensive Feedback**: Overall score, category scores, strengths, improvement areas, keywords, ATS tips
- **Multi-page routing** with React Router
- **Detailed analysis** with scores, insights, and recommendations
- **PDF viewer** for improved resumes
- **Fully responsive** design

## How It Works

### 1. Submit Resume (Home Page - `/`)
- User enters **Job Title** they're applying for
- User enters **Company Website URL** (optional) - provides AI context on company culture and pain points
- User pastes **Job Description**
- User uploads their **Resume** (PDF)
- Frontend sends all data to n8n webhook

### 2. View Analysis (Analysis Page - `/analysis`)
- n8n processes and returns:
  - Resume analysis with scoring and feedback
  - Suggested resume improvements in LaTeX format
- Frontend displays split view:
  - **Left Panel**: Analysis scores, strengths, improvement areas, keywords, tips
  - **Right Panel**: Editable LaTeX code with download capability
- Overall score with color coding
- Category-by-category breakdown
- Strengths and improvement areas
- Keyword recommendations
- Tailored bullet points
- ATS optimization tips
- Learning plan (quick wins & long-term)
- Company insights with research sources
- Executive summary

### 3. View Improved Resume (PDF Page - `/pdf`)
- Full PDF viewer
- Download improved resume
- Navigate back to analysis

## Dual Webhook Architecture

The app uses **two separate webhooks** called in parallel for optimal performance:

### 1. Analysis Webhook (Returns JSON)
```
POST https://shreyahubcredo.app.n8n.cloud/webhook-test/2227bd6f-2f86-470d-a2d0-d8ff386eb788

FormData:
- file: [binary PDF]
- job_title: "Senior Software Engineer"
- company_url: "https://www.company.com" (optional)
- job_description: "We are looking for..."
```

**Expected Response:**
```json
{
  "overall_score": 85,
  "category_scores": {
    "keyword_matching": 80,
    "formatting": 90,
    "content_quality": 85
  },
  "strengths": ["Strong technical skills", "Clear experience"],
  "improvement_areas": ["Add more metrics", "Include keywords"],
  "keyword_recommendations": ["React", "Node.js", "AWS"],
  "latex": "\documentclass{article}...",
  "summary": "Overall assessment..."
}
```

### 2. PDF Webhook (Returns PDF Binary)
```
POST https://shreyahubcredo.app.n8n.cloud/webhook-test/20db4528-631d-42c0-858d-930ba828178d

FormData: (same as analysis webhook)
```

**Expected Response:** Binary PDF file

### Why Two Webhooks?

✅ **Faster** - Parallel execution reduces wait time
✅ **Resilient** - Analysis works even if PDF generation fails
✅ **Scalable** - Each webhook can be optimized independently
✅ **Clean** - Separation of concerns (analysis vs generation)

## Configuration

### Change Webhook URLs

Edit lines 7-8 in `src/App.js`:
```javascript
const ANALYSIS_WEBHOOK = "YOUR_ANALYSIS_WEBHOOK_URL";
const PDF_WEBHOOK = "YOUR_PDF_WEBHOOK_URL";
```

## PDF Preview Setup

The app includes a **local backend server** for real-time PDF compilation!

**Option 1: Use Local Backend** (Recommended - Already Included!)
1. Install LaTeX distribution:
   - **macOS**: `brew install --cask mactex`
   - **Ubuntu**: `sudo apt-get install texlive-full`
   - **Windows**: Install [MiKTeX](https://miktex.org/download)
2. Start the backend (see Quick Start above)
3. PDF preview works automatically!

**Option 2: Use Overleaf** (No LaTeX install needed)
- Download .tex file → Upload to [Overleaf.com](https://www.overleaf.com)
- Compile and download PDF there

**Option 3: Setup n8n LaTeX Endpoint**
- Add LaTeX compilation to your n8n workflow
- See detailed guide: [docs/LATEX_COMPILATION_SETUP.md](docs/LATEX_COMPILATION_SETUP.md)

## Documentation

See the `docs/` folder for additional guides:
- [N8N Webhook Setup](docs/N8N_WEBHOOK_SETUP.md)
- [Response Format Guide](docs/N8N_RESPONSE_GUIDE.md)
- [Display Structure](docs/DISPLAY_GUIDE.md)
- **[DUAL_WEBHOOK_GUIDE.md](docs/DUAL_WEBHOOK_GUIDE.md)** - ⭐ Dual webhook architecture and setup
- **[ROUTING_GUIDE.md](docs/ROUTING_GUIDE.md)** - Multi-page routing and dark mode details

All documentation is organized in the [`docs/`](docs/) folder.

## Dark Mode

The app automatically syncs with your system's theme preference:

- **macOS:** System Preferences → Appearance → Dark
- **Windows:** Settings → Colors → Dark
- **Linux:** Depends on desktop environment

No manual toggle needed - it just works!