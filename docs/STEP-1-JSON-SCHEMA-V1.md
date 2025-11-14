# STEP 1 — DATA CONTRACT: JSON SCHEMA V1
**Status:** Draft for Review
**Version:** 1.0.0
**Last Updated:** 2025-11-07
**Coordinator:** Project Planning Team

---

## PURPOSE
Define the authoritative JSON schema that governs all data exchange between the n8n backend and the React frontend. This schema locks the contract before any implementation begins.

---

## SCHEMA V1 SPECIFICATION

### Root Object Structure

```json
{
  "meta": { ... },
  "evaluation": { ... },
  "latex": { ... }
}
```

---

### 1. META OBJECT (Required)

**Purpose:** Tracking and environment information

```json
{
  "meta": {
    "run_id": "string (UUID v4)",           // REQUIRED
    "timestamp": "string (ISO 8601)",       // REQUIRED
    "source_env": "string (enum)",          // REQUIRED: "local" | "test" | "production"
    "schema_version": "string",             // REQUIRED: "1.0.0"
    "processing_time_ms": "number"          // OPTIONAL
  }
}
```

**Field Definitions:**
- `run_id`: Unique identifier for this analysis run
- `timestamp`: When the analysis was generated
- `source_env`: Which environment generated this response
- `schema_version`: Contract version for compatibility checks
- `processing_time_ms`: Backend processing duration (for monitoring)

**Validation Rules:**
- `run_id` must be valid UUID v4 format
- `timestamp` must be valid ISO 8601 format
- `source_env` must be one of the three enum values
- `schema_version` must match semver pattern

---

### 2. EVALUATION OBJECT (Required)

**Purpose:** Resume analysis feedback and scoring

```json
{
  "evaluation": {
    "overall_score": 85,
    "category_scores": {
      "formatting": 90,
      "content quality": 85,
      "keyword optimization": 75,
      "ats compatibility": 88
    },
    "strengths": [
      "Clear quantifiable achievements",
      "Strong action verbs usage"
    ],
    "improvement_areas": [
      "Add more industry-specific keywords",
      "Expand technical skills section"
    ],
    "summary": "string (paragraph)",
    "tailored_bullets": [
      "Led cross-functional team of 12...",
      "Increased system efficiency by 40%..."
    ],
    "keyword_recommendations": [
      "cloud architecture",
      "microservices",
      "CI/CD pipeline"
    ],
    "ats_tips": [
      "Use standard section headings",
      "Avoid graphics and tables"
    ],
    "gaps_and_learning_plan": {
      "quick_wins_1_2_weeks": [
        "Add certifications section",
        "Quantify current achievements"
      ],
      "medium_horizon_1_2_months": [
        "Complete AWS Solutions Architect cert",
        "Build portfolio project showcasing skills"
      ]
    },
    "company_insights": {
      "highlights": [
        "Company focuses on cloud-native solutions",
        "Recently raised Series B funding"
      ],
      "sources": [
        "https://company.com/about",
        "https://techcrunch.com/article"
      ]
    }
  }
}
```

**Field Definitions:**

**REQUIRED FIELDS:**
- `overall_score` (number, 0-100): Aggregate resume quality score
- `category_scores` (object): Breakdown by evaluation dimension
- `strengths` (array[string]): Positive aspects identified
- `improvement_areas` (array[string]): Areas needing enhancement

**OPTIONAL FIELDS:**
- `summary` (string): Paragraph-form evaluation narrative
- `tailored_bullets` (array[string]): Suggested resume bullet points
- `keyword_recommendations` (array[string]): Missing relevant keywords
- `ats_tips` (array[string]): Applicant Tracking System optimization tips
- `gaps_and_learning_plan` (object): Structured learning roadmap
- `company_insights` (object): Company-specific research (RAG-based)

**Validation Rules:**
- `overall_score`: Integer between 0 and 100 inclusive
- `category_scores`: Each value must be 0-100
- All array fields: Minimum 0 items, maximum 20 items
- `summary`: Maximum 1000 characters
- `company_insights`: Only present if `company_url` was provided in request

---

### 3. LATEX OBJECT (Conditional)

**Purpose:** LaTeX source code for resume generation

```json
{
  "latex": {
    "document": "string (LaTeX source code)",
    "meta": {
      "document_class": "article",
      "packages": ["geometry", "enumitem", "hyperref"],
      "compile_ready": true
    }
  }
}
```

**Field Definitions:**
- `document` (string): Complete LaTeX source code
- `meta.document_class` (string): LaTeX document class used
- `meta.packages` (array[string]): Required LaTeX packages
- `meta.compile_ready` (boolean): Whether document compiles as-is

