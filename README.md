# Resume Analyzer

React application with multi-page routing that analyzes resumes using n8n webhooks and displays detailed insights with automatic dark mode support.

## Quick Start

```bash
npm install
npm start
```

Visit `http://localhost:3000`

## Features

✨ **Multi-page routing** with React Router
🌓 **Automatic dark mode** synced with system preferences
📊 **Detailed analysis** with scores, insights, and recommendations
📄 **PDF viewer** for improved resumes
📱 **Fully responsive** design

## How It Works

### 1. Submit Resume (Home Page - `/`)
- Enter **Job Title** you're applying for
- Enter **Company Website URL** (optional)
- Paste **Job Description**
- Upload your **Resume** (PDF)

### 2. View Analysis (Analysis Page - `/analysis`)
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

## Webhook Data Sent

```
POST https://shreyahubcredo.app.n8n.cloud/webhook-test/2227bd6f-2f86-470d-a2d0-d8ff386eb788

FormData:
- file: [binary PDF/DOCX]
- job_title: "Senior Software Engineer"
- company_url: "https://www.company.com" (optional)
- job_description: "We are looking for..."
```

## Expected Webhook Response

```json
[
  {
    "output": "{\"overall_score\": 81, \"category_scores\": {...}, ...}",
    "pdf_url": "https://storage.example.com/improved-resume.pdf"
  }
]
```

**Required fields:**
- `output` - Stringified JSON with analysis data
- `pdf_url` or `pdf_data` - Link to improved PDF or base64 data

## Configuration

### Change Webhook URL

Edit line 6-7 in `src/App.js`:
```javascript
const UPLOAD_WEBHOOK = "YOUR_WEBHOOK_URL";
```

### Documentation

- **ROUTING_GUIDE.md** - Multi-page routing and dark mode details
- **N8N_RESPONSE_GUIDE.md** - How to configure your n8n webhook
- **DISPLAY_GUIDE.md** - Display structure and troubleshooting
- **N8N_WEBHOOK_SETUP.md** - Webhook node configuration

## Dark Mode

The app automatically syncs with your system's theme preference:

- **macOS:** System Preferences → Appearance → Dark
- **Windows:** Settings → Colors → Dark
- **Linux:** Depends on desktop environment

No manual toggle needed - it just works!
