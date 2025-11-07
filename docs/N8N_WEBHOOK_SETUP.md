# n8n Webhook Setup Guide

This guide explains how to set up the n8n webhook for the Resume Analyzer application.

## Webhook Configuration

### URL
The webhook endpoint is configured in `src/App.js`:
```javascript
const UPLOAD_WEBHOOK = 'https://shreyahubcredo.app.n8n.cloud/webhook-test/2227bd6f-2f86-470d-a2d0-d8ff386eb788';
```

### HTTP Method
POST

### Content Type
multipart/form-data (for file upload)

## Request Data

The webhook receives FormData with the following fields:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `job_title` | string | Yes | The job title user is applying for |
| `job_description` | string | Yes | Full job posting description |
| `company_url` | string | No | Company website URL for research context |
| `file` | binary | Yes | Resume PDF file |

### Example Request
```
POST /webhook-test/2227bd6f-2f86-470d-a2d0-d8ff386eb788
Content-Type: multipart/form-data

--boundary
Content-Disposition: form-data; name="job_title"

Senior Software Engineer
--boundary
Content-Disposition: form-data; name="company_url"

https://www.techcompany.com
--boundary
Content-Disposition: form-data; name="job_description"

We are looking for a Senior Software Engineer with 5+ years of experience...
--boundary
Content-Disposition: form-data; name="file"; filename="resume.pdf"
Content-Type: application/pdf

[binary PDF data]
--boundary--
```

## Response Format

The webhook must return JSON with analysis data and LaTeX code.

### Required Fields

#### Analysis Data
- `overall_score` (number): Overall resume score (0-100)
- `category_scores` (object): Breakdown scores for different categories
- `strengths` (array): List of resume strengths
- `improvement_areas` (array): List of areas to improve

#### LaTeX Code
- `latex` or `latex_code` (string): Full LaTeX document code

### Optional Fields
- `keyword_recommendations` (array): Suggested keywords to add
- `tailored_bullets` (array): Suggested bullet points for experience
- `ats_tips` (array): ATS optimization tips
- `summary` (string): Overall assessment summary
- `gaps_and_learning_plan` (object): Skill gaps and learning recommendations
- `company_insights` (object): Research findings about the company

### Example Response
```json
{
  "overall_score": 85,
  "category_scores": {
    "keyword_matching": 80,
    "formatting": 90,
    "content_quality": 85,
    "experience_relevance": 88
  },
  "strengths": [
    "Strong technical skills section with relevant technologies",
    "Clear quantifiable achievements with metrics",
    "Well-structured work history"
  ],
  "improvement_areas": [
    "Add more industry-specific keywords from job description",
    "Include measurable impact metrics for each role",
    "Optimize section ordering for ATS parsing"
  ],
  "keyword_recommendations": [
    "React", "Node.js", "AWS", "CI/CD", "Agile", "Microservices"
  ],
  "tailored_bullets": [
    "Led development of microservices architecture using Node.js and AWS, improving system scalability by 200%",
    "Implemented CI/CD pipeline with Jenkins and Docker, reducing deployment time by 60%"
  ],
  "ats_tips": [
    "Use standard section headers (Experience, Education, Skills)",
    "Include relevant certifications and tools",
    "Optimize keyword density without overstuffing"
  ],
  "summary": "Your resume demonstrates strong technical capabilities and relevant experience. Focus on adding more quantifiable achievements and industry-specific keywords to increase ATS score.",
  "latex": "\\documentclass[11pt,a4paper]{article}\n\\usepackage[utf8]{inputenc}\n\\usepackage[margin=1in]{geometry}\n\n\\begin{document}\n\n\\section*{John Doe}\n\\textit{Senior Software Engineer}\n\n\\section*{Experience}\n\\textbf{Software Engineer} - Tech Company (2020-Present)\n\\begin{itemize}\n    \\item Led development of microservices architecture using Node.js and AWS\n    \\item Implemented CI/CD pipeline reducing deployment time by 60\\%\n\\end{itemize}\n\n\\end{document}"
}
```

## n8n Workflow Recommendations

### Suggested Nodes

1. **Webhook Trigger**
   - Method: POST
   - Path: /webhook-test/[your-id]
   - Response Mode: When Last Node Finishes
   - Response Data: First Matching Entry

2. **Extract Binary File**
   - Extract PDF from form data
   - Store as binary data for processing

3. **PDF to Text** (using n8n HTTP Request or external service)
   - Convert PDF to text for analysis
   - Options: PDFCo, PDF.co API, python-pdf2txt

4. **AI Analysis** (using OpenAI, Claude, or similar)
   - Analyze resume text against job description
   - Generate scoring metrics
   - Create improvement suggestions

5. **Company Research** (if company_url provided)
   - Fetch company website
   - Extract key information
   - Generate insights about culture and values

6. **LaTeX Generation** (using AI)
   - Create LaTeX template
   - Populate with optimized content
   - Include tailored achievements

7. **Format Response**
   - Combine analysis and LaTeX into JSON
   - Ensure all required fields are present

8. **Return Response**
   - Set content-type: application/json
   - Return formatted JSON

## Error Handling

The frontend expects proper error responses:

### Success Response
- HTTP Status: 200 OK
- Content-Type: application/json
- Body: JSON with analysis and LaTeX

### Error Response
- HTTP Status: 400/500
- Content-Type: text/plain or application/json
- Body: Error message (will be shown to user)

## Testing the Webhook

### Using curl
```bash
curl -X POST \
  https://shreyahubcredo.app.n8n.cloud/webhook-test/2227bd6f-2f86-470d-a2d0-d8ff386eb788 \
  -F "job_title=Senior Software Engineer" \
  -F "company_url=https://www.techcompany.com" \
  -F "job_description=We are looking for a Senior Software Engineer..." \
  -F "file=@resume.pdf"
```

### Using Postman
1. Create new POST request
2. Set URL to webhook endpoint
3. Go to Body tab
4. Select form-data
5. Add fields:
   - job_title (text)
   - company_url (text)
   - job_description (text)
   - file (file)
6. Send request

## Security Considerations

- Validate file type (only accept PDF)
- Limit file size (recommend < 10MB)
- Sanitize text inputs
- Rate limit requests
- Use HTTPS only
- Consider authentication tokens for production

## Changing the Webhook URL

To use a different webhook:

1. Update `src/App.js` line 6:
```javascript
const UPLOAD_WEBHOOK = 'YOUR_NEW_WEBHOOK_URL';
```

2. Ensure your webhook follows the same request/response format

3. Test thoroughly before deploying
