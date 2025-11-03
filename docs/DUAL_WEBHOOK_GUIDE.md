# Dual Webhook Integration Guide

## Overview

The webapp now uses **two separate webhooks** for better separation of concerns:

1. **Analysis Webhook** - Returns JSON with resume insights
2. **PDF Webhook** - Returns improved resume PDF binary

## Webhook URLs

```javascript
// Analysis webhook - returns JSON data
const ANALYSIS_WEBHOOK = 'https://shreyahubcredo.app.n8n.cloud/webhook-test/2227bd6f-2f86-470d-a2d0-d8ff386eb788';

// PDF webhook - returns PDF file
const PDF_WEBHOOK = 'https://shreyahubcredo.app.n8n.cloud/webhook-test/20db4528-631d-42c0-858d-930ba828178d';
```

## How It Works

### 1. Form Submission

User submits form with:
- Job title
- Job description
- Company URL (optional)
- Resume PDF file

### 2. Parallel Webhook Calls

Both webhooks are called **simultaneously** using `Promise.all()`:

```javascript
const [analysisResponse, pdfResponse] = await Promise.all([
    fetch(ANALYSIS_WEBHOOK, { method: 'POST', body: formData }),
    fetch(PDF_WEBHOOK, { method: 'POST', body: formData })
]);
```

**Benefits:**
- ⚡ **Faster** - Both requests happen at the same time
- 🔄 **Efficient** - User waits for slowest operation only
- 🛡️ **Resilient** - PDF failure doesn't block analysis display

### 3. Response Handling

#### Analysis Webhook Response

**Expected format:**
```json
[
  {
    "output": "{\"overall_score\": 81, \"category_scores\": {...}, ...}"
  }
]
```

**Content-Type:** `application/json`

**What it contains:**
- Overall ATS score
- Category-by-category scores
- Strengths and weaknesses
- Keyword recommendations
- Tailored bullet points
- ATS optimization tips
- Learning plan
- Company research insights
- Executive summary

#### PDF Webhook Response

**Expected format:** Binary PDF file

**Content-Type:** `application/pdf`

**What it contains:**
- Improved resume with optimized content
- ATS-friendly formatting
- Keyword integration
- Enhanced bullet points

### 4. Data Processing

```
┌──────────────────────────────────────────┐
│  User submits form                       │
└────────────────┬─────────────────────────┘
                 │
                 ├──────────────┬──────────────┐
                 ▼              ▼              │
    ┌────────────────┐  ┌──────────────┐      │
    │ Analysis       │  │ PDF          │      │
    │ Webhook        │  │ Webhook      │      │
    └────────┬───────┘  └──────┬───────┘      │
             │                 │              │
             │  JSON           │  PDF Binary  │
             │                 │              │
             ▼                 ▼              │
    ┌────────────────────────────────┐       │
    │  Process both responses        │       │
    │  - Parse JSON analysis         │       │
    │  - Create PDF blob URL         │       │
    └────────────────┬───────────────┘       │
                     │                        │
                     ▼                        │
         ┌───────────────────────┐           │
         │ Navigate to /analysis │           │
         │ with both data        │           │
         └───────────────────────┘           │
                                              │
         Parallel execution ─────────────────┘
```

## Loading States

The app shows progress to users during processing:

1. **"Preparing your resume..."** - Initial state
2. **"Analyzing resume and generating improvements..."** - Both webhooks called
3. **"Processing analysis results..."** - Parsing JSON
4. **"Loading improved resume..."** - Processing PDF binary

## Error Handling

### Analysis Webhook Fails
- **Result:** Show error message, don't navigate
- **User impact:** Cannot proceed to analysis page
- **Critical:** Yes - analysis data is required

### PDF Webhook Fails
- **Result:** Continue with analysis only, warn user
- **User impact:** Analysis page shows without "View Improved Resume" button
- **Critical:** No - analysis can be shown without PDF

### Both Webhooks Fail
- **Result:** Show error message
- **User impact:** Cannot proceed
- **Solution:** Check network, webhook configuration

## n8n Workflow Configuration

### Analysis Webhook Workflow

```
1. Webhook Trigger Node
   - Method: POST
   - Path: /webhook-test/2227bd6f-2f86-470d-a2d0-d8ff386eb788
   - Response Mode: "Respond to Webhook"

2. Extract Form Data
   - job_title: $json.body.job_title
   - job_description: $json.body.job_description
   - company_url: $json.body.company_url
   - file: $binary.file

3. AI Analysis Node
   - Process resume with OpenAI/Claude
   - Generate scores, insights, recommendations

4. Format Response
   - Create JSON output structure
   - Stringify nested analysis data

5. Respond to Webhook Node
   - Return: [{ output: "stringified json" }]
   - Content-Type: application/json
```

