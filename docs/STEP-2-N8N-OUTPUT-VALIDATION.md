# STEP 2 — N8N OUTPUT STRUCTURE VALIDATION
**Status:** Analysis Complete - Requires n8n Developer Action
**Version:** 1.0.0
**Last Updated:** 2025-11-07
**Coordinator:** Project Planning Team

---

## PURPOSE
Compare current n8n webhook output against the locked JSON Schema V1 from Step 1. Identify all discrepancies and provide developers with exact specifications for required fixes.

---

## CURRENT N8N OUTPUT ANALYSIS

### Observed Output Pattern (Based on Current Frontend Transform Logic)

The frontend currently expects n8n to return **flat-structured data** with these patterns:

```json
{
  "overall_score": 85,
  "cs_formatting": 90,
  "cs_content_quality": 85,
  "cs_keyword_optimization": 75,
  "cs_ats_compatibility": 88,
  "strengths_1": "First strength",
  "strengths_2": "Second strength",
  "strengths_3": "Third strength",
  "improvement_1": "First improvement",
  "improvement_2": "Second improvement",
  "tailored_bullet_1": "First bullet point",
  "tailored_bullet_2": "Second bullet point",
  "keyword_recommendations_all": "keyword1 | keyword2 | keyword3",
  "ats_tips_all": "tip1 | tip2 | tip3",
  "quick_win_1": "Quick win item 1",
  "quick_win_2": "Quick win item 2",
  "medium_horizon_1": "Medium term goal 1",
  "company_highlights_all": "highlight1 | highlight2",
  "company_sources_all": "url1 | url2",
  "output": "{ stringified JSON or LaTeX code }",
  "latex": "\\documentclass...",
  "latex_code": "\\documentclass..."
}
```

**Alternative Pattern Observed:**
```json
[
  {
    "output": "{ stringified evaluation JSON }",
    "latex": "\\documentclass..."
  }
]
```

---

## SCHEMA COMPLIANCE ISSUES

### ❌ CRITICAL ISSUES (Must Fix Before Launch)

#### 1. **Missing `meta` Object**
**Current:** No meta information is being returned
**Required:**
```json
{
  "meta": {
    "run_id": "UUID",
    "timestamp": "ISO 8601",
    "source_env": "local|test|production",
    "schema_version": "1.0.0"
  }
}
```

**Fix Action for n8n Developer:**
- Add a "Set" node before the Respond to Webhook node
- Generate UUID using expression: `{{$now.toFormat('yyyyMMddHHmmss')}}-{{$random.uuid()}}`
- Set timestamp using: `{{$now.toISO()}}`
- Set source_env from n8n environment variable
- Set schema_version to literal "1.0.0"

---

#### 2. **Flat Structure Instead of Nested**
**Current:** Data is returned flat with numbered/prefixed fields
**Required:** Nested structure under `evaluation` object

**Mapping Required:**

| Current n8n Field | Schema V1 Location |
|---|---|
| `overall_score` | `evaluation.overall_score` |
| `cs_*` fields | `evaluation.category_scores.*` |
| `strengths_1`, `strengths_2`, etc. | `evaluation.strengths` (array) |
| `improvement_1`, `improvement_2`, etc. | `evaluation.improvement_areas` (array) |
| `tailored_bullet_*` | `evaluation.tailored_bullets` (array) |
| `keyword_recommendations_all` | `evaluation.keyword_recommendations` (split by `|`) |
| `ats_tips_all` | `evaluation.ats_tips` (split by `|`) |
| `quick_win_*` | `evaluation.gaps_and_learning_plan.quick_wins_1_2_weeks` |
| `medium_horizon_*` | `evaluation.gaps_and_learning_plan.medium_horizon_1_2_months` |

**Fix Action for n8n Developer:**
- Add "Code" node (JavaScript) after AI model processing
- Transform flat structure into nested schema
- Combine numbered fields into arrays
- Split pipe-delimited strings into arrays
- See transformation code template in APPENDIX A

---

#### 3. **Inconsistent LaTeX Field Naming**
**Current:** LaTeX appears in multiple possible fields:
- Sometimes: `latex`
- Sometimes: `latex_code`
- Sometimes: `output` (when it contains LaTeX)
- Sometimes: Array item with `output` field

**Required:** Always in `latex.document`

