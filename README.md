# Resume Analyzer with LaTeX Editor

React-based resume analysis tool that provides scoring, feedback, and an editable LaTeX resume template.

## Quick Start

```bash
npm install
npm start
```

Visit `http://localhost:3000`

## How It Works

1. User enters **Job Title** they're applying for
2. User enters **Company Website URL** (optional) - provides AI context on company culture and pain points
3. User pastes **Job Description**
4. User uploads their **Resume** (PDF)
5. Frontend sends all data to n8n webhook
6. n8n processes and returns:
   - Resume analysis with scoring and feedback
   - Suggested resume improvements in LaTeX format
7. Frontend displays split view:
   - **Left Panel**: Analysis scores, strengths, improvement areas, keywords, tips
   - **Right Panel**: Editable LaTeX code with download capability

## Features

- **Interactive LaTeX Editor**: Edit the suggested resume directly in the browser
- **Real-time PDF Preview**: See your resume as you edit (requires setup - see below)
- **Dark Mode Support**: Automatic theme switching based on system preferences
- **Download & Copy**: Export LaTeX code as .tex file or copy to clipboard
- **Export to PDF**: Download compiled PDF with one click (when preview enabled)
- **Comprehensive Feedback**: Overall score, category scores, strengths, improvement areas, keywords, ATS tips

## PDF Preview Setup

The app shows "Preview Unavailable" because external LaTeX APIs have CORS restrictions. To enable real-time PDF preview:

**Option 1: Setup n8n LaTeX Endpoint** (Recommended)
- Add LaTeX compilation to your n8n workflow
- See detailed guide: [docs/LATEX_COMPILATION_SETUP.md](docs/LATEX_COMPILATION_SETUP.md)

**Option 2: Use Overleaf**
- Download .tex file → Upload to [Overleaf.com](https://www.overleaf.com)
- Compile and download PDF there

**Option 3: Compile Locally**
- Download .tex file
- Run: `pdflatex resume.tex`
- Requires LaTeX distribution (TeX Live, MiKTeX, etc.)

## Webhook Data Sent

```
POST https://shreyahubcredo.app.n8n.cloud/webhook-test/2227bd6f-2f86-470d-a2d0-d8ff386eb788

FormData:
- file: [binary PDF]
- job_title: "Senior Software Engineer"
- company_url: "https://www.company.com" (optional)
- job_description: "We are looking for..."
```

## Expected Webhook Response

The webhook should return JSON with analysis data and LaTeX code:

```json
[
  {
    "output": "{\"overall_score\": 85, \"category_scores\": {...}, \"strengths\": [...], \"improvement_areas\": [...], \"keyword_recommendations\": [...], \"tailored_bullets\": [...], \"ats_tips\": [...], \"summary\": \"...\"}",
    "latex": "\\documentclass{article}\\n\\begin{document}\\n...\\end{document}",
    "latex_code": "\\documentclass{article}\\n\\begin{document}\\n...\\end{document}"
  }
]
```

Or direct object format:

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
  "latex": "\\documentclass{article}...",
  "summary": "Overall assessment..."
}
```

## Change Webhook URL

Edit line 6 in `src/App.js`:
```javascript
const UPLOAD_WEBHOOK = "YOUR_WEBHOOK_URL";
```

## Documentation

See the `docs/` folder for additional guides:
- [N8N Webhook Setup](docs/N8N_WEBHOOK_SETUP.md)
- [Response Format Guide](docs/N8N_RESPONSE_GUIDE.md)
- [Display Structure](docs/DISPLAY_GUIDE.md)