### PDF Webhook Workflow

```
1. Webhook Trigger Node
   - Method: POST
   - Path: /webhook-test/20db4528-631d-42c0-858d-930ba828178d
   - Response Mode: "Respond to Webhook"

2. Extract Form Data
   - Same fields as analysis webhook
   - job_title, job_description, company_url, file

3. AI Improvement Node
   - Generate improved resume content
   - Apply ATS optimizations
   - Enhance bullet points

4. PDF Generation Node
   - Convert to PDF format
   - Apply professional formatting
   - Store or generate binary

5. Respond to Webhook Node
   - Return: Binary PDF data
   - Content-Type: application/pdf
```

## Testing

### Test Analysis Webhook

```bash
curl -X POST \
  https://shreyahubcredo.app.n8n.cloud/webhook-test/2227bd6f-2f86-470d-a2d0-d8ff386eb788 \
  -F "file=@resume.pdf" \
  -F "job_title=Software Engineer" \
  -F "job_description=Looking for a senior developer..." \
  -F "company_url=https://example.com" \
  -H "Accept: application/json"
```

**Expected response:**
```json
[
  {
    "output": "{...json string...}"
  }
]
```

### Test PDF Webhook

```bash
curl -X POST \
  https://shreyahubcredo.app.n8n.cloud/webhook-test/20db4528-631d-42c0-858d-930ba828178d \
  -F "file=@resume.pdf" \
  -F "job_title=Software Engineer" \
  -F "job_description=Looking for a senior developer..." \
  -F "company_url=https://example.com" \
  -H "Accept: application/pdf" \
  -o improved-resume.pdf
```

**Expected response:** Binary PDF file saved to `improved-resume.pdf`

## Advantages of Dual Webhooks

### ✅ Separation of Concerns
- Analysis logic separate from PDF generation
- Easier to debug and maintain
- Can update one without affecting the other

### ✅ Scalability
- Different processing times don't block each other
- Can scale webhooks independently
- Parallel execution reduces total wait time

### ✅ Flexibility
- Can use different AI models for each
- PDF generation can be swapped (Canva, LaTeX, etc.)
- Analysis can be enhanced without PDF changes

### ✅ Resilience
- Partial failure doesn't break everything
- Analysis works even if PDF fails
- Better user experience with graceful degradation

### ✅ Performance
- Parallel execution is faster than sequential
- User sees results sooner
- Loading indicators show specific progress

## Common Issues

### Issue: FormData consumed error

**Problem:** Same FormData instance sent to both webhooks

**Solution:** Create separate FormData instances
```javascript
const createFormData = () => {
    const fd = new FormData();
    fd.append('job_title', formData.job_title);
    // ... add all fields
    return fd;
};

// Each webhook gets fresh instance
fetch(ANALYSIS_WEBHOOK, { body: createFormData() })
fetch(PDF_WEBHOOK, { body: createFormData() })
```

### Issue: One webhook times out

**Problem:** Long-running webhook blocks the other

**Solution:** Already handled! `Promise.all()` waits for both, and slow one doesn't block fast one from completing

### Issue: PDF doesn't appear

**Problem:** PDF webhook failed but analysis succeeded

**Expected behavior:** Analysis page shows without "View Improved Resume" button. This is intentional - user still gets valuable insights.

**Check:** Browser console for PDF webhook error logs

### Issue: "Unexpected analysis response format"

**Problem:** Analysis webhook returning different JSON structure

**Solution:** Check expected format in code - supports 3 formats:
1. `[{ output: "stringified json" }]`
2. `{ overall_score: 81, ... }`
3. `[{ overall_score: 81, ... }]`

## Migration from Single Webhook

If migrating from single webhook setup:

**Before:**
```javascript
// Single webhook returned both
const response = await fetch(SINGLE_WEBHOOK, { body: formData });
const data = await response.json();
// Had to extract both PDF URL and analysis from one response
```

**After:**
```javascript
// Two webhooks, parallel execution
const [analysis, pdf] = await Promise.all([
    fetch(ANALYSIS_WEBHOOK, { body: formData1 }),
    fetch(PDF_WEBHOOK, { body: formData2 })
]);
// Each response is clean and focused
```

## Future Enhancements

Potential improvements:

1. **Sequential mode** - Option to call PDF webhook only after analysis completes
2. **Webhook selection** - User chooses which outputs they want
3. **Caching** - Store results to avoid re-processing
4. **Batch processing** - Analyze multiple resumes at once
5. **Webhook health checks** - Monitor uptime and switch to backups
