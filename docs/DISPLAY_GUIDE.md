# Display Structure Guide

This guide explains the frontend display architecture of the Resume Analyzer application.

## Page Structure

The application consists of three main pages:

### 1. Home Page (Form Page)
**Route**: `/`
**Component**: `src/App.js`

#### Layout
- Header with application title
- Single card container with form
- Form fields in vertical layout

#### Form Fields
1. **Job Title** (required)
   - Text input
   - Purpose: Identifies the target position

2. **Company URL** (optional)
   - URL input with placeholder
   - Purpose: Provides context for AI research

3. **Job Description** (required)
   - Textarea
   - Purpose: Full job posting for analysis

4. **Resume PDF** (required)
   - File input, accepts only PDF
   - Purpose: User's current resume

5. **Submit Button**
   - Shows "Analyzing..." during processing
   - Disabled while loading

#### States
- **Loading**: Button shows spinner, form disabled
- **Error**: Red error message above form
- **Success**: Navigates to Analysis page

### 2. Analysis Page
**Route**: `/analysis`
**Component**: `src/pages/AnalysisPage.js`

#### Layout
Split-panel view with header:
- **Header**: Title + Back button
- **Left Panel**: Feedback and analysis
- **Right Panel**: LaTeX editor

#### Left Panel (Feedback)
Scrollable analysis cards:

1. **Overall Score Card**
   - Large circular score indicator
   - Color-coded: Green (80+), Orange (60-79), Red (<60)

2. **Category Scores Card**
   - Multiple progress bars
   - Each shows category name and score
   - Color-coded like overall score

3. **Strengths Card**
   - Green checkmark list items
   - Bullet points with positive aspects

4. **Improvement Areas Card**
   - Orange warning icon list items
   - Bullet points with suggestions

5. **Keyword Recommendations Card**
   - Purple gradient pills
   - Hover effect with lift animation

6. **Tailored Bullets Card**
   - Arrow icon list items
   - Suggested achievement statements

7. **ATS Tips Card**
   - Lightbulb icon list items
   - Optimization suggestions

8. **Learning Plan Card** (if provided)
   - Quick wins section (1-2 weeks)
   - Medium horizon section (1-2 months)
   - Badges indicating timeframe

9. **Company Insights Card** (if provided)
   - Key highlights list
   - Source links

10. **Summary Card**
    - Purple gradient box
    - Overall assessment text

#### Right Panel (LaTeX Editor)
- **Editor Header**
  - Title: "Suggested Resume (LaTeX)"
  - Copy button (green)
  - Download button (blue)

- **Monaco Editor**
  - Full-height code editor
  - LaTeX syntax highlighting
  - Line numbers
  - Word wrap enabled
  - Auto theme switching

### 3. PDF Page (Legacy)
**Route**: `/pdf`
**Component**: `src/pages/PDFPage.js`

This page is retained for backwards compatibility but not used in the LaTeX workflow.

## Responsive Design

### Desktop (> 1200px)
- Split panel side-by-side
- 50/50 width distribution
- Full viewport height minus header

### Tablet (768px - 1200px)
- Vertical stacking
- Feedback panel on top
- LaTeX editor below
- Each section full width

### Mobile (< 768px)
- Vertical stacking
- Reduced font sizes
- Smaller score circles
- Single column layout

## Color Scheme

### Light Mode
- Background Primary: `#f0f2f5`
- Background Secondary: `#ffffff`
- Text Primary: `#333333`
- Accent Blue: `#1890ff`
- Accent Green: `#10b981`
- Accent Orange: `#f59e0b`
- Accent Red: `#ef4444`

### Dark Mode
- Background Primary: `#1a1a1a`
- Background Secondary: `#2d2d2d`
- Text Primary: `#e5e5e5`
- Accent Blue: `#3b9eff`
- Accent Green: `#34d399`
- Accent Orange: `#fbbf24`
- Accent Red: `#f87171`

## Component Hierarchy

```
App (Main Router)
├── Home (/)
│   └── Form Component (inline)
│
├── AnalysisPage (/analysis)
│   ├── Header
│   ├── Results Split Layout
│   │   ├── Feedback Panel
│   │   │   └── Multiple Analysis Cards
│   │   └── LaTeX Panel
│   │       └── LatexEditor Component
│   │           ├── Editor Header
│   │           └── Monaco Editor
│
└── PDFPage (/pdf) [Legacy]
    └── PDF Viewer
```

