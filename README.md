# Resume Analyzer

AI-powered resume analysis and optimization tool using OpenAI API and n8n automation.

## Features

- Upload PDF/DOCX resumes
- AI-powered resume analysis and improvement
- ATS score optimization
- Target role customization
- Interactive chatbot for resume questions
- Professional Word/PDF output with Canva formatting

## Setup

1. Install dependencies:
```bash
npm install
```

2. Configure webhooks in `src/App.js`:
   - `UPLOAD_WEBHOOK`: Your n8n endpoint for resume upload
   - `CHAT_WEBHOOK`: Your n8n endpoint for chatbot

3. Start development server:
```bash
npm start
```

## n8n Workflow

The backend workflow should:
1. Parse uploaded resume (PDF/DOCX → text)
2. Call OpenAI API with CARE framework prompts
3. Use XML prompting for structured output
4. Format resume with proper structure
5. Generate Word/PDF files
6. Return JSON with download links

## Prompting Strategy

- **CARE Framework**: Context, Action, Result, Example
- **XML Prompting**: Structured input/output for better results

## Requirements

- Node.js 16+
- n8n instance (cloud or self-hosted)
- OpenAI API key
- Canva Enterprise API (optional)
