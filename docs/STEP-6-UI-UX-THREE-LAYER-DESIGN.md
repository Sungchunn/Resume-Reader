# STEP 6 — UI/UX THREE-LAYER STRUCTURE SPECIFICATION
**Status:** Ready for Implementation
**Version:** 1.0.0
**Last Updated:** 2025-11-07
**Coordinator:** Project Planning Team

---

## PURPOSE
Define the complete UI/UX architecture for the three-layer resume analysis interface: feedback summary (upper), LaTeX editor (left), and PDF preview (right). This document provides layout specifications, interaction flows, and design requirements WITHOUT implementation code.

---

## ARCHITECTURAL OVERVIEW

```
┌────────────────────────────────────────────────────────────────────────┐
│                         HEADER (Fixed)                                  │
│  Logo | Resume Analysis Results          [Back to Form] [Environment]  │
└────────────────────────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────────────────────────┐
│                     FEEDBACK PANEL (Upper Layer)                        │
│  [Overall Score: 85]  [Category Scores]  [Strengths]  [Improvements]  │
│  ▼ Collapse/Expand                                                      │
└────────────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────┬──────────────────────────────────────┐
│     LATEX EDITOR (Left Panel)   │    PDF PREVIEW (Right Panel)         │
│                                  │                                       │
│  [Copy] [Download .tex]          │  [Download PDF] [Zoom Controls]      │
│  ┌──────────────────────────┐   │  ┌──────────────────────────────┐   │
│  │ \documentclass{article}  │   │  │                               │   │
│  │ \begin{document}         │   │  │     [PDF PREVIEW]             │   │
│  │ ...                      │   │  │                               │   │
│  │ \end{document}           │   │  │                               │   │
│  │                          │   │  │                               │   │
│  │   [LaTeX Source Code]    │   │  │   [Rendered PDF]              │   │
│  │                          │   │  │                               │   │
│  │                          │   │  │                               │   │
│  └──────────────────────────┘   │  └──────────────────────────────┘   │
│  Status: ● Compiling...          │  Page 1 of 2                         │
└─────────────────────────────────┴──────────────────────────────────────┘
```

---

## LAYER 1: FEEDBACK PANEL (Upper Layer)

### Purpose
Display resume evaluation results in a scannable, actionable format.

### Layout Specifications

**Positioning:**
- Location: Top of page, below fixed header
- Width: 100% of viewport
- Initial State: Expanded (showing all sections)
- Collapsible: Yes, via toggle button

**Responsive Behavior:**
- Desktop (> 1024px): Horizontal layout, all sections visible
- Tablet (768-1024px): Vertical layout, sections stack
- Mobile (< 768px): Accordion format, one section at a time

---

### Section 1.1: Overall Score

**Visual Design:**
```
┌─────────────────────────────────┐
│        Overall Score             │
│                                  │
│        ┌──────────┐              │
│        │    85    │              │
│        │  /100    │              │
│        └──────────┘              │
│                                  │
│   Strong resume with minor       │
│   improvements needed            │
└─────────────────────────────────┘
```

