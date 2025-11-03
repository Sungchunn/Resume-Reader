# Split-Screen Display Guide

## How It Works

The webapp automatically displays a split-screen layout when it receives analysis data and/or PDF data from your webhook.

### Layout Structure

```
┌─────────────────────────────────────────────────────────┐
│                  Resume Analysis Report                 │
│                     [Back to Form]                      │
├────────────────────────┬────────────────────────────────┤
│                        │                                │
│   Analysis Panel       │        PDF Panel               │
│   (Left - Scrollable)  │    (Right - Scrollable)        │
│                        │                                │
│   • Overall Score      │    [Resume PDF Viewer]         │
│   • Category Scores    │                                │
│   • Strengths          │    Page 1                      │
│   • Improvements       │    Page 2                      │
│   • Keywords           │    ...                         │
│   • Tailored Bullets   │                                │
│   • ATS Tips           │                                │
│   • Learning Plan      │                                │
│   • Company Insights   │                                │
│   • Summary            │                                │
│                        │                                │
└────────────────────────┴────────────────────────────────┘
```

## What Gets Displayed

### ✅ When Webhook Returns Both Analysis + PDF

**Response format:**
```json
[
  {
    "output": "{\"overall_score\": 81, ...}",
    "pdf_url": "https://storage.com/resume.pdf"
  }
]
```

**Result:** Full split-screen
- ✅ Left: Analysis panel with all insights
- ✅ Right: PDF viewer showing the improved resume

---

### ⚠️ When Webhook Returns Only Analysis (No PDF)

**Response format:**
```json
[
  {
    "output": "{\"overall_score\": 81, ...}"
  }
]
```

**Result:** Analysis only
- ✅ Left: Analysis panel with all insights
- ❌ Right: Empty (no PDF panel)

**What you'll see:** Full-width analysis panel on the left

---

### ⚠️ When Webhook Returns Only PDF (No Analysis)

**Response format:**
- Content-Type: `application/pdf`
- Binary PDF data

**Result:** PDF only
- ❌ Left: Empty (no analysis panel)
- ✅ Right: PDF viewer

**What you'll see:** Full-width PDF viewer

---

## Technical Details

### Response Parsing

The webapp supports multiple response formats:

1. **Array with output field** (your format):
   ```json
   [{ "output": "stringified json", "pdf_url": "..." }]
   ```

2. **Direct object**:
   ```json
   { "overall_score": 81, "pdf_url": "...", ... }
   ```

3. **Array of objects**:
   ```json
   [{ "overall_score": 81, "pdf_url": "...", ... }]
   ```

### PDF Sources

The webapp checks for PDF in this order:

1. `pdf_url` in response object
2. `pdf_data` as base64 string
3. `pdf_url` inside the parsed analysis JSON
4. Direct PDF binary (Content-Type: application/pdf)

### Layout Features

- **Independent scrolling**: Each panel scrolls separately
- **Responsive**: On screens < 1200px, panels stack vertically
- **50/50 split**: Equal width for both panels on desktop
- **Color-coded scores**:
  - Green: ≥ 80
  - Orange: 60-79
  - Red: < 60

## Debugging

### Check Browser Console

Open DevTools (F12) and look for:

```
Received JSON response: [...]
Parsed analysis from array format: {...}
Fetching PDF from: https://...
Successfully fetched PDF from URL
```

### Common Issues

| Issue | Console Message | Solution |
|-------|----------------|----------|
| No analysis showing | "Could not extract analysis data" | Check JSON structure in response |
| No PDF showing | "No PDF data found in response" | Add `pdf_url` or `pdf_data` to webhook |
| PDF fails to load | "Failed to fetch PDF" | Check URL is publicly accessible |
| Wrong layout | Check `analysisData` and `pdfUrl` states | Verify both data types are set correctly |

## Expected Behavior

✅ **Correct:** Both panels appear side-by-side when both data sources are present

✅ **Correct:** Analysis panel takes full width when only JSON is returned

✅ **Correct:** PDF panel takes full width when only PDF is returned

❌ **Incorrect:** Blank screen (means parsing failed - check console)

## Mobile View

On mobile devices (< 1200px width):
- Panels stack vertically
- Analysis panel appears at top
- PDF panel appears below
- Both remain scrollable
