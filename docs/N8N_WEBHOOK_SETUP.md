# n8n Webhook Setup Guide

## Webhook Configuration

Your n8n webhook will receive a `multipart/form-data` POST request with the following fields:

### Request Details

**URL:** `https://shreyahubcredo.app.n8n.cloud/webhook-test/2227bd6f-2f86-470d-a2d0-d8ff386eb788`

**Method:** `POST`

**Content-Type:** `multipart/form-data`

### Form Fields

| Field Name | Type | Required | Description | Example |
|------------|------|----------|-------------|---------|
| `file` | Binary | Yes | Resume file (PDF or DOCX) | resume.pdf |
| `job_title` | String | Yes | Job title user is applying for | "Senior Software Engineer" |
| `job_description` | String | Yes | Full job description text | "We are looking for..." |
| `company_url` | String | No | Company website URL | "https://www.google.com" |

## n8n Webhook Node Setup

1. **Add Webhook Trigger Node**
   - HTTP Method: `POST`
   - Path: `/webhook-test/2227bd6f-2f86-470d-a2d0-d8ff386eb788`
   - Response Mode: "Last Node"
   - Enable CORS: Yes (if frontend is on different domain)

2. **Access the Data in n8n**

   After the webhook node, you can access the data like this:

   ```javascript
   // In n8n expressions:

   // Binary file (resume)
   $binary.file

   // Job title
   $json.body.job_title
   // or
   {{ $json["body"]["job_title"] }}

   // Job description
   $json.body.job_description

   // Company URL (may be undefined if not provided)
   $json.body.company_url

   // File metadata
   $json.body.file // Contains filename, mimetype, etc.
   ```

3. **Example: Extract Values in Code Node**

   ```javascript
   // JavaScript Code Node
   const jobTitle = $input.item.json.body.job_title;
   const jobDescription = $input.item.json.body.job_description;
   const companyUrl = $input.item.json.body.company_url || '';
   const resumeFile = $input.item.binary.file;

   return {
     json: {
       job_title: jobTitle,
       job_description: jobDescription,
       company_url: companyUrl,
       has_resume: !!resumeFile
     }
   };
   ```

## Expected Response Format

Your n8n workflow should return JSON in this format:

```json
{
  "ats_score": 85,
  "improved_markdown": "# John Doe\n\nProfessional Summary...",
  "docx_url": "https://storage.example.com/resume-improved.docx",
  "pdf_url": "https://storage.example.com/resume-improved.pdf",
  "gap_analysis": {
    "missing_keywords": ["Python", "AWS"],
    "suggestions": ["Add more quantifiable results"]
  }
}
```

**Required fields:**
- `ats_score` (number): ATS compatibility score 0-100

**Optional fields:**
- `improved_markdown` (string): Improved resume content
- `docx_url` (string): Download link for DOCX file
- `pdf_url` (string): Download link for PDF file
- `gap_analysis` (object): Analysis of resume gaps

## Testing the Webhook

Use curl to test:

```bash
curl -X POST \
  https://shreyahubcredo.app.n8n.cloud/webhook-test/2227bd6f-2f86-470d-a2d0-d8ff386eb788 \
  -F "file=@/path/to/resume.pdf" \
  -F "job_title=Senior Software Engineer" \
  -F "job_description=We are seeking a talented engineer..." \
  -F "company_url=https://www.example.com"
```

Or test with the React app by checking browser DevTools Network tab.

## Common Issues

**CORS Error:**
- Make sure CORS is enabled in n8n webhook settings
- Add allowed origins if restricting access

**File not received:**
- Verify the webhook is reading `$binary.file`
- Check that "Binary Data" option is enabled in webhook node

**Empty fields:**
- Access via `$json.body.field_name` not `$json.field_name`
- Check webhook execution log to see exact data structure