## CSS Classes

### Layout Classes
- `.App` - Main container
- `.App-header` - Page header
- `.results-split-layout` - Split panel container
- `.feedback-panel` - Left panel for analysis
- `.latex-panel` - Right panel for editor

### Card Classes
- `.card` - Standard card container
- `.analysis-card` - Analysis section card
- `.form-group` - Form field group

### Button Classes
- `.submit-btn` - Primary action button
- `.back-btn` - Navigation button
- `.download-btn` - Download action button
- `.copy-btn` - Copy action button

### Score Display Classes
- `.score-circle` - Circular score indicator
- `.progress-track` - Progress bar background
- `.progress-fill` - Progress bar fill
- `.category-label` - Category name
- `.score-value` - Score number

### List Classes
- `.strengths-list` - Green checkmark list
- `.improvement-list` - Orange warning list
- `.bullets-list` - Arrow icon list
- `.tips-list` - Lightbulb icon list

### Special Classes
- `.keyword-pill` - Keyword tag
- `.summary-box` - Summary gradient box
- `.learning-section` - Learning plan section
- `.badge-quick` - Quick wins badge
- `.badge-medium` - Medium horizon badge

## State Management

### React Router State
Data passed between pages via `navigate()`:

**To Analysis Page**:
```javascript
{
  analysisData: {...},  // Analysis scores and feedback
  latexCode: "...",     // LaTeX document code
  hasLatex: true/false  // LaTeX presence flag
}
```

### Component State
**AnalysisPage**:
- No internal state (uses router state)

**LatexEditor**:
- `latexCode` - Current editor content
- `theme` - Editor theme (vs-dark/vs-light)

**App (Home)**:
- `loading` - Submission in progress
- `error` - Error message
- `formData` - Form field values

## Rendering Logic

### Conditional Rendering

Analysis cards only render if data exists:
```javascript
{analysisData.overall_score !== undefined && (
  <div className="analysis-card">
    {/* Score display */}
  </div>
)}
```

LaTeX panel only renders if code exists:
```javascript
{hasLatex && latexCode && (
  <div className="latex-panel">
    <LatexEditor initialCode={latexCode} />
  </div>
)}
```

### Dynamic Styling

Scores use dynamic colors:
```javascript
const color = score >= 80 ? '#10b981' :
              score >= 60 ? '#f59e0b' :
              '#ef4444';
```

Progress bars use dynamic width:
```javascript
<div style={{ width: `${score}%`, backgroundColor: color }}></div>
```

## Navigation Flow

```
Home (/)
  |
  | [Submit Form]
  |
  v
Analysis (/analysis)
  |
  | [Back Button]
  |
  v
Home (/)
```

## Error States

### No Data
If user navigates directly to `/analysis` without data:
- Redirects to home page
- Prevents crash from missing state

### Missing LaTeX
If analysis data exists but no LaTeX:
- Shows only feedback panel
- Hides LaTeX editor
- Logs warning to console

### Network Error
If webhook request fails:
- Shows error message in form
- Keeps form data intact
- Allows retry

## Accessibility

### Keyboard Navigation
- Form fields tab in logical order
- Buttons accessible via keyboard
- Editor supports full keyboard navigation

### Screen Readers
- Semantic HTML elements
- Proper heading hierarchy
- Label associations for form fields
- Alt text for icons (via aria-label)

### Focus Management
- Visible focus indicators
- Logical tab order
- Focus trap in modals (if added)

## Performance Considerations

### Code Splitting
Monaco Editor is code-split automatically by webpack.

### Lazy Loading
Consider lazy loading:
```javascript
const LatexEditor = lazy(() => import('./components/LatexEditor'));
```

### Memoization
Large lists can use React.memo():
```javascript
const AnalysisCard = React.memo(({ data }) => {
  // Render card
});
```

## Future UI Enhancements

Potential improvements:
- Tabs for different analysis views
- Collapsible card sections
- PDF preview of compiled LaTeX
- Template selection dropdown
- Export options (PDF, Word, Overleaf)
- Progress indicator during analysis
- Toast notifications for actions
- Print-friendly view
