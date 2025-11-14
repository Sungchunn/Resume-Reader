# STEP 5 — REAL-TIME LATEX RENDER PIPELINE SPECIFICATION
**Status:** Ready for Implementation
**Version:** 1.0.0
**Last Updated:** 2025-11-07
**Coordinator:** Project Planning Team

---

## PURPOSE
Define the complete technical specifications for real-time LaTeX compilation and PDF rendering without writing implementation code. This document provides requirements, API contracts, and behavioral expectations for backend and frontend developers.

---

## SYSTEM ARCHITECTURE OVERVIEW

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│  ┌──────────────────┐   ┌───────────────┐   ┌───────────────┐ │
│  │  Feedback Panel  │   │  LaTeX Editor │   │  PDF Preview  │ │
│  │  (Upper Layer)   │   │  (Left Panel) │   │ (Right Panel) │ │
│  └──────────────────┘   └───────┬───────┘   └───────┬───────┘ │
│                                  │                     │         │
│                                  │  Debounced          │         │
│                                  │  onChange           │         │
│                                  │                     │         │
│                                  ▼                     │         │
│                         ┌────────────────┐            │         │
│                         │   Debouncer    │            │         │
│                         │  (300-500ms)   │            │         │
│                         └────────┬───────┘            │         │
│                                  │                     │         │
│                                  │  Compile Request    │         │
│                                  ▼                     │         │
│                         ┌────────────────┐            │         │
│                         │  HTTP Client   │            │         │
│                         │  POST /render  │            │         │
│                         └────────┬───────┘            │         │
└──────────────────────────────────┼──────────────────────────────┘
                                   │
                                   │ HTTPS
                                   │
┌──────────────────────────────────▼──────────────────────────────┐
│                     BACKEND LATEX SERVER                         │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │              POST /api/compile-latex                       │ │
│  │  Input: { latex: "string" }                                │ │
│  │  Output: PDF binary OR error JSON                          │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                Security Sanitization                       │ │
│  │  - Block dangerous commands (\write18, \input{/etc/})     │ │
│  │  - Validate LaTeX structure                                │ │
│  └─────────────────────┬──────────────────────────────────────┘ │
│                        │                                          │
│  ┌─────────────────────▼────────────────────────────────────┐  │
│  │              LaTeX Compilation Engine                     │  │
│  │  - Engine: pdflatex (default)                             │  │
│  │  - Alternative: xelatex, lualatex                         │  │
│  │  - Passes: 1 (default), 2 for references                  │  │
│  │  - Timeout: 10 seconds                                     │  │
│  └─────────────────────┬──────────────────────────────────────┘ │
│                        │                                          │
│  ┌─────────────────────▼────────────────────────────────────┐  │
│  │              Response Handler                             │  │
│  │  - Success: Stream PDF as application/pdf                 │  │
│  │  - Failure: Return JSON error with details                │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
└───────────────────────────────────────────────────────────────────┘
```

---

## BACKEND API SPECIFICATION

### Endpoint 1: Health Check

**Purpose:** Verify server availability and LaTeX installation

**Request:**
```
GET /health
```

**Response (Success):**
```json
{
  "status": "healthy",
  "service": "latex-compiler",
  "latex_engine": "pdflatex",
  "version": "3.141592653-2.6-1.40.24"
}
```

**Response Codes:**
- `200 OK`: Server operational, pdflatex available
- `503 Service Unavailable`: Server running but pdflatex not found

**Implementation Notes:**
- Check pdflatex availability on server startup
- Log warning if LaTeX not found in PATH
- Cache engine version (don't check on every request)

---

### Endpoint 2: LaTeX Compilation

**Purpose:** Compile LaTeX source code to PDF

**Request:**
```
POST /api/compile-latex
Content-Type: application/json

{
  "latex": "\\documentclass{article}\n\\begin{document}\nHello World\n\\end{document}",
  "engine": "pdflatex",    // OPTIONAL: "pdflatex" | "xelatex" | "lualatex"
  "passes": 1              // OPTIONAL: 1-3, default 1
}
```

**Field Specifications:**

| Field | Type | Required | Validation | Default |
|-------|------|----------|------------|---------|
| `latex` | string | Yes | Must contain `\documentclass` and `\begin{document}` | N/A |
| `engine` | string | No | Must be one of: pdflatex, xelatex, lualatex | pdflatex |
| `passes` | integer | No | Must be 1-3 | 1 |

**Response (Success):**
```
HTTP 200 OK
Content-Type: application/pdf
Content-Disposition: inline; filename=resume.pdf

