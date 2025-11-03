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
[
  {
    "output": "{\"overall_score\": 81, \"category_scores\": {...}, ...}"
  }
]
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

### Documentation

- **DUAL_WEBHOOK_GUIDE.md** - ⭐ Dual webhook architecture and setup
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
