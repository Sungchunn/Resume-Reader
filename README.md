# Resume Analyzer

Simple React frontend that uploads resumes to n8n webhook and displays results.

## Quick Start

```bash
npm install
npm start
```

Visit `http://localhost:3000`

## How It Works

1. User uploads PDF/DOCX resume
2. User enters target roles
3. Frontend sends to n8n webhook: `https://shreyahubcredo.app.n8n.cloud/webhook-test/2227bd6f-2f86-470d-a2d0-d8ff386eb788`
4. n8n processes and returns results
5. Frontend displays ATS score and download links

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