**Fix Action for n8n Developer:**
- Consolidate LaTeX output to single field
- Structure as: `{ "latex": { "document": "...", "meta": { ... } } }`
- Ensure LaTeX meta fields are populated
- If LaTeX generation fails, omit `latex` object entirely (don't return with null)

---

#### 4. **Stringified JSON in `output` Field**
**Current:** Some responses contain: `{ "output": "{\"strengths\": [...]}" }`
**Required:** Direct object structure, not stringified

**Fix Action for n8n Developer:**
- Check if AI model returns JSON as string
- Add JSON.parse() step if needed
- Merge parsed object into main response structure
- Remove wrapper `output` field

---

### ⚠️ OPTIONAL ISSUES (Recommended for Production)

#### 5. **Missing Optional Fields**
The following optional fields enhance user experience but aren't strictly required:

- `evaluation.summary` (paragraph-form narrative)
- `evaluation.company_insights` (only if company_url provided)
- `meta.processing_time_ms` (useful for monitoring)
- `latex.meta.packages` (helpful for troubleshooting)

**Fix Action for n8n Developer:**
- Add summary generation prompt to AI model
- Implement conditional company_insights based on `company_url` input
- Track execution time using n8n's built-in variables
- Extract LaTeX packages from `\usepackage{}` declarations

---

#### 6. **Category Score Naming Convention**
**Current:** `cs_formatting`, `cs_content_quality`, etc.
**Schema:** Direct naming under `category_scores` object

**Current frontend handles this,** but cleaner output would use:
```json
{
  "evaluation": {
    "category_scores": {
      "formatting": 90,
      "content quality": 85,
      "keyword optimization": 75,
      "ats compatibility": 88
    }
  }
}
```

**Fix Action for n8n Developer:**
- Remove `cs_` prefix
- Use human-readable names
- Return as nested object, not flat fields

---

## VALIDATION CHECKLIST FOR N8N DEVELOPER

Before marking Step 2 complete, verify:

- [ ] Response includes `meta` object with all required fields
- [ ] Response structure matches: `{ meta: {...}, evaluation: {...}, latex: {...} }`
- [ ] All arrays are actual arrays (not numbered fields or pipe-delimited strings)
- [ ] `overall_score` is integer 0-100
- [ ] All `category_scores` values are integers 0-100
- [ ] `run_id` is valid UUID format
- [ ] `timestamp` is valid ISO 8601 format
- [ ] `source_env` is one of: "local", "test", or "production"
- [ ] `schema_version` is exactly "1.0.0"
- [ ] LaTeX (if present) is in `latex.document` field
- [ ] No stringified JSON remains in response
- [ ] Test with actual webhook call, not hardcoded response
- [ ] Frontend displays dynamic results without transformation logic

---

## TEST PLAN

### Test Case 1: Minimal Response
**Input:** Resume PDF without company URL
**Expected Output:**
```json
{
  "meta": {
    "run_id": "generated-uuid",
    "timestamp": "2025-11-07T12:00:00.000Z",
    "source_env": "test",
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
    "strengths": ["Item 1", "Item 2"],
    "improvement_areas": ["Item 1", "Item 2"]
  }
}
```

### Test Case 2: Full Response with LaTeX
**Input:** Resume PDF + Job Title + Job Description + Company URL
**Expected Output:** Complete schema including all optional fields

### Test Case 3: Error Handling
**Input:** Corrupted/image-based PDF
**Expected Output:**
```json
{
  "meta": { ... },
  "error": {
    "code": "PROCESSING_FAILED",
    "message": "Unable to extract text from PDF"
  }
}
```

---

## APPENDIX A: TRANSFORMATION CODE TEMPLATE

**For n8n "Code" Node** (JavaScript):

```javascript
// This is REFERENCE ONLY - for n8n developer implementation
// Coordinator note: Do not execute this code in frontend

const input = $input.all()[0].json;
const output = {
  meta: {
    run_id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    source_env: $env.N8N_ENVIRONMENT || 'production',
    schema_version: '1.0.0'
  },
  evaluation: {
    overall_score: input.overall_score,
    category_scores: {},
    strengths: [],
    improvement_areas: [],
    tailored_bullets: []
  }
};

// Extract category scores (cs_* fields)
Object.keys(input).forEach(key => {
  if (key.startsWith('cs_')) {
    const catName = key.replace('cs_', '').replace(/_/g, ' ');
    output.evaluation.category_scores[catName] = input[key];
  }
});

// Collect numbered arrays
const collectArray = (prefix) => {
  const arr = [];
  let i = 1;
  while (input[`${prefix}_${i}`]) {
    arr.push(input[`${prefix}_${i}`]);
    i++;
  }
  return arr.length > 0 ? arr : undefined;
};

output.evaluation.strengths = collectArray('strengths') || [];
output.evaluation.improvement_areas = collectArray('improvement') || [];
output.evaluation.tailored_bullets = collectArray('tailored_bullet') || [];

// Split pipe-delimited fields
if (input.keyword_recommendations_all) {
  output.evaluation.keyword_recommendations =
    input.keyword_recommendations_all.split('|').map(s => s.trim());
}

// Handle LaTeX
if (input.latex || input.latex_code) {
  output.latex = {
    document: input.latex || input.latex_code,
    meta: {
      document_class: 'article',
      packages: [],
      compile_ready: true
    }
  };
}

return output;
```

---

## ACCEPTANCE CRITERIA

- [x] Current n8n output pattern documented
- [x] All schema discrepancies identified and categorized
- [x] Fix actions specified for each issue
- [x] Transformation code template provided
- [x] Test plan with 3 test cases defined
- [ ] **n8n developer confirms fixes implemented**
- [ ] **Test webhook returns schema-compliant JSON**
- [ ] **Frontend displays results without frontend transformation logic**

---

## DEVELOPER HANDOFF

**To: n8n Backend Developer**
**From: Project Coordinator**

**Action Items:**
1. Review all 6 identified issues above
2. Implement transformation logic in n8n workflow
3. Test using provided test cases
4. Confirm: Response validates against JSON Schema V1
5. Notify coordinator when Step 2 acceptance criteria are met

**Estimated Effort:** 4-6 hours

**Blockers:** None - Step 1 schema is locked and approved

**Questions?** Contact project coordinator with specific schema interpretation questions.

---

## NEXT STEP
Once n8n output matches Schema V1, proceed to **STEP 3**: Review and optimize n8n prompt content.
