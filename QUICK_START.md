# Quick Start Guide

## What You Have Now

A complete Resume Analyzer webapp with:
- **React frontend** for file upload and chat
- **n8n workflow architecture** for backend processing
- **CARE framework prompts** with XML structure for OpenAI
- **Python scripts** for parsing, scoring, and document generation

## Next Steps

### 1. Test the Frontend Locally

```bash
npm install
npm start
```

Visit `http://localhost:3000` - you'll see the upload form and chatbot (webhooks won't work yet).

### 2. Set Up n8n Workflow

Open your n8n instance and create a new workflow:

1. **Add Webhook Trigger**
   - Method: POST
   - Path: `/upload-resume`
   - Response Mode: "Last Node"

2. **Add Code Node (Python)** - Resume Parser
   - Copy code from `n8n-scripts/resume_parser.py`
   - This extracts text from PDF/DOCX

3. **Add OpenAI Node** - Analysis
   - Model: gpt-4-turbo-preview
   - Temperature: 0.3
   - System Message: Copy from `prompts/analyze-resume.xml`
   - User Message: `{{ $json.resume_text }}\nTarget Roles: {{ $json.target_roles }}`

4. **Add OpenAI Node** - Improvement
   - Model: gpt-4-turbo-preview
   - Temperature: 0.5
   - System Message: Copy from `prompts/improve-resume.xml`
   - User Message: Include resume text + analysis results

5. **Add Code Node (Python)** - ATS Score
   - Copy code from `n8n-scripts/ats_scorer.py`

6. **Add Code Node (Python)** - Document Generator
   - Copy code from `n8n-scripts/document_generator.py`
   - This creates DOCX and PDF files

7. **Add HTTP Request Node** - Upload to S3
   - Upload generated DOCX and PDF to your storage
   - Get public URLs

8. **Add Response Node**
   - Return JSON:
   ```json
   {
     "ats_score": {{ $json.ats_score }},
     "improved_markdown": {{ $json.improved_markdown }},
     "docx_url": {{ $json.docx_url }},
     "pdf_url": {{ $json.pdf_url }},
     "gap_analysis": {{ $json.gap_analysis }}
   }
   ```

9. **Activate the workflow** and copy the webhook URL

### 3. Create Chatbot Workflow (Optional)

Simpler workflow:
1. Webhook trigger (POST `/resume-chat`)
2. OpenAI Chat node with system prompt from `prompts/chatbot-system.txt`
3. Response with `{ "reply": "..." }`

### 4. Connect Frontend to Backend

Edit `src/App.js` and replace:

```javascript
const UPLOAD_WEBHOOK = "YOUR_N8N_UPLOAD_WEBHOOK_URL";
const CHAT_WEBHOOK = "YOUR_N8N_CHAT_WEBHOOK_URL";
```

### 5. Test End-to-End

1. Restart React app (`npm start`)
2. Upload a sample resume (PDF or DOCX)
3. Enter target role: "Software Engineer"
4. Click "Analyze & Improve"
5. Check the response and download links

## Key Files Reference

| File | Purpose |
|------|---------|
| `src/App.js` | React frontend - upload form and chatbot |
| `prompts/analyze-resume.xml` | OpenAI prompt for gap analysis (CARE framework) |
| `prompts/improve-resume.xml` | OpenAI prompt for resume improvement |
| `prompts/chatbot-system.txt` | System prompt for chatbot |
| `n8n-scripts/resume_parser.py` | Extract text from PDF/DOCX |
| `n8n-scripts/ats_scorer.py` | Calculate ATS compatibility score |
| `n8n-scripts/document_generator.py` | Generate formatted DOCX and PDF |
| `n8n-workflow-guide.md` | Detailed n8n workflow architecture |
| `.env.example` | Environment variables template |

## Environment Variables

Create a `.env` file:

```bash
OPENAI_API_KEY=sk-your-key-here
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_S3_BUCKET=resume-analyzer-files
```

## Troubleshooting

**Frontend can't reach webhooks**
- Check CORS settings in n8n
- Verify webhook URLs are correct
- Ensure n8n workflows are activated

**Resume parsing fails**
- Verify PDF/DOCX is valid
- Check file size (keep under 15MB)
- Review error in n8n execution log

**OpenAI errors**
- Verify API key is correct
- Check you have GPT-4 access
- Monitor rate limits and quotas

**Document generation fails**
- Ensure python-docx is installed in n8n
- Check temp directory permissions
- Verify markdown format from OpenAI

## Understanding the CARE Framework

Your prompts use **CARE** structure:

- **C**ontext: Background info (resume, target role, industry)
- **A**ction: Specific tasks (analyze, improve, format)
- **R**esult: Expected output format (XML, markdown, JSON)
- **E**xample: Sample input/output to guide the model

This gives better, more consistent results from OpenAI.

## Next Enhancements

Once basic flow works:

1. Watch reference video: https://youtu.be/5FzizP98x9E
2. Improve document formatting based on video guidance
3. Add user authentication
4. Store resume history
5. Implement Canva API integration (if available)
6. Add email notifications
7. Deploy to production (Vercel/Netlify + n8n cloud)

## Cost Estimates

Per resume analysis:
- OpenAI GPT-4: ~$0.03-0.05
- n8n: Free tier or $20-50/month
- AWS S3: ~$0.023 per GB stored
- Total: **~$0.05 per resume** (after n8n subscription)

For 1000 resumes/month: ~$50-70 total

## Support

- n8n docs: https://docs.n8n.io
- OpenAI API: https://platform.openai.com/docs
- python-docx: https://python-docx.readthedocs.io

## Reference Video

Watch this for resume structure guidance:
https://youtu.be/5FzizP98x9E

The document generator should be updated to match the structure shown in this video.
