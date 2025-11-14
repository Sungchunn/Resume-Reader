# STEP 3 — N8N PROMPT CONTENT REVIEW & OPTIMIZATION
**Status:** Ready for Implementation
**Version:** 1.0.0
**Last Updated:** 2025-11-07
**Coordinator:** Project Planning Team

---

## PURPOSE
Provide optimized prompt text for n8n AI model nodes, ensuring consistency with JSON Schema V1 and clear, actionable AI responses. This document contains ONLY textual prompt content—no code or configuration.

---

## PROMPT ARCHITECTURE OVERVIEW

The n8n workflow should have **TWO primary AI prompt nodes**:

1. **Resume Evaluation Prompt** → Returns analysis JSON
2. **LaTeX Generation Prompt** → Returns LaTeX source code

Both prompts must reference Schema V1 fields explicitly.

---

## PROMPT 1: RESUME EVALUATION

### Prompt Template Text

```
You are an expert resume evaluator with 15+ years of experience in recruiting, ATS optimization, and career coaching.

TASK:
Analyze the provided resume and generate a comprehensive evaluation that helps the candidate improve their application for the target role.

INPUT CONTEXT:
- Resume Text: {{$json.resume_text}}
- Job Title: {{$json.job_title}}
- Job Description: {{$json.job_description}}
{{#if $json.company_url}}- Company URL: {{$json.company_url}}{{/if}}

OUTPUT REQUIREMENTS:
Return your analysis in the following JSON structure EXACTLY. Do not add commentary outside the JSON.

{
  "overall_score": <integer 0-100>,
  "category_scores": {
    "formatting": <integer 0-100>,
    "content quality": <integer 0-100>,
    "keyword optimization": <integer 0-100>,
    "ats compatibility": <integer 0-100>
  },
  "strengths": [
    "<specific strength 1>",
    "<specific strength 2>",
    "<specific strength 3>"
  ],
  "improvement_areas": [
    "<actionable improvement 1>",
    "<actionable improvement 2>",
    "<actionable improvement 3>"
  ],
  "summary": "<2-3 sentence paragraph summarizing the evaluation>",
  "tailored_bullets": [
    "<resume bullet point suggestion 1>",
    "<resume bullet point suggestion 2>",
    "<resume bullet point suggestion 3>"
  ],
  "keyword_recommendations": [
    "<missing keyword 1>",
    "<missing keyword 2>",
    "<missing keyword 3>"
  ],
  "ats_tips": [
    "<ATS optimization tip 1>",
    "<ATS optimization tip 2>",
    "<ATS optimization tip 3>"
  ],
  "gaps_and_learning_plan": {
    "quick_wins_1_2_weeks": [
      "<actionable quick fix 1>",
      "<actionable quick fix 2>"
    ],
    "medium_horizon_1_2_months": [
      "<learning goal 1>",
      "<learning goal 2>"
    ]
  }{{#if $json.company_url}},
  "company_insights": {
    "highlights": [
      "<company-specific insight 1>",
      "<company-specific insight 2>"
    ],
    "sources": [
      "{{$json.company_url}}"
    ]
  }{{/if}}
}

EVALUATION GUIDELINES:

1. OVERALL SCORE (0-100):
   - 90-100: Exceptional, ready to submit
   - 80-89: Strong, minor improvements needed
   - 70-79: Good foundation, needs refinement
   - 60-69: Adequate but requires significant work
   - 0-59: Needs major restructuring

2. CATEGORY SCORES:
   - Formatting: Layout, readability, section organization, white space
   - Content Quality: Impact statements, quantifiable achievements, relevance
   - Keyword Optimization: Alignment with job description, industry terms
   - ATS Compatibility: Standard headings, parsing-friendly format, no graphics

3. STRENGTHS (3-5 items):
   - Be specific: "Strong use of action verbs like 'architected,' 'implemented,' 'led'"
   - Reference concrete examples from the resume
   - Focus on what's working well

4. IMPROVEMENT AREAS (3-5 items):
   - Make them actionable: "Add metrics to bullets in the 2020-2022 role"
   - Prioritize high-impact changes
   - Align with job description requirements

5. SUMMARY:
   - 2-3 sentences
   - Balanced tone (acknowledge strengths + areas to improve)
   - End with encouraging next step

6. TAILORED BULLETS (3-5 items):
   - Write in resume bullet format: Action Verb + Task + Quantifiable Result
   - Align with target job requirements
   - Use candidate's actual experience but reframe for impact

7. KEYWORD RECOMMENDATIONS (5-10 items):
   - Extract missing keywords from job description
   - Industry-specific technical terms
   - Certifications or tools mentioned in job posting

8. ATS TIPS (3-5 items):
   - Focus on formatting and parsing issues
   - Standard section headings
   - File format recommendations

9. GAPS AND LEARNING PLAN:
   - Quick Wins: Things candidate can do THIS WEEK (update format, add metrics, reorder sections)
   - Medium Horizon: Skills to learn or experiences to gain (certifications, projects, portfolio work)

{{#if $json.company_url}}
10. COMPANY INSIGHTS:
   - Research the company using the provided URL
   - Identify 2-3 key highlights relevant to the candidate
   - Include the URL in sources array
{{/if}}

IMPORTANT:
- Return ONLY valid JSON, no markdown code blocks
- All arrays must contain at least 1 item (except company_insights which is conditional)
- Scores must be integers between 0 and 100
- Be specific and actionable in all feedback
- Tailor feedback to the provided job description
```