**Presence Logic:**
- If n8n generates LaTeX: This object MUST be present
- If LaTeX generation fails: Omit this object entirely (don't include with null)
- Frontend should check: `if (data.latex && data.latex.document)` before rendering editor

**Validation Rules:**
- `document`: Must contain `\documentclass` declaration
- `document`: Must contain `\begin{document}` and `\end{document}`
- `compile_ready`: Must be `true` (if false, omit latex object)

---

## EXAMPLE PAYLOADS

### Minimal Valid Response (Required Fields Only)

```json
{
  "meta": {
    "run_id": "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    "timestamp": "2025-11-07T12:34:56.789Z",
    "source_env": "production",
    "schema_version": "1.0.0"
  },
  "evaluation": {
    "overall_score": 78,
    "category_scores": {
      "formatting": 85,
      "content quality": 75,
      "keyword optimization": 70,
      "ats compatibility": 82
    },
    "strengths": [
      "Strong quantifiable achievements",
      "Clear career progression"
    ],
    "improvement_areas": [
      "Add more technical keywords",
      "Include professional summary"
    ]
  }
}
```

### Full Response (All Optional Fields Included)

```json
{
  "meta": {
    "run_id": "a1b2c3d4-e5f6-4789-abcd-1234567890ef",
    "timestamp": "2025-11-07T14:22:10.123Z",
    "source_env": "production",
    "schema_version": "1.0.0",
    "processing_time_ms": 4567
  },
  "evaluation": {
    "overall_score": 82,
    "category_scores": {
      "formatting": 90,
      "content quality": 85,
      "keyword optimization": 75,
      "ats compatibility": 88
    },
    "strengths": [
      "Excellent use of action verbs",
      "Quantified achievements throughout",
      "Clear and concise formatting"
    ],
    "improvement_areas": [
      "Add more industry-specific keywords",
      "Include a professional summary section",
      "Expand on leadership experiences"
    ],
    "summary": "Your resume demonstrates strong technical capabilities with well-quantified achievements. The formatting is clean and ATS-friendly. Main areas for improvement include adding more industry-relevant keywords and expanding the leadership narrative to better align with senior-level expectations.",
    "tailored_bullets": [
      "Architected and deployed microservices infrastructure serving 2M+ daily users, reducing latency by 45%",
      "Led cross-functional team of 12 engineers through Agile transformation, improving sprint velocity by 30%",
      "Implemented CI/CD pipeline reducing deployment time from 4 hours to 15 minutes"
    ],
    "keyword_recommendations": [
      "cloud architecture",
      "kubernetes",
      "terraform",
      "microservices",
      "CI/CD pipeline"
    ],
    "ats_tips": [
      "Use standard section headings like 'Work Experience' and 'Education'",
      "Avoid using headers/footers as ATS may not parse them",
      "Keep formatting simple - avoid text boxes and tables"
    ],
    "gaps_and_learning_plan": {
      "quick_wins_1_2_weeks": [
        "Add a 'Certifications' section highlighting AWS/Azure credentials",
        "Revise bullet points to include more quantifiable metrics",
        "Add a professional summary at the top (3-4 sentences)"
      ],
      "medium_horizon_1_2_months": [
        "Complete Kubernetes Administrator certification",
        "Build and deploy a portfolio project showcasing cloud architecture skills",
        "Write technical blog posts to establish thought leadership"
      ]
    },
    "company_insights": {
      "highlights": [
        "TechCorp recently migrated entire infrastructure to Kubernetes",
        "Company culture emphasizes work-life balance and remote flexibility",
        "Team uses cutting-edge ML/AI in production systems"
      ],
      "sources": [
        "https://techcorp.com/engineering-blog",
        "https://techcrunch.com/techcorp-series-b",
        "https://glassdoor.com/techcorp-reviews"
      ]
    }
  },
  "latex": {
    "document": "\\documentclass[11pt,a4paper]{article}\n\\usepackage[margin=1in]{geometry}\n\\usepackage{enumitem}\n\\usepackage{hyperref}\n\n\\begin{document}\n\n\\section*{John Doe}\n\\href{mailto:john@example.com}{john@example.com} | (555) 123-4567\n\n\\section*{Professional Summary}\nSenior Software Engineer with 8+ years...\n\n\\end{document}",
    "meta": {
      "document_class": "article",
      "packages": ["geometry", "enumitem", "hyperref"],
      "compile_ready": true
    }
  }
}
```

---

## ERROR RESPONSE FORMAT

When processing fails, return this structure:

```json
{
  "meta": {
    "run_id": "error-uuid",
    "timestamp": "2025-11-07T14:22:10.123Z",
    "source_env": "production",
    "schema_version": "1.0.0"
  },
  "error": {
    "code": "PROCESSING_FAILED",
    "message": "Unable to extract text from PDF",
    "details": "PDF appears to be image-based. Please provide a text-based PDF."
  }
}
```

---

## ACCEPTANCE CRITERIA

- [ ] Schema v1 is fully documented above
- [ ] All required vs optional fields are clearly marked
- [ ] Validation rules are specified for each field
- [ ] Three example payloads provided (minimal, full, error)
- [ ] Developer handoff: Frontend team can begin mock implementation
- [ ] Schema validation: Sample JSON fixture loads and populates UI correctly

---

## DEVELOPER HANDOFF NOTES

**For Frontend Developers:**
1. Implement TypeScript interfaces matching this schema
2. Create JSON Schema validator for runtime validation
3. Build mock fixture file with full payload for testing
4. Test AnalysisPage component with mock data
5. Validate all optional fields render correctly when absent

**For n8n Backend Developers:**
6. Review current n8n output against this schema (See STEP 2 documentation)
7. Map AI model outputs to these exact field names
8. Ensure all required fields are always present
9. Add meta fields (run_id, timestamp, source_env, schema_version)
10. Test with schema validator before deployment

**Schema Evolution:**
- Any breaking changes require new major version (2.0.0)
- New optional fields can be added in minor versions (1.1.0)
- Document all changes in schema changelog

---

## NEXT STEP
Proceed to **STEP 2**: Review and validate n8n output structure against this schema.
