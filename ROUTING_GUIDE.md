# Routing & Dark Mode Guide

## Application Structure

The app now uses **React Router** with 3 separate pages for clean separation of concerns.

### Routes

```
/ (Home)           → Form page - upload resume and job details
/analysis          → Analysis page - view JSON insights
/pdf               → PDF page - view improved resume
```

## Navigation Flow

```
┌─────────────┐
│   / (Home)  │  User fills form and submits
└──────┬──────┘
       │
       ↓ Webhook returns JSON + PDF
       │
┌──────┴────────────┐
│   /analysis       │  Shows insights with "View Improved Resume" button
└──────┬────────────┘
       │
       ↓ User clicks "View Improved Resume"
       │
┌──────┴────────────┐
│   /pdf            │  Shows improved resume with "Back to Analysis" button
└───────────────────┘
```

## Page Components

### 1. Home Page (`/` - App.js)

**Purpose:** Form submission and webhook handling

**Features:**
- Job title input
- Company URL input (optional)
- Job description textarea
- Resume file upload
- Loading states during analysis
- Error handling

**After submission:**
- Parses webhook response
- Extracts analysis JSON and PDF data
- Navigates to `/analysis` with data passed via React Router state

---

### 2. Analysis Page (`/analysis` - AnalysisPage.js)

**Purpose:** Display all analysis insights

**Features:**
- Overall score (color-coded circle)
- Category scores (progress bars)
- Strengths (green checkmarks)
- Improvement areas (orange warnings)
- Keyword recommendations (purple pills)
- Tailored bullet points
- ATS tips
- Learning plan (quick wins & medium horizon)
- Company insights with sources
- Summary box

**Navigation:**
- "Back to Form" button → returns to `/`
- "View Improved Resume" button → navigates to `/pdf` (only shown if PDF available)

**Data source:**
- Receives `analysisData` and `pdfUrl` from React Router state
- Redirects to `/` if no data available

---

### 3. PDF Page (`/pdf` - PDFPage.js)

**Purpose:** Display the improved resume PDF

**Features:**
- Full PDF viewer with all pages
- Scroll through multi-page resumes
- Download button to save PDF locally

**Navigation:**
- "Back to Analysis" button → returns to `/analysis`
- Download button → saves PDF to device

**Data source:**
- Receives `pdfUrl` from React Router state
- Supports blob URLs, HTTP URLs, and base64 data
- Redirects to `/` if no PDF URL available

---

## Dark Mode Implementation

### System-Synced Theme

The app automatically matches your device's theme preference:

```css
/* Light mode (default) */
:root {
  --bg-primary: #f0f2f5;
  --text-primary: #333333;
  ...
}

/* Dark mode (auto-detected) */
@media (prefers-color-scheme: dark) {
  :root {
    --bg-primary: #1a1a1a;
    --text-primary: #e5e5e5;
    ...
  }
}
```

### How It Works

1. **CSS Variables:** All colors use CSS custom properties (variables)
2. **Media Query:** `prefers-color-scheme: dark` detects system preference
3. **Automatic:** No toggle needed - syncs with your OS settings
4. **Smooth:** All elements have 0.3s transition for seamless switching

### Supported Elements

✅ Background colors
✅ Text colors
✅ Border colors
✅ Button styles
✅ Card backgrounds
✅ Form inputs
✅ Links and accents
✅ Shadows and overlays
✅ Progress bars
✅ Keyword pills
✅ Summary boxes

### Testing Dark Mode

**macOS:**
- System Preferences → General → Appearance → Dark

**Windows:**
- Settings → Personalization → Colors → Choose your color → Dark

**Browser DevTools:**
- Open DevTools (F12)
- Cmd/Ctrl + Shift + P
- Type "Rendering"
- Find "Emulate CSS media feature prefers-color-scheme"
- Select "prefers-color-scheme: dark"

---

## Data Flow

### Webhook Response → Analysis Page

```javascript
// App.js handles webhook response
const response = await fetch(WEBHOOK_URL, { method: 'POST', body: formData });
const jsonData = await response.json();

// Parse analysis
const analysisJson = JSON.parse(jsonData[0].output);

// Navigate with data
navigate('/analysis', {
  state: {
    analysisData: analysisJson,
    pdfUrl: pdfUrl,
    hasPdf: !!pdfUrl
  }
});
```

### Analysis Page → PDF Page

```javascript
// AnalysisPage.js
<Link
  to="/pdf"
  state={{ pdfUrl: location.state.pdfUrl }}
  className="view-pdf-btn"
>
  View Improved Resume
</Link>
```

### Data Persistence

⚠️ **Important:** Data is passed via React Router state, not localStorage

- Data exists only during the session
- Refreshing `/analysis` or `/pdf` will redirect to `/`
- Users must re-submit the form if they refresh
- This prevents stale data from being displayed

---

## Benefits of Multi-Page Routing

### 1. Clean Separation

Each page has a single, clear purpose:
- `/` = Input
- `/analysis` = Insights
- `/pdf` = Visual result

### 2. Better UX

- Users can focus on one thing at a time
- Natural navigation flow
- Easier to understand and navigate
- Back/forward browser buttons work

### 3. Performance

- Only loads components when needed
- Analysis page doesn't load PDF viewer
- PDF page doesn't render analysis cards
- Faster initial page loads

### 4. Maintainability

- Each page is a separate component
- Easier to debug and test
- Can update one page without affecting others
- Clear data flow between pages

---

## Browser Support

- Chrome/Edge: ✅ Full support
- Firefox: ✅ Full support
- Safari: ✅ Full support
- Mobile browsers: ✅ Responsive design

### React Router Version

Uses `react-router-dom@6` with:
- `<BrowserRouter>` for HTML5 history
- `<Routes>` and `<Route>` for route definitions
- `useNavigate()` for programmatic navigation
- `useLocation()` for accessing route state
- `<Link>` for declarative navigation

---

## Troubleshooting

### "Page not found" on refresh

**Problem:** Direct URL access to `/analysis` or `/pdf` shows blank page

**Solution:** This is expected behavior - data is passed via router state. Users must start from `/` and submit the form.

### Dark mode not working

**Problem:** Colors don't change with system theme

**Solution:**
1. Check browser supports `prefers-color-scheme`
2. Verify OS theme is actually changing
3. Hard refresh (Cmd/Ctrl + Shift + R)
4. Check browser DevTools for CSS variable values

### PDF not displaying

**Problem:** PDF page shows error or blank

**Solution:**
1. Check webhook returns `pdf_url` or `pdf_data`
2. Verify URL is publicly accessible (not blocked by CORS)
3. Check browser console for PDF.js errors
4. Ensure PDF worker is properly configured

---

## Future Enhancements

Potential improvements:

1. **State Management:** Use Context API or Redux for global state
2. **Persistence:** Save analysis to localStorage for refresh recovery
3. **History:** Store previous analyses for comparison
4. **Export:** Download analysis as JSON or markdown
5. **Sharing:** Generate shareable links with analysis ID
6. **Manual Dark Mode Toggle:** Add user preference override
