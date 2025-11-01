# n8n Workflow Architecture

## Overview
This document describes the n8n workflow for the Resume Analyzer application.

## Workflow 1: Resume Upload & Analysis

### Endpoint
`POST /webhook/upload-resume`

### Input (multipart/form-data)
```
file: File (PDF or DOCX)
target_roles: String (comma-separated roles)
email: String (optional)
```

### Workflow Steps

#### 1. Webhook Trigger
- **Node**: Webhook
- **Method**: POST
- **Path**: `/upload-resume`
- **Response**: Return last node

#### 2. Extract File Binary
- **Node**: Extract Binary
- **Input**: `{{ $json.file }}`
- **Output**: Binary file data

#### 3. Parse Resume Text
- **Node**: Code (Python/JavaScript)
- **Function**: Extract text from PDF/DOCX
- **Libraries needed**:
  - For PDF: `pypdf2` or `pdfplumber`
  - For DOCX: `python-docx`

**Python Example:**
```python
import PyPDF2
from docx import Document
import io

def extract_text(file_binary, file_type):
    if file_type == 'application/pdf':
        pdf = PyPDF2.PdfReader(io.BytesIO(file_binary))
        text = ""
        for page in pdf.pages:
            text += page.extract_text()
        return text
    elif 'wordprocessing' in file_type:
        doc = Document(io.BytesIO(file_binary))
        text = "\n".join([para.text for para in doc.paragraphs])
        return text
    return ""

# In n8n code node:
resume_text = extract_text($binary.data, $json.file_type)
return [{'json': {'resume_text': resume_text}}]
```

#### 4. OpenAI: Analyze Resume (CARE Framework)
- **Node**: OpenAI (GPT-4 recommended)
- **Model**: gpt-4-turbo-preview or gpt-4
- **Temperature**: 0.3 (for consistency)
- **Max Tokens**: 2500

See `prompts/analyze-resume.xml` for full prompt

#### 5. OpenAI: Improve Resume Content
- **Node**: OpenAI (GPT-4)
- **Model**: gpt-4-turbo-preview
- **Temperature**: 0.5
- **Max Tokens**: 3000

See `prompts/improve-resume.xml` for full prompt

#### 6. Calculate ATS Score
- **Node**: Code (JavaScript)
- **Function**: Analyze keywords, structure, formatting

**JavaScript Example:**
```javascript
function calculateATSScore(resumeText, targetRoles, analysis) {
  let score = 0;

  // Keywords matching (40 points)
  const keywords = analysis.keywords || [];
  const matchedKeywords = keywords.filter(k =>
    resumeText.toLowerCase().includes(k.toLowerCase())
  ).length;
  score += Math.min(40, matchedKeywords * 2);

  // Structure (30 points)
  const sections = ['experience', 'education', 'skills', 'summary'];
  const foundSections = sections.filter(s =>
    resumeText.toLowerCase().includes(s)
  ).length;
  score += (foundSections / sections.length) * 30;

  // Formatting (30 points)
  const hasBulletPoints = /[-•*]\s/.test(resumeText);
  const hasQuantifiableResults = /\d+%|\$\d+|increased|decreased|improved/i.test(resumeText);
  if (hasBulletPoints) score += 15;
  if (hasQuantifiableResults) score += 15;

  return Math.round(score);
}

return [{
  json: {
    ats_score: calculateATSScore(
      $json.resume_text,
      $json.target_roles,
      $json.analysis
    )
  }
}];
```

#### 7. Format to Markdown
- **Node**: Code
- **Function**: Convert improved content to structured markdown

#### 8. Generate DOCX (using python-docx)
- **Node**: Execute Command or HTTP Request
- **Function**: Create properly formatted Word document

**Python Service Example:**
```python
from docx import Document
from docx.shared import Pt, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH

def create_resume_docx(content, output_path):
    doc = Document()

    # Set margins
    sections = doc.sections
    for section in sections:
        section.top_margin = Inches(0.5)
        section.bottom_margin = Inches(0.5)
        section.left_margin = Inches(0.75)
        section.right_margin = Inches(0.75)

    # Parse markdown content and add to doc
    # ... formatting logic here

    doc.save(output_path)
    return output_path
```

#### 9. Generate PDF (using reportlab or wkhtmltopdf)
- **Node**: Execute Command
- **Function**: Convert DOCX to PDF or generate directly

#### 10. Upload to Storage
- **Node**: AWS S3 / Google Cloud Storage / Cloudinary
- **Function**: Store DOCX and PDF files
- **Output**: Public URLs

#### 11. Return Response
- **Node**: Respond to Webhook
- **Response Body**:
```json
{
  "ats_score": 85,
  "improved_markdown": "# John Doe\n\n...",
  "docx_url": "https://storage.example.com/resume-123.docx",
  "pdf_url": "https://storage.example.com/resume-123.pdf",
  "gap_analysis": {
    "missing_keywords": ["Python", "AWS"],
    "suggestions": ["Add more quantifiable results"]
  },
  "notes_for_layout": {
    "sections": ["Summary", "Experience", "Education", "Skills"],
    "color_scheme": "professional_blue"
  }
}
```

---

## Workflow 2: Resume Chatbot

### Endpoint
`POST /webhook/resume-chat`

### Input (JSON)
```json
{
  "session_id": "abc123",
  "message": "How can I improve my resume?"
}
```

### Workflow Steps

#### 1. Webhook Trigger
- **Node**: Webhook
- **Method**: POST
- **Path**: `/resume-chat`

#### 2. Load Session Context (Optional)
- **Node**: Redis/Database Query
- **Function**: Load conversation history for session_id

#### 3. OpenAI Chat
- **Node**: OpenAI
- **Model**: gpt-4-turbo-preview
- **System Prompt**: "You are a professional resume coach..."
- **Include**: Previous conversation context

#### 4. Save to Session
- **Node**: Redis/Database Update
- **Function**: Store message in session history

#### 5. Return Response
```json
{
  "reply": "To improve your resume, consider..."
}
```

---

## Required n8n Nodes

1. **Webhook** (built-in)
2. **OpenAI** (install from n8n community nodes)
3. **HTTP Request** (built-in)
4. **Code** (built-in - Python or JavaScript)
5. **AWS S3** / **Google Cloud Storage** (for file storage)
6. **IF** / **Switch** (for conditional logic)

## Environment Variables in n8n

```env
OPENAI_API_KEY=sk-...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=resume-files
```

## Testing

Use tools like Postman or curl:

```bash
curl -X POST \
  -F "file=@/path/to/resume.pdf" \
  -F "target_roles=Software Engineer, ML Engineer" \
  -F "email=test@example.com" \
  https://your-n8n-instance.com/webhook/upload-resume
```
