# LaTeX Workflow Guide

This guide explains how the LaTeX-based resume workflow operates in the Resume Analyzer application.

## Overview

The webapp receives LaTeX code from the n8n webhook and displays it in an interactive editor where users can:
- View the suggested LaTeX resume code
- Edit the code directly in the browser
- Copy the code to clipboard
- Download as a .tex file for compilation

## Workflow Steps

### 1. User Input
Users provide:
- **Job Title**: Position they're applying for
- **Company URL** (optional): Used for AI research on company culture and pain points
- **Job Description**: Full job posting text
- **Resume PDF**: Their current resume

### 2. Webhook Processing
The form data is sent to n8n webhook which:
- Analyzes the resume against the job description
- Generates scoring and feedback
- Creates a suggested LaTeX resume template tailored to the job

### 3. Response Format

The webhook returns JSON with two main components:

#### Analysis Data
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
    "Strong technical skills section",
    "Clear quantifiable achievements"
  ],
  "improvement_areas": [
    "Add more industry-specific keywords",
    "Include measurable impact metrics"
  ],
  "keyword_recommendations": ["React", "Node.js", "AWS", "CI/CD"],
  "tailored_bullets": [
    "Led development of microservices architecture using Node.js and AWS",
    "Implemented CI/CD pipeline reducing deployment time by 60%"
  ],
  "ats_tips": [
    "Use standard section headers",
    "Include relevant certifications",
    "Optimize keyword density"
  ],
  "summary": "Your resume shows strong technical capabilities..."
}
```

#### LaTeX Code
The webhook can provide LaTeX in two fields (either works):
- `latex`: Full LaTeX document code
- `latex_code`: Full LaTeX document code

Example:
```latex
\documentclass[11pt,a4paper]{article}
\usepackage[utf8]{inputenc}
\usepackage[margin=1in]{geometry}

\begin{document}

\section*{John Doe}
\textit{Senior Software Engineer}

\section*{Experience}
\textbf{Software Engineer} - Tech Company (2020-Present)
\begin{itemize}
    \item Led development of microservices architecture using Node.js and AWS
    \item Implemented CI/CD pipeline reducing deployment time by 60\%
\end{itemize}

\end{document}
```

### 4. Frontend Display

The AnalysisPage component displays a split view:

**Left Panel (Feedback)**:
- Overall score with color-coded circle
- Category scores with progress bars
- Strengths (green checkmarks)
- Improvement areas (orange warnings)
- Keyword recommendations (purple pills)
- Tailored bullet points
- ATS optimization tips
- Summary box

**Right Panel (LaTeX Editor)**:
- Monaco Editor with LaTeX syntax highlighting
- Automatic dark/light theme switching
- Copy to clipboard button
- Download as .tex button
- Real-time editing

## LaTeX Editor Component

### Features
- **Syntax Highlighting**: Full LaTeX language support
- **Theme Support**: Automatically switches between light/dark based on system preferences
- **Line Numbers**: Enabled for easy navigation
- **Word Wrap**: Enabled for better readability
- **No Minimap**: Simplified view for focus
- **Auto Layout**: Responsive to container size changes

### Actions

#### Copy to Clipboard
Copies the entire LaTeX code to clipboard with confirmation alert.

#### Download .tex File
Downloads the LaTeX code as `resume.tex` file that can be:
- Compiled locally with LaTeX distribution (TeX Live, MiKTeX)
- Uploaded to Overleaf for online compilation
- Edited in LaTeX IDE (TeXworks, TeXstudio)

## Compiling LaTeX

Users can compile the downloaded .tex file using:

### Local Compilation
```bash
pdflatex resume.tex
```

### Online Compilation
- Upload to [Overleaf](https://www.overleaf.com)
- Upload to [ShareLaTeX](https://www.sharelatex.com)
- Use [LaTeX.Online](https://latexonline.cc)

## Response Format Variations

The webhook response handler supports multiple formats:

### Format 1: Array with Stringified Output
```json
[
  {
    "output": "{\"overall_score\": 85, ...}",
    "latex": "\\documentclass{article}..."
  }
]
```

### Format 2: Direct Object
```json
{
  "overall_score": 85,
  "category_scores": {...},
  "latex": "\\documentclass{article}..."
}
```

### Format 3: Array with Direct Objects
```json
[
  {
    "overall_score": 85,
    "category_scores": {...},
    "latex_code": "\\documentclass{article}..."
  }
]
```

## Error Handling

If LaTeX code is not found in the response:
- A warning is logged to console
- The analysis panel still displays (if analysis data exists)
- The LaTeX panel is hidden
- User sees feedback without editor

## Customization

### Change Editor Theme
The editor automatically detects system theme, but can be customized in `LatexEditor.js`:
```javascript
const [theme, setTheme] = useState('vs-dark'); // or 'vs-light'
```

### Editor Options
Modify editor behavior in `LatexEditor.js`:
```javascript
options={{
    minimap: { enabled: false },
    fontSize: 14,
    wordWrap: 'on',
    lineNumbers: 'on',
    scrollBeyondLastLine: false,
    automaticLayout: true,
    tabSize: 2,
}}
```

## Integration Notes

### Adding LaTeX to n8n Workflow

Your n8n workflow should:
1. Parse the uploaded resume PDF
2. Analyze content against job description and company research
3. Generate scoring metrics
4. Create LaTeX template with tailored content
5. Return JSON with both analysis and LaTeX fields

### LaTeX Template Tips

For ATS-friendly LaTeX resumes:
- Use standard section headers: Experience, Education, Skills
- Avoid complex formatting (tables, graphics)
- Use standard fonts (Computer Modern, Times, Helvetica)
- Keep to 1-2 pages
- Use bullet points for achievements
- Include keywords naturally

## Troubleshooting

### LaTeX Panel Not Showing
- Check browser console for warnings
- Verify webhook response includes `latex` or `latex_code` field
- Ensure JSON is properly formatted

### Editor Not Loading
- Check Monaco Editor installation: `npm list @monaco-editor/react`
- Verify no conflicting CSS
- Check browser console for errors

### Dark Mode Not Working
- Verify system theme preferences are set
- Check browser supports `prefers-color-scheme` media query
- Test with manual theme toggle

## Future Enhancements

Potential improvements:
- PDF preview of compiled LaTeX
- Multiple LaTeX templates (modern, traditional, academic)
- LaTeX compilation in-browser using LaTeX.js
- Version history for edits
- Template customization options
- Export to Overleaf directly