**Design Requirements:**
- Score displayed in circular badge
- Color coding:
  - 90-100: Green (#10b981)
  - 80-89: Light green (#84cc16)
  - 70-79: Yellow (#f59e0b)
  - 60-69: Orange (#fb923c)
  - 0-59: Red (#ef4444)
- Font size: 48px for score, 14px for label
- Summary text below (if provided in data)

---

### Section 1.2: Category Scores

**Visual Design:**
```
┌─────────────────────────────────┐
│      Category Breakdown          │
│                                  │
│  Formatting           90  ████▓ │
│  Content Quality      85  ████░ │
│  Keyword Optimization 75  ███░░ │
│  ATS Compatibility    88  ████▓ │
└─────────────────────────────────┘
```

**Design Requirements:**
- Horizontal progress bars for each category
- Same color coding as overall score
- Category names left-aligned
- Scores right-aligned
- Progress bar: 200px width, 12px height
- Rounded corners (4px border radius)
- Smooth animation when values update

**Data Binding:**
- Source: `analysisData.category_scores`
- Dynamic categories (not hardcoded)
- Handle missing categories gracefully

---

### Section 1.3: Strengths

**Visual Design:**
```
┌─────────────────────────────────┐
│  ✅ Strengths                    │
│                                  │
│  • Strong quantifiable           │
│    achievements throughout       │
│  • Excellent action verb usage   │
│  • Clear career progression      │
└─────────────────────────────────┘
```

**Design Requirements:**
- Green checkmark icon (✅) in header
- Bullet list format
- Green accent color (#10b981)
- Maximum 5 items displayed
- "Show more" link if > 5 items

**Data Binding:**
- Source: `analysisData.strengths`
- Array of strings
- Empty state: "No specific strengths identified"

---

### Section 1.4: Improvement Areas

**Visual Design:**
```
┌─────────────────────────────────┐
│  ⚠️ Areas for Improvement        │
│                                  │
│  • Add more industry keywords    │
│  • Include professional summary  │
│  • Expand on leadership roles    │
└─────────────────────────────────┘
```

**Design Requirements:**
- Warning icon (⚠️) in header
- Bullet list format
- Orange accent color (#f59e0b)
- Actionable language (not just criticism)
- Maximum 5 items displayed

**Data Binding:**
- Source: `analysisData.improvement_areas`
- Array of strings
- Empty state: "No major improvements needed"

---

### Section 1.5: Expandable Sections (Accordion)

**Additional Sections (Collapsed by Default):**

1. **Tailored Bullets** (if present)
   - Source: `analysisData.tailored_bullets`
   - Show suggested resume bullet points
   - Copy button for each bullet

2. **Keyword Recommendations** (if present)
   - Source: `analysisData.keyword_recommendations`
   - Display as pills/badges
   - Click to copy individual keyword

3. **ATS Tips** (if present)
   - Source: `analysisData.ats_tips`
   - Numbered list format
   - Blue accent color (#3b82f6)

4. **Learning Plan** (if present)
   - Source: `analysisData.gaps_and_learning_plan`
   - Two subsections: Quick Wins, Medium Horizon
   - Timeline badges (⚡ Quick, 🎯 Medium)

5. **Company Insights** (if present)
   - Source: `analysisData.company_insights`
   - Highlights + clickable source links
   - Only shown if company_url was provided

**Accordion Behavior:**
- Click section header to expand/collapse
- Smooth animation (300ms ease-in-out)
- Arrow icon rotates when expanded
- Only one section expanded at a time (optional)

---

### Collapse/Expand Toggle

**Button Placement:** Top-right of feedback panel

**States:**
- **Expanded:** "▲ Hide Feedback"
- **Collapsed:** "▼ Show Feedback"

**Collapsed State Behavior:**
- Only show overall score (compact)
- Reduce panel height to ~100px
- Slide animation (300ms)
- Persist state in sessionStorage

---

## LAYER 2: LATEX EDITOR (Left Panel)

### Purpose
Allow real-time editing of generated LaTeX resume source code.

### Layout Specifications

**Positioning:**
- Location: Bottom-left of page
- Width: 50% of viewport (adjustable with resize handle)
- Height: Viewport height minus header and feedback panel
- Min width: 400px
- Max width: 70% of viewport

---

### Editor Header

**Visual Design:**
```
┌──────────────────────────────────────────────┐
│  📝 LaTeX Editor  [Copy] [Download .tex]     │
└──────────────────────────────────────────────┘
```

**Buttons:**

1. **Copy Code**
   - Icon: 📋 or copy icon
   - Action: Copy entire LaTeX source to clipboard
   - Feedback: Toast notification "Copied to clipboard"

2. **Download .tex**
   - Icon: ⬇️ or download icon
   - Action: Download as `resume.tex`
   - Filename: User can customize in future enhancement

---

### Editor Component

**Technology Recommendation:**
- Monaco Editor (VS Code engine) - already in use
- Language: LaTeX syntax highlighting
- Theme: Dark mode (vs-dark) or Light mode (vs-light)
- Font: Monospace, 13px

**Editor Features:**

1. **Syntax Highlighting**
   - LaTeX commands: blue
   - Comments: green
   - Strings: red
   - Environments: purple

2. **Auto-completion** (Optional Enhancement)
   - Common LaTeX commands
   - Environment pairs (\begin{...} \end{...})
   - Package names

3. **Line Numbers**
   - Always visible
   - Click to select line

4. **Word Wrap**
   - Enabled by default
   - Toggle in editor settings (right-click menu)

5. **Find & Replace**
   - Keyboard shortcut: Cmd/Ctrl + F
   - Case sensitive option
   - Regex support

**Editor Options (Monaco Config):**
```
{
  minimap: { enabled: false },
  fontSize: 13,
  wordWrap: 'on',
  lineNumbers: 'on',
  scrollBeyondLastLine: false,
  automaticLayout: true,
  tabSize: 2,
  theme: 'vs-dark' // or 'vs-light'
}
```

---

### Editor Status Bar

**Position:** Bottom of editor panel

**Content:**
```
┌──────────────────────────────────────────────┐
│  ● Compiling...          Line 42, Col 18     │
└──────────────────────────────────────────────┘
```

**Status Indicators:**

| State | Indicator | Color |
|-------|-----------|-------|
| Idle | ● Ready | Gray |
| Compiling | ● Compiling... (animated) | Blue |
| Success | ✓ Compiled | Green |
| Error | ✗ Error | Red |

**Right Side:**
- Current cursor position (line, column)
- File size (optional)

---

### Real-time Compilation Trigger

**Behavior:**
1. User types in editor
2. onChange event fires
3. Debouncer starts 500ms countdown
4. If user types again before 500ms: reset countdown
5. After 500ms of inactivity: trigger compilation
6. Show "Compiling..." status
7. Send POST request to backend
8. Update PDF preview when response arrives

**Visual Feedback During Compilation:**
- Status bar shows "● Compiling..."
- Subtle blue glow on editor border (optional)
- Cursor remains editable (don't lock editor)

---

## LAYER 3: PDF PREVIEW (Right Panel)

### Purpose
Display real-time rendered PDF of LaTeX source code.

### Layout Specifications

**Positioning:**
- Location: Bottom-right of page
- Width: 50% of viewport (adjustable with resize handle)
- Height: Same as LaTeX editor
- Min width: 400px
- Max width: 70% of viewport

---

### Preview Header

**Visual Design:**
```
┌──────────────────────────────────────────────┐
│  📄 LaTeX Preview  [−] [100%] [+] [Download] │
└──────────────────────────────────────────────┘
```

**Controls:**

1. **Zoom Out Button (−)**
   - Decrease zoom by 25%
   - Min zoom: 50%

2. **Zoom Level Display (100%)**
   - Click to show dropdown:
     - Fit to Width
     - Fit to Page
     - 50%
     - 75%
     - 100%
     - 125%
     - 150%
     - 200%

3. **Zoom In Button (+)**
   - Increase zoom by 25%
   - Max zoom: 200%

4. **Download PDF Button**
   - Icon: ⬇️
   - Download current compiled PDF
   - Filename: `resume.pdf`

---

### Preview Content Area

**PDF Rendering:**
- Library: react-pdf (already in use)
- Display: Vertical scroll (all pages)
- Background: Light gray (#f3f4f6)
- Page border: 1px solid #d1d5db
- Page shadow: Subtle drop shadow

**Multi-page Display:**
```
┌──────────────────────┐
│                       │
│    [Page 1 Content]   │
│                       │
└──────────────────────┘

        Page 1 of 2

┌──────────────────────┐
│                       │
│    [Page 2 Content]   │
│                       │
└──────────────────────┘

        Page 2 of 2
```

**Page Number Indicator:**
- Position: Below each page
- Format: "Page X of Y"
- Center-aligned
- Font: 12px, gray

---

### Preview Loading States

**1. Initial Load (First Compilation):**
```
┌────────────────────────────────┐
│                                 │
│          [Spinner]              │
│     Loading preview...          │
│                                 │
│  Your resume will appear here   │
│  shortly.                       │
│                                 │
└────────────────────────────────┘
```

**2. Updating (Subsequent Compilations):**
```
┌────────────────────────────────┐
│                                 │
│  [Previous PDF visible]         │
│                                 │
│  [Subtle overlay]               │
│  ↻ Updating...                  │
│                                 │
└────────────────────────────────┘
```

**3. Error State:**
```
┌────────────────────────────────┐
│         ⚠️ Compilation Error    │
│                                 │
│  Line 10: Undefined control     │
│  sequence \fakecommand          │
│                                 │
│  Tip: Check spelling and        │
│  package imports                │
│                                 │
│  [View Full Logs] [Dismiss]     │
│                                 │
│  [Previous PDF still visible    │
│   below this overlay]           │
└────────────────────────────────┘
```

**4. Preview Unavailable:**
```
┌────────────────────────────────┐
│       📄 Preview Unavailable    │
│                                 │
│  LaTeX compilation backend is   │
│  currently unavailable.         │
│                                 │
│  Options:                       │
│  • Download .tex and compile    │
│    locally                      │
│  • Use Overleaf online          │
│  • Copy code to your editor     │
│                                 │
│  [Download .tex] [Copy Code]    │
└────────────────────────────────┘
```

---

## RESPONSIVE DESIGN BREAKPOINTS

### Desktop (> 1024px)

**Layout:**
- Feedback panel: Full width, horizontal sections
- Editor: 50% width, left side
- Preview: 50% width, right side
- Resizable panels with drag handle

**Feedback Panel:**
- All sections visible in grid layout
- 2 columns for strengths/improvements

---

### Tablet (768px - 1024px)

**Layout:**
- Feedback panel: Full width, vertical sections
- Editor: Full width, tabs to switch to preview
- OR: 40% editor, 60% preview (side-by-side)

**Feedback Panel:**
- Vertical stack
- Category scores: Horizontal bars (shorter)

---

### Mobile (< 768px)

**Layout:**
- Feedback panel: Full width, accordion format
- Editor and Preview: Tabbed interface
  - Tab 1: LaTeX Editor
  - Tab 2: PDF Preview
  - Cannot view both simultaneously

**Feedback Panel:**
- Collapsed by default (show only overall score)
- Expand to see details
- One section at a time (accordion)

**Tabs:**
```
┌─────────────────────────────────┐
│ [📝 Editor] | [ PDF Preview]    │
├─────────────────────────────────┤
│                                  │
│  [Active tab content]            │
│                                  │
└─────────────────────────────────┘
```

---

## NAVIGATION & USER FLOW

### Entry Point: After Resume Upload

```
User Flow:
1. User uploads resume on home page
2. Backend processes and returns analysis + LaTeX
3. Navigate to /analysis route
4. Show loading indicator during navigation
5. Render three-layer interface
6. Auto-compile LaTeX on mount
7. Display feedback and preview simultaneously
```

---

### Navigation Between Layers

**Feedback Panel:**
- Always visible (can be collapsed)
- Scroll independently from editor/preview
- Sticky/fixed position option (enhancement)

**Editor ↔ Preview:**
- No navigation needed (both visible)
- Resize handle for adjusting panel widths
- Double-click resize handle to reset to 50/50

**Back Button:**
- Header: "← Back to Form"
- Action: Navigate to home page (/)
- Warning: "Unsaved changes will be lost" (if edited)

---

## INTERACTION PATTERNS

### Resize Handle Between Panels

**Visual Design:**
```
│  LaTeX Editor  │║│  PDF Preview  │
                  ↕
              (drag handle)
```

**Behavior:**
- Position: Between editor and preview panels
- Width: 8px, center line visible
- Cursor: ↔ (col-resize cursor)
- Drag to adjust panel widths
- Min width: 400px for each panel
- Snap to 50/50 when near center
- Store preference in sessionStorage

---

### Smooth Transitions

**Panel Resize:**
- Transition: width 200ms ease-out
- Editor and preview adjust simultaneously

**Feedback Panel Collapse/Expand:**
- Transition: max-height 300ms ease-in-out
- Rotate arrow icon 180deg

**PDF Update:**
- Transition: opacity 100ms
- Fade out old PDF, fade in new PDF

---

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Cmd/Ctrl + S | Download .tex file |
| Cmd/Ctrl + Shift + C | Copy LaTeX code |
| Cmd/Ctrl + Shift + P | Download PDF |
| Cmd/Ctrl + F | Find in editor |
| Esc | Collapse feedback panel |

---

## ACCESSIBILITY REQUIREMENTS

### Screen Reader Support

- Feedback panel sections: `<section>` tags with `aria-label`
- Overall score: `aria-live="polite"` for updates
- Compilation status: `aria-live="polite"` announcements
- Button labels: Clear text, not icon-only

### Keyboard Navigation

- All interactive elements: focusable
- Tab order: Logical (header → feedback → editor → preview)
- Focus visible: 2px blue outline
- Skip to content link (optional)

### Color Contrast

- All text: Minimum 4.5:1 contrast ratio
- Score colors: Pass WCAG AA
- Error messages: Not color-only (use icons too)

### Zoom Support

- Support browser zoom up to 200%
- No fixed pixel widths that break layout
- Text remains readable at all zoom levels

---

## ENVIRONMENT INDICATOR (From Step 4)

**Position:** Top-right corner of header

**Display:**
```
┌────────────────────────────────┐
│  Resume Analysis   🔧 Local Dev│
└────────────────────────────────┘
```

**States:**
- Local: "🔧 Local Dev" (gray background)
- Test: "🧪 Test Environment" (yellow background)
- Production: Hidden (no indicator)

---

## ANIMATION & MOTION

### Principles

1. **Subtle, Not Distracting**
   - Quick transitions (100-300ms)
   - Ease-in-out timing
   - No jarring movements

2. **Purposeful**
   - Guide user attention
   - Indicate state changes
   - Provide feedback

3. **Performance**
   - Use CSS transforms (not position changes)
   - GPU-accelerated where possible
   - Reduce motion option (prefers-reduced-motion)

### Specific Animations

**Score Update:**
- Count-up animation from 0 to actual score
- Duration: 1 second
- Easing: ease-out

**Progress Bars:**
- Animate from 0% to target width
- Duration: 800ms
- Easing: ease-in-out

**Panel Collapse:**
- Smooth height transition
- Arrow icon rotation
- Duration: 300ms

**PDF Fade:**
- Cross-fade between old and new PDF
- Duration: 100ms
- Only when updating, not initial load

---

## ACCEPTANCE CRITERIA

- [x] Three-layer layout structure fully specified
- [x] Feedback panel sections defined with data bindings
- [x] LaTeX editor specifications provided (Monaco config, features)
- [x] PDF preview requirements documented (states, controls)
- [x] Responsive breakpoints defined (desktop, tablet, mobile)
- [x] User flow and navigation documented
- [x] Interaction patterns specified (resize, collapse, shortcuts)
- [x] Accessibility requirements outlined
- [x] Animation guidelines provided
- [ ] **Frontend developer implements UI according to spec**
- [ ] **All layouts tested at 3 breakpoints**
- [ ] **Accessibility audit passes**
- [ ] **User testing validates UX flows**

---

## DEVELOPER HANDOFF

**To: Frontend/UI Developer**
**From: Project Coordinator**

**Action Items:**
1. Review current AnalysisPage.js against this specification
2. Implement missing UI features:
   - Collapsible feedback panel
   - Resize handle between editor and preview
   - Zoom controls for PDF
   - Status bar for editor
   - Error overlays for compilation failures
3. Implement responsive breakpoints (desktop, tablet, mobile)
4. Add keyboard shortcuts
5. Conduct accessibility audit
6. User testing with 3-5 test users

**Estimated Effort:** 12-16 hours

**Priority Order:**
1. Core layout (feedback, editor, preview)
2. Real-time compilation integration
3. Error handling UI
4. Responsive design
5. Polish (animations, keyboard shortcuts)

---

## FINAL DELIVERABLE CHECKLIST

### Step 1: JSON Schema
- [x] Schema v1 documented and validated

### Step 2: n8n Output
- [x] n8n output structure reviewed
- [x] Issues listed and ready for developer fix

### Step 3: n8n Prompts
- [x] n8n prompt text refined and aligned with schema

### Step 4: Webhook Routing
- [x] Webhook routing plan finalized
- [x] Environment configuration documented

### Step 5: LaTeX Render Pipeline
- [x] Real-time render specifications clearly defined
- [x] API contracts documented
- [x] Performance targets specified

### Step 6: UI/UX Three-Layer
- [x] Three-layer UI/UX wireframe completed
- [x] Interaction patterns documented
- [x] Responsive design specified
- [x] Developer-ready handoff documentation

---

## PROJECT COORDINATOR SIGN-OFF

**All 6 steps completed and documented.**

**Next Phase:** Developer implementation
- n8n backend developer: Steps 2, 3
- Backend LaTeX developer: Step 5
- Frontend developer: Steps 1, 4, 5, 6
- DevOps engineer: Step 4 (deployment)

**Estimated Total Implementation Time:** 40-50 hours across all teams

**Success Criteria:**
- User uploads resume
- Receives detailed feedback in feedback panel
- Can edit LaTeX in real-time
- See live PDF preview
- Download both .tex and .pdf files
- Works in all 3 environments (local, test, production)

---

**END OF STEP 6**
**END OF PROJECT PLANNING PHASE**