[PDF binary data]
```

**Response (Compilation Error):**
```json
HTTP 500 Internal Server Error
Content-Type: application/json

{
  "error": "LaTeX compilation failed",
  "message": "Undefined control sequence \\fakecommand",
  "logs": "! Undefined control sequence.\nl.10 This is a \\fakecommand\n                            test.\n? ",
  "hint": "Check your LaTeX syntax. Common issues: missing packages, syntax errors, or invalid commands."
}
```

**Response (Validation Error):**
```json
HTTP 400 Bad Request
Content-Type: application/json

{
  "error": "Invalid LaTeX code",
  "message": "LaTeX code is required and must contain \\documentclass and \\begin{document}"
}
```

**Response (Security Error):**
```json
HTTP 400 Bad Request
Content-Type: application/json

{
  "error": "Potentially dangerous LaTeX code detected",
  "message": "The LaTeX code contains patterns that could be unsafe: \\write18",
  "blocked_pattern": "\\write18"
}
```

**Response Codes:**
- `200 OK`: Compilation successful, PDF returned
- `400 Bad Request`: Invalid input or security violation
- `500 Internal Server Error`: Compilation failed (syntax error)
- `503 Service Unavailable`: LaTeX engine not available
- `504 Gateway Timeout`: Compilation exceeded 10 second timeout

---

## SECURITY REQUIREMENTS

### Dangerous Pattern Blocklist

The following LaTeX patterns MUST be blocked to prevent malicious code execution:

| Pattern | Risk | Action |
|---------|------|--------|
| `\write18` | Shell command execution | Block with 400 error |
| `\input{/etc/` | File system access | Block with 400 error |
| `\include{/etc/` | File system access | Block with 400 error |
| `\openin` | File read operations | Block with 400 error |
| `\openout` | File write operations | Block with 400 error |
| `\immediate\write` | Direct file I/O | Block with 400 error |
| `\def\input` | Command redefinition | Block with 400 error |

**Implementation Requirement:**
- Check ALL incoming LaTeX code against blocklist BEFORE compilation
- Return 400 error immediately if any pattern detected
- Log security violations for monitoring

**Additional Security Measures:**
- Run LaTeX compilation in sandboxed/isolated environment
- Set file system permissions: read-only except temp directory
- Limit memory usage: 512 MB maximum
- Limit execution time: 10 seconds maximum
- Delete temporary files after each compilation

---

## PERFORMANCE REQUIREMENTS

### Response Time Targets

| Scenario | Target | Acceptable | Unacceptable |
|----------|--------|------------|--------------|
| Simple document (< 100 lines) | 300 ms | 500 ms | > 1s |
| Medium document (100-500 lines) | 500 ms | 1s | > 2s |
| Complex document (> 500 lines) | 1s | 2s | > 5s |

### Timeout Configuration

- **Hard timeout:** 10 seconds
  - Prevents infinite loops or excessive compilation time
  - After 10s, kill process and return 504 error

- **Soft timeout warning:** 5 seconds
  - Log warning if compilation takes > 5s
  - Suggest optimization (reduce passes, simplify document)

### Concurrency Limits

- **Maximum concurrent compilations:** 5
  - LaTeX compilation is CPU-intensive
  - Queue additional requests
  - Return 503 if queue exceeds 20 requests

---

## FRONTEND INTEGRATION SPECIFICATIONS

### Debounce Strategy

**Purpose:** Prevent excessive compilation requests while user is typing

**Requirements:**
- Delay compilation by **500 milliseconds** after last keystroke
- Cancel pending compilation if user types again
- Show "Compiling..." indicator during compilation
- Clear indicator immediately when PDF arrives

**Implementation Pattern (NO CODE, just specification):**

1. User types in LaTeX editor
2. Start/restart 500ms countdown timer
3. If timer completes without interruption:
   - Show "Compiling..." spinner
   - Send POST request to /api/compile-latex
4. If user types before timer completes:
   - Cancel current timer
   - Start new 500ms timer
5. When response arrives:
   - Hide "Compiling..." spinner
   - Display PDF or error message

**Edge Cases:**
- If compilation takes > 5 seconds, show "Still compiling..." message
- If request fails, show error message and keep previous PDF visible
- If user makes edits while compiling, queue next compilation after current finishes

---

### Error Handling & User Feedback

**Compilation Success:**
- No visible message (seamless update)
- Update PDF preview immediately
- Optionally show green checkmark for 1 second

**Compilation Error (Syntax):**
```
┌─────────────────────────────────────────────────┐
│ ⚠️ LaTeX Compilation Error                     │
│                                                  │
│ Line 10: Undefined control sequence            │
│ \fakecommand                                    │
│                                                  │
│ Tip: Check spelling and package imports        │
│                                                  │
│ [View Full Logs] [Dismiss]                      │
└─────────────────────────────────────────────────┘
```

**Server Unavailable:**
```
┌─────────────────────────────────────────────────┐
│ 🔧 LaTeX Server Unavailable                    │
│                                                  │
│ The LaTeX compilation service is currently      │
│ unavailable. You can still edit and download    │
│ the .tex file to compile locally.               │
│                                                  │
│ [Download .tex] [Retry] [Dismiss]               │
└─────────────────────────────────────────────────┘
```

**Timeout Error:**
```
┌─────────────────────────────────────────────────┐
│ ⏱️ Compilation Timeout                          │
│                                                  │
│ The document is taking too long to compile.     │
│ Try simplifying the document or removing        │
│ complex graphics.                                │
│                                                  │
│ [Retry] [Dismiss]                                │
└─────────────────────────────────────────────────┘
```

---

### PDF Display Requirements

**Preview Panel Behavior:**

1. **Initial Load:**
   - Show "Loading preview..." spinner
   - Auto-compile on component mount if LaTeX provided

2. **Real-time Updates:**
   - Maintain scroll position between updates when possible
   - Fade-out old PDF, fade-in new PDF (100ms transition)
   - Don't "flash" or cause jarring updates

3. **Zoom Controls:**
   - Fit to width (default)
   - Fit to page
   - Custom zoom (50%, 75%, 100%, 125%, 150%)
   - Remember user preference in session storage

4. **Multi-page Handling:**
   - Display all pages vertically (infinite scroll)
   - Page numbers: "Page 1 of 3"
   - Smooth scroll between pages

5. **Loading States:**
   - Skeleton loader for first compilation
   - Subtle "Updating..." overlay for subsequent compilations
   - Previous PDF remains visible during update

---

## ALTERNATIVE COMPILATION FALLBACK

### Fallback Strategy

If local backend is unavailable, frontend should attempt fallback compilation services in this order:

1. **Primary:** Local backend (localhost:3001 or cloud deployment)
2. **Fallback 1:** n8n LaTeX compilation webhook (if implemented)
3. **Fallback 2:** LaTeX.Online public API
4. **Fallback 3:** Preview unavailable message

**Fallback Implementation Requirements:**

- Attempt primary backend first (timeout after 5s)
- If fails, try fallback 1 (timeout after 10s)
- If fails, try fallback 2 (timeout after 15s)
- If all fail, show "Preview unavailable" UI

**Preview Unavailable UI:**
```
┌─────────────────────────────────────────────────┐
│         📄 PDF Preview Unavailable              │
│                                                  │
│ Real-time PDF preview requires a LaTeX          │
│ compilation backend.                             │
│                                                  │
│ Options:                                         │
│ • Download .tex file and compile locally        │
│ • Use Overleaf for online compilation           │
│ • Copy code and paste into your LaTeX editor    │
│                                                  │
│ [Download .tex] [Copy Code]                      │
└─────────────────────────────────────────────────┘
```

---

## CACHING & OPTIMIZATION STRATEGIES

### Compilation Caching (Optional Enhancement)

**Purpose:** Avoid recompiling identical LaTeX code

**Cache Key:** SHA-256 hash of LaTeX source code

**Cache Behavior:**
- Check cache before compilation
- If cache hit: Return cached PDF immediately (< 10ms)
- If cache miss: Compile and store in cache
- Cache TTL: 1 hour
- Max cache size: 100 MB (evict LRU)

**When NOT to cache:**
- Different LaTeX engines (pdflatex vs xelatex)
- Different number of passes
- User explicitly requests fresh compilation

---

## MONITORING & LOGGING REQUIREMENTS

### Metrics to Track

| Metric | Purpose | Alert Threshold |
|--------|---------|-----------------|
| Compilation time (p50, p95, p99) | Performance monitoring | p95 > 2s |
| Error rate | Service health | > 5% |
| Timeout rate | Resource issues | > 1% |
| Queue depth | Load management | > 10 |
| Security blocks | Malicious activity | > 0 |

### Log Format

**Successful Compilation:**
```
[INFO] LaTeX compilation successful
  - Duration: 342ms
  - Engine: pdflatex
  - Document size: 1247 bytes
  - PDF size: 14238 bytes
```

**Failed Compilation:**
```
[ERROR] LaTeX compilation failed
  - Duration: 1523ms
  - Engine: pdflatex
  - Error: Undefined control sequence
  - Document size: 892 bytes
  - Logs: [first 500 chars of error log]
```

**Security Block:**
```
[WARN] Security violation detected
  - Pattern: \write18
  - Document size: 456 bytes
  - Source IP: 192.168.1.100
  - Timestamp: 2025-11-07T12:34:56Z
```

---

## TESTING REQUIREMENTS

### Test Cases for Backend

**Test 1: Minimal Valid Document**
```latex
\documentclass{article}
\begin{document}
Hello World
\end{document}
```
Expected: 200 OK, valid PDF

**Test 2: Complex Resume Document**
```latex
\documentclass[11pt,a4paper]{article}
\usepackage[margin=1in]{geometry}
\usepackage{enumitem}
\usepackage{hyperref}
[... full resume template ...]
```
Expected: 200 OK, valid PDF, < 1s compilation

**Test 3: Syntax Error**
```latex
\documentclass{article}
\begin{document}
This has a \fakecommand error
\end{document}
```
Expected: 500 error, JSON with error message

**Test 4: Security Violation**
```latex
\documentclass{article}
\begin{document}
\write18{rm -rf /}
\end{document}
```
Expected: 400 error, blocked before compilation

**Test 5: Missing Packages**
```latex
\documentclass{article}
\usepackage{nonexistent-package}
\begin{document}
Test
\end{document}
```
Expected: 500 error, package not found message

**Test 6: Timeout (Artificial)**
Create document with infinite loop or excessive processing
Expected: 504 error after 10 seconds

---

### Test Cases for Frontend

**Test 1: Debounce Behavior**
- Type rapidly in editor
- Verify compilation only fires 500ms after last keystroke
- Verify only ONE request sent (no duplicates)

**Test 2: Error Display**
- Introduce syntax error
- Verify error message displays clearly
- Verify previous PDF remains visible

**Test 3: Network Failure**
- Disconnect backend server
- Verify fallback behavior triggers
- Verify user-friendly error message

**Test 4: Real-time Update**
- Make small edit to valid document
- Verify PDF updates smoothly
- Verify scroll position maintained

**Test 5: Initial Load**
- Navigate to analysis page with LaTeX
- Verify auto-compilation on mount
- Verify loading indicator displays

---

## ACCEPTANCE CRITERIA

- [x] API endpoint specifications documented (health check, compile-latex)
- [x] Request/response formats fully defined
- [x] Security requirements and blocklist specified
- [x] Performance targets and timeout behavior defined
- [x] Debounce strategy (300-500ms) documented
- [x] Error handling and user feedback UI specified
- [x] PDF display requirements outlined
- [x] Fallback strategy defined
- [x] Caching strategy documented (optional)
- [x] Monitoring and logging requirements specified
- [x] Test cases provided for both backend and frontend
- [ ] **Backend developer implements API according to spec**
- [ ] **Frontend developer implements debounce and error handling**
- [ ] **All test cases pass**
- [ ] **Performance targets met**
- [ ] **Real-time preview works end-to-end**

---

## DEVELOPER HANDOFF

**To: Backend Developer**
**From: Project Coordinator**

**Action Items:**
1. Review current backend/server.js implementation against this spec
2. Implement any missing features (health check response format, logging, etc.)
3. Add security pattern blocking if not already present
4. Implement timeout handling (10s hard limit)
5. Add caching layer (optional, Phase 2)
6. Test all backend test cases

**Estimated Effort:** 4-6 hours

**To: Frontend Developer**
**From: Project Coordinator**

**Action Items:**
1. Implement 500ms debounce on LaTeX editor onChange
2. Add compilation status indicator (spinner, success, error)
3. Implement all error UI components (syntax error, timeout, unavailable)
4. Add fallback logic for backend unavailability
5. Test all frontend test cases

**Estimated Effort:** 6-8 hours

---

## NEXT STEP
Proceed to **STEP 6**: Plan UI/UX improvements (three-layer structure).
