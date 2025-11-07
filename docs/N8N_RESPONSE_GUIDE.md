# n8n Response Configuration Guide

## Current Situation

Your n8n workflow is currently returning only the analysis JSON, but **not the PDF**. The webapp needs both the analysis data and the PDF to display them side-by-side.

### What You're Currently Returning
```json
[
  {
    "output": "{...analysis json...}"
  },
  {
    "headers": {...},
    "body": {...}
  }
]
```

### What the Webapp Expects

The webapp now supports **3 ways** to include the PDF:

## Option 1: Add `pdf_url` Field (Recommended)

Add a URL to the improved PDF in your response:

```json
[
  {
    "output": "{...analysis json...}",
    "pdf_url": "https://storage.example.com/improved-resume.pdf"
  }
]
```

### How to implement in n8n:

1. After generating the improved PDF, upload it to storage (Google Drive, S3, etc.)
2. Get a public/signed URL for the PDF
3. Add the URL to your "Respond to Webhook" node

```javascript
// In your n8n "Respond to Webhook" node
{
  "output": $json.analysis_output,
  "pdf_url": $json.pdf_storage_url  // URL from your storage upload step
}
```

## Option 2: Base64 Encoded PDF

Encode the PDF as base64 and include it directly:

```json
[
  {
    "output": "{...analysis json...}",
    "pdf_data": "JVBERi0xLjQKJeLjz9MKMSAwIG9iago8PC9UeXBlL0Nhd..."
  }
]
```

### How to implement in n8n:

```javascript
// In your n8n Code node or Respond to Webhook
{
  "output": $json.analysis_output,
  "pdf_data": $binary.improved_pdf.data  // base64 from binary data
}
```

## Option 3: Include in Analysis JSON

Add the PDF URL inside the analysis JSON string itself:

```json
{
  "overall_score": 81,
  "category_scores": {...},
  "pdf_url": "https://storage.example.com/improved-resume.pdf",
  "strengths": [...]
}
```

## Example n8n Workflow Structure

```
1. Webhook Trigger (receives resume + job description)
   ↓
2. AI Agent Node (analyzes resume, returns JSON)
   ↓
3. Generate Improved PDF Node (creates new PDF)
   ↓
4. Upload to Storage Node (Google Drive/S3/Cloudinary)
   ↓
5. Get Public URL Node
   ↓
6. Respond to Webhook Node
   {
     "output": "{{$json.analysis}}",
     "pdf_url": "{{$json.storage_url}}"
   }
```

## Temporary Solution

Right now, the webapp will show **only the analysis panel** without the PDF. The analysis will still work and be fully functional, just missing the PDF viewer on the right side.

Once you add the PDF via any of the 3 options above, the split-screen view will work perfectly!

## Testing Your Response

You can test if your response format is correct by checking the browser console:

- ✅ **Success**: No warnings, PDF loads on the right
- ⚠️ **Warning**: "No PDF data found in response" = Analysis works, but no PDF
- ❌ **Error**: "Unexpected response format" = JSON structure is wrong

## Need Help?

If you're not sure how to upload the PDF to storage and get a URL, here are some quick options:

1. **Google Drive**: Use n8n's Google Drive node → Share link → Extract file ID
2. **AWS S3**: Upload to S3 → Generate presigned URL
3. **Cloudinary**: Upload → Get secure URL
4. **n8n Cloud Storage**: Use n8n's built-in storage (if available)

Choose the storage solution that works best for your setup!
