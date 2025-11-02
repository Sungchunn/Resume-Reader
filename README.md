# Resume Analyzer

Simple React frontend that uploads resumes to n8n webhook and displays results.

## Quick Start

```bash
npm install
npm start
```

Visit `http://localhost:3000`

## How It Works

1. User enters **Job Title** they're applying for
2. User enters **Company Website URL** (optional)
3. User pastes **Job Description**
4. User uploads their **Resume** (PDF/DOCX)
5. Frontend sends all data to n8n webhook
6. n8n processes and returns improved resume
7. Frontend displays ATS score and download links

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
{
  "ats_score": 85,
  "improved_markdown": "# John Doe\n\n...",
  "docx_url": "https://...",
  "pdf_url": "https://...",
  "gap_analysis": { ... }
}
```

## Change Webhook URL

Edit line 3 in `src/App.js`:
```javascript
const UPLOAD_WEBHOOK = "YOUR_WEBHOOK_URL";
```