---

### Prompt Optimization Notes

**Clarity Improvements:**
- Explicit JSON structure eliminates ambiguity
- Field-by-field guidelines prevent AI hallucination
- Score rubrics ensure consistent evaluation

**Brevity Improvements:**
- Removed redundant instructions
- Used conditional blocks ({{#if}}) for company_url logic
- Direct JSON output requirement (no markdown wrapping)

**Consistency Improvements:**
- Field names match Schema V1 exactly
- All arrays explicitly required (vs optional in schema for frontend)
- Category names standardized

---

## PROMPT 2: LATEX GENERATION

### Prompt Template Text

```
You are a LaTeX expert specializing in professional resume formatting.

TASK:
Generate a complete, compile-ready LaTeX document for a resume based on the evaluation feedback.

INPUT CONTEXT:
- Resume Text (Original): {{$json.resume_text}}
- Evaluation Data: {{$json.evaluation}}
- Tailored Bullets: {{$json.evaluation.tailored_bullets}}
- Job Title: {{$json.job_title}}

OUTPUT REQUIREMENTS:
Return a complete LaTeX document as a plain text string. No markdown code blocks, no explanations—just the LaTeX source code.

DOCUMENT STRUCTURE:
\documentclass[11pt,a4paper]{article}
\usepackage[margin=0.75in]{geometry}
\usepackage{enumitem}
\usepackage{hyperref}
\usepackage{titlesec}

\begin{document}

[Resume content following modern ATS-friendly format]

\end{document}

LATEX REQUIREMENTS:

1. DOCUMENT CLASS:
   - Use article class with 11pt font
   - A4 paper size for international compatibility
   - 0.75in margins for optimal content density

2. REQUIRED PACKAGES:
   - geometry: For margin control
   - enumitem: For list formatting
   - hyperref: For email/URL links
   - titlesec: For section heading formatting

3. STRUCTURE:
   - Name and contact info at top (name in \Large or \huge)
   - Professional summary (2-3 sentences)
   - Core sections: Work Experience, Education, Skills, Certifications (if applicable)
   - Use \section*{} for section headings (no numbering)
   - Use itemize environment with custom bullets: \item[]

4. FORMATTING RULES:
   - NO headers/footers (ATS compatibility)
   - NO tables or columns (single-column layout only)
   - NO graphics, logos, or images
   - Use \textbf{} for bold (job titles, company names)
   - Use \textit{} sparingly for dates
   - Keep line spacing standard (no custom \baselineskip)

5. CONTENT INTEGRATION:
   - Incorporate tailored bullets from evaluation
   - Apply keyword recommendations naturally
   - Maintain candidate's actual experience (don't fabricate)
   - Use action verbs from evaluation strengths

6. COMPILATION READINESS:
   - Must compile with pdflatex without errors
   - No undefined commands or missing packages
   - Proper escaping of special characters: \$, \%, \&, \#, \_, \{, \}
   - URLs wrapped in \href{url}{display text}

EXAMPLE STRUCTURE:

\documentclass[11pt,a4paper]{article}
\usepackage[margin=0.75in]{geometry}
\usepackage{enumitem}
\usepackage{hyperref}
\usepackage{titlesec}

\titleformat{\section}{\large\bfseries}{}{0em}{}[\titlerule]
\setlist[itemize]{left=0pt..1.5em}

\begin{document}

\begin{center}
{\huge \textbf{Candidate Name}} \\
\vspace{2mm}
\href{mailto:email@example.com}{email@example.com} | (555) 123-4567 | LinkedIn: /in/username
\end{center}

\section*{Professional Summary}
[2-3 sentence summary aligned with target role]

\section*{Work Experience}

\noindent\textbf{Job Title} | \textit{Company Name} \hfill \textit{Month Year -- Month Year}
\begin{itemize}[left=0pt]
  \item Achieved [quantifiable result] by [action taken], resulting in [business impact]
  \item Led [initiative] for [context], improving [metric] by [percentage]
  \item Collaborated with [stakeholders] to [accomplish goal]
\end{itemize}

[Repeat for each role]

\section*{Education}

\noindent\textbf{Degree Name} | University Name \hfill \textit{Graduation Year}

\section*{Technical Skills}

\noindent\textbf{Languages:} Python, JavaScript, SQL \\
\textbf{Frameworks:} React, Node.js, Django \\
\textbf{Tools:} Docker, Kubernetes, AWS, Git

\section*{Certifications}

\begin{itemize}[left=0pt]
  \item AWS Certified Solutions Architect (2024)
  \item Certified Kubernetes Administrator (2023)
\end{itemize}

\end{document}

IMPORTANT:
- Return ONLY the LaTeX source code
- No markdown code blocks (no ```latex```)
- No explanatory text before or after the code
- Escape special LaTeX characters properly
- Test that your output would compile with pdflatex
- Use actual resume content from the input
```

---

### Prompt Optimization Notes

**Clarity Improvements:**
- Explicit "no code blocks" instruction (common AI mistake)
- Example structure provides clear template
- Special character escaping rules listed

**Brevity Improvements:**
- Removed redundant formatting rules
- Consolidated package requirements
- Direct output format specification

**Consistency Improvements:**
- References Schema V1 tailored_bullets field
- Package list matches backend server expectations
- ATS rules aligned with evaluation prompt

---

## COMPANY URL (RAG SEARCH) DECISION

### Current State Analysis

**Problem:** Company URL feature adds:
- Additional API calls (web scraping/RAG)
- Processing time (2-3+ seconds)
- Error surface area (URL validation, site accessibility)
- Optional field complexity in prompt logic

**User Value:** Provides company-specific insights when URL is valid and accessible.

### RECOMMENDATION: **OPTIONAL BY DEFAULT**

**Configuration Strategy:**

1. **Make it opt-in via UI:**
   - Keep "Company URL (Optional)" field in form
   - Add helper text: "Optional: Add company website for tailored insights (adds 5-10 seconds)"
   - Frontend validation: Must be valid URL format
   - If left blank: Skip RAG search, omit company_insights from response

2. **n8n Workflow Logic:**
   ```
   IF {{$json.company_url}} exists AND is not empty:
     → Call RAG/web scraping node
     → Generate company_insights
   ELSE:
     → Skip RAG node
     → Omit company_insights from JSON
   ```

3. **Error Handling:**
   - If RAG call fails: Log error but DON'T fail entire workflow
   - Return response without company_insights
   - Add optional error message: "Company insights unavailable (site not accessible)"

### Implementation Priority

- **Phase 1 (MVP):** Omit company_insights entirely, focus on core evaluation
- **Phase 2 (Enhancement):** Add optional RAG with conditional logic
- **Phase 3 (Advanced):** Cache company data, add multiple source scraping

**Current Decision:** Keep field in UI but implement RAG call **only if developer has time after core functionality is complete**.

---

## PROMPT MAINTENANCE GUIDELINES

### When to Update Prompts

1. **Schema Changes:** If Schema V1 evolves to V2, update field references
2. **User Feedback:** If AI responses consistently miss expectations
3. **Model Upgrades:** When n8n upgrades AI model, retest and refine
4. **Industry Trends:** Annual review for resume best practices

### Version Control

- Store prompts in separate files: `prompts/evaluation-v1.txt`, `prompts/latex-v1.txt`
- Document changes in CHANGELOG.md
- Test new versions in n8n test environment before production

---

## ACCEPTANCE CRITERIA

- [x] Resume evaluation prompt fully documented
- [x] LaTeX generation prompt fully documented
- [x] Both prompts reference Schema V1 fields exactly
- [x] RAG/company_url decision documented (optional by default)
- [x] Example structures provided for both prompts
- [x] Optimization notes explain improvements
- [ ] **n8n developer implements prompts in workflow**
- [ ] **Test with real resume PDFs**
- [ ] **Verify JSON output matches schema**
- [ ] **Verify LaTeX compiles without errors**

---

## DEVELOPER HANDOFF

**To: n8n Workflow Developer**
**From: Project Coordinator**

**Action Items:**
1. Create/update "AI Chat" node for resume evaluation
   - Copy "Prompt 1" text exactly
   - Map input variables: resume_text, job_title, job_description, company_url
   - Set output parsing: JSON mode

2. Create/update "AI Chat" node for LaTeX generation
   - Copy "Prompt 2" text exactly
   - Map input variables from evaluation output
   - Set output parsing: Plain text (not JSON)

3. Implement conditional company_url logic
   - Add IF node: Check if company_url exists
   - Route to RAG node if true, skip if false
   - Merge results before final response

4. Test with these examples:
   - Software Engineer resume + job description (WITH company URL)
   - Marketing Manager resume + job description (WITHOUT company URL)
   - Entry-level resume (edge case: minimal experience)

**Estimated Effort:** 3-4 hours

**Blockers:** None (Step 2 can proceed in parallel if needed)

---

## NEXT STEP
Proceed to **STEP 4**: Document webhook logic for local vs cloud environments.
