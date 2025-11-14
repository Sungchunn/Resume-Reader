# STEP 4 — WEBHOOK LOGIC FOR LOCAL VS CLOUD ENVIRONMENTS
**Status:** Ready for Implementation
**Version:** 1.0.0
**Last Updated:** 2025-11-07
**Coordinator:** Project Planning Team

---

## PURPOSE
Document the webhook routing strategy for different deployment environments (local development, testing, production) to ensure correct backend endpoint selection without code changes.

---

## ENVIRONMENT ARCHITECTURE

### Three Environment Model

| Environment | Purpose | Frontend Host | Backend Webhook | LaTeX Compiler |
|-------------|---------|---------------|-----------------|----------------|
| **Local** | Development | localhost:3000 | n8n test webhook | localhost:3001 |
| **Test** | Staging/QA | GitHub Pages | n8n test webhook | Cloud service |
| **Production** | Live | GitHub Pages | n8n prod webhook | Cloud service |

---

## WEBHOOK ENDPOINT SPECIFICATION

### Current Webhook URLs

**Test Webhook (Manual Activation Required):**
```
https://shreyahubcredo.app.n8n.cloud/webhook-test/2227bd6f-2f86-470d-a2d0-d8ff386eb788
```

**Production Webhook (Always Active):**
```
https://shreyahubcredo.app.n8n.cloud/webhook/2227bd6f-2f86-470d-a2d0-d8ff386eb788
```

**Differences:**
- `/webhook-test/` = Requires clicking "Execute Workflow" in n8n before EACH request
- `/webhook/` = Production endpoint, always listening

---

## ENVIRONMENT VARIABLE STRATEGY

### Variable Naming Convention

```bash
# Resume analysis webhook
REACT_APP_ANALYSIS_WEBHOOK=<url>

# LaTeX compilation backend
REACT_APP_BACKEND_URL=<url>

# Environment identifier (optional, for logging)
REACT_APP_ENVIRONMENT=<local|test|production>
```

### Environment-Specific Configuration

#### **LOCAL DEVELOPMENT** (.env.local)

```bash
# Local development configuration
REACT_APP_ANALYSIS_WEBHOOK=https://shreyahubcredo.app.n8n.cloud/webhook-test/2227bd6f-2f86-470d-a2d0-d8ff386eb788
REACT_APP_BACKEND_URL=http://localhost:3001
REACT_APP_ENVIRONMENT=local
```

**Usage Notes:**
- Test webhook requires manual activation in n8n UI
- LaTeX compilation happens locally via pdflatex
- Developer must have backend server running on port 3001
- Fast iteration, no network latency

---

#### **TEST/STAGING** (.env.test)

```bash
# Test environment configuration (GitHub Pages preview)
REACT_APP_ANALYSIS_WEBHOOK=https://shreyahubcredo.app.n8n.cloud/webhook-test/2227bd6f-2f86-470d-a2d0-d8ff386eb788
REACT_APP_BACKEND_URL=https://latex-compiler-service.herokuapp.com
REACT_APP_ENVIRONMENT=test
```

**Usage Notes:**
- Still uses test webhook for controlled testing
- LaTeX compilation via cloud service (Heroku/Railway/etc.)
- Used for pre-production validation
- May have slower LaTeX compilation (cold starts)

---

#### **PRODUCTION** (.env.production)

```bash
# Production configuration (live deployment)
REACT_APP_ANALYSIS_WEBHOOK=https://shreyahubcredo.app.n8n.cloud/webhook/2227bd6f-2f86-470d-a2d0-d8ff386eb788
REACT_APP_BACKEND_URL=https://latex-compiler-service.production.com
REACT_APP_ENVIRONMENT=production
```

**Usage Notes:**
- Production webhook always active (no manual activation)
- LaTeX compilation via production cloud service
- GitHub Actions deployment uses this configuration
- Environment variables stored in GitHub Secrets

---

## ROUTING LOGIC SPECIFICATION

### Frontend Webhook Selection

**Current Implementation (App.js:5):**
```javascript
const UPLOAD_WEBHOOK = process.env.REACT_APP_ANALYSIS_WEBHOOK || 'fallback-url';
```

**Recommended Enhancement:**

```javascript
// Environment detection
const ENV = process.env.REACT_APP_ENVIRONMENT || 'production';

// Webhook routing
const WEBHOOK_URLS = {
  local: process.env.REACT_APP_ANALYSIS_WEBHOOK || 'https://shreyahubcredo.app.n8n.cloud/webhook-test/...',
  test: process.env.REACT_APP_ANALYSIS_WEBHOOK || 'https://shreyahubcredo.app.n8n.cloud/webhook-test/...',
  production: process.env.REACT_APP_ANALYSIS_WEBHOOK || 'https://shreyahubcredo.app.n8n.cloud/webhook/...'
};

const UPLOAD_WEBHOOK = WEBHOOK_URLS[ENV];

// Backend routing
const BACKEND_URLS = {
  local: process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001',
  test: process.env.REACT_APP_BACKEND_URL || 'https://latex-compiler-test.com',
  production: process.env.REACT_APP_BACKEND_URL || 'https://latex-compiler-production.com'
};

const BACKEND_URL = BACKEND_URLS[ENV];
```

**Benefits:**
- Explicit environment routing
- Clear fallback URLs
- Single source of truth for endpoints
- Easy to add new environments

---

## ENVIRONMENT VARIABLE MANAGEMENT

### File Structure

```
project-root/
├── .env.example          # Template (committed to git)
├── .env.local           # Local dev (gitignored)
├── .env.test            # Test env (gitignored)
├── .env.production      # Production (gitignored)
└── .env                 # Current environment (gitignored)
```

### .env.example (Reference Template)

**This file IS committed to git:**

```bash
# Resume Analyzer - Environment Configuration Template
# Copy to .env.local for local development

# Resume analysis webhook (n8n)
REACT_APP_ANALYSIS_WEBHOOK=https://shreyahubcredo.app.n8n.cloud/webhook-test/YOUR-WEBHOOK-ID

# LaTeX compilation backend
REACT_APP_BACKEND_URL=http://localhost:3001

# Environment identifier
REACT_APP_ENVIRONMENT=local

# ===========================
# ENVIRONMENT-SPECIFIC VALUES
# ===========================

# LOCAL:
# REACT_APP_ANALYSIS_WEBHOOK=https://.../webhook-test/...
# REACT_APP_BACKEND_URL=http://localhost:3001
# REACT_APP_ENVIRONMENT=local

# TEST:
# REACT_APP_ANALYSIS_WEBHOOK=https://.../webhook-test/...
# REACT_APP_BACKEND_URL=https://your-test-backend.com
# REACT_APP_ENVIRONMENT=test

# PRODUCTION:
# REACT_APP_ANALYSIS_WEBHOOK=https://.../webhook/...
# REACT_APP_BACKEND_URL=https://your-prod-backend.com
# REACT_APP_ENVIRONMENT=production
```

---

## GITHUB ACTIONS DEPLOYMENT CONFIGURATION

### Production Deployment Workflow

**File:** `.github/workflows/deploy.yml`

**Environment Variable Configuration:**

```yaml
# Current implementation (Line 24-25)
- name: Create .env file
  run: echo "REACT_APP_ANALYSIS_WEBHOOK=${{ secrets.REACT_APP_ANALYSIS_WEBHOOK }}" > .env

# Recommended enhancement
- name: Create production .env file
  run: |
    echo "REACT_APP_ANALYSIS_WEBHOOK=${{ secrets.REACT_APP_ANALYSIS_WEBHOOK }}" > .env
    echo "REACT_APP_BACKEND_URL=${{ secrets.REACT_APP_BACKEND_URL }}" >> .env
    echo "REACT_APP_ENVIRONMENT=production" >> .env
```

### GitHub Secrets Configuration

**Repository Settings → Secrets → Actions:**

| Secret Name | Value (Production) |
|-------------|-------------------|
| `REACT_APP_ANALYSIS_WEBHOOK` | `https://shreyahubcredo.app.n8n.cloud/webhook/2227bd6f-2f86-470d-a2d0-d8ff386eb788` |
| `REACT_APP_BACKEND_URL` | `https://latex-compiler-production.com` (when deployed) |

**For Test Deployments:**
- Use GitHub Environments feature
- Create separate `test` environment with test-specific secrets
- Deploy to different branch or preview URL

---

## ENVIRONMENT SWITCHING BEHAVIOR

### Expected Behavior Matrix

| Scenario | Environment | Webhook | Backend | Result |
|----------|-------------|---------|---------|--------|
| Developer on Mac | Local | Test | localhost:3001 | Manual n8n activation, local LaTeX |
| Developer on Windows | Local | Test | localhost:3001 | Manual n8n activation, local LaTeX |
| Preview build | Test | Test | Cloud test | Manual n8n activation, cloud LaTeX |
| Production deploy | Production | Prod | Cloud prod | Always active, cloud LaTeX |

### Developer Workflow

**Starting Local Development:**
```bash
# 1. Copy environment template
cp .env.example .env.local

# 2. Edit .env.local with your settings
# (no changes needed if using default test webhook)

# 3. Start backend LaTeX server
cd backend && npm start
# → Server runs on http://localhost:3001

# 4. Start frontend dev server (in new terminal)
npm start
# → Frontend runs on http://localhost:3000

# 5. Before testing: Activate n8n test webhook
# → Go to n8n dashboard
# → Click "Execute Workflow" button
# → Webhook active for ONE request

# 6. Test resume upload in browser
# → http://localhost:3000/Resume-Reader
```

---

## ENVIRONMENT INDICATOR (UI ENHANCEMENT)

### Proposed Feature

Add visual indicator to show current environment:

**Location:** Top-right corner of header

**Display Logic:**
```javascript
{process.env.REACT_APP_ENVIRONMENT === 'local' && (
  <div className="env-indicator env-local">
    🔧 Local Dev
  </div>
)}

{process.env.REACT_APP_ENVIRONMENT === 'test' && (
  <div className="env-indicator env-test">
    🧪 Test Environment
  </div>
)}

{/* No indicator in production */}
```

**Benefits:**
- Developers know which backend they're hitting
- Prevents confusion during testing
- Hidden in production (no noise for end users)

---

## TROUBLESHOOTING GUIDE

### Common Issues

**Issue 1: "Load Fail" Error**
- **Cause:** Wrong webhook URL or inactive test webhook
- **Solution:**
  - Check `.env` file has correct URL
  - If using test webhook, activate in n8n UI
  - Verify URL in browser console: `console.log(process.env.REACT_APP_ANALYSIS_WEBHOOK)`

**Issue 2: LaTeX Preview Not Working**
- **Cause:** Backend server not running or wrong URL
- **Solution:**
  - Local: Check `backend/server.js` is running on port 3001
  - Test/Prod: Check cloud service is deployed and accessible
  - Verify URL: `curl http://localhost:3001/health`

**Issue 3: Environment Variable Not Updating**
- **Cause:** React doesn't hot-reload .env changes
- **Solution:**
  - Stop dev server (Ctrl+C)
  - Restart with `npm start`
  - Changes only apply on new build

**Issue 4: GitHub Actions Build Using Wrong Webhook**
- **Cause:** GitHub secret not configured or wrong value
- **Solution:**
  - Go to repo Settings → Secrets → Actions
  - Verify `REACT_APP_ANALYSIS_WEBHOOK` is set to PRODUCTION URL (not test URL)
  - Re-run workflow

---

## TESTING CHECKLIST

### Local Development Testing

- [ ] `.env.local` file created with test webhook
- [ ] Backend server running on localhost:3001
- [ ] Backend health check passes: `curl http://localhost:3001/health`
- [ ] n8n test webhook activated (clicked "Execute Workflow")
- [ ] Frontend loads at http://localhost:3000/Resume-Reader
- [ ] Resume upload succeeds
- [ ] Analysis results display correctly
- [ ] LaTeX editor shows suggested resume
- [ ] LaTeX preview renders PDF

### Production Deployment Testing

- [ ] GitHub secret `REACT_APP_ANALYSIS_WEBHOOK` set to production URL
- [ ] GitHub secret `REACT_APP_BACKEND_URL` set (if using cloud LaTeX)
- [ ] GitHub Actions workflow runs successfully
- [ ] Deployed site accessible at GitHub Pages URL
- [ ] Resume upload works (no manual activation needed)
- [ ] No environment indicator visible in UI

---

## ACCEPTANCE CRITERIA

- [x] Webhook routing strategy documented
- [x] Environment variables specified for all 3 environments
- [x] .env.example file template created
- [x] GitHub Actions configuration specified
- [x] Troubleshooting guide provided
- [x] Testing checklist created
- [ ] **Developer implements environment routing logic**
- [ ] **All 3 environments tested successfully**
- [ ] **Documentation verified against actual behavior**

---

## DEVELOPER HANDOFF

**To: Frontend Developer**
**From: Project Coordinator**

**Action Items:**
1. Implement environment routing logic (see "Recommended Enhancement" section)
2. Add environment indicator UI component
3. Update GitHub Actions workflow to include all env vars
4. Test all 3 environments using checklist

**To: DevOps/Deployment Engineer**
**From: Project Coordinator**

**Action Items:**
1. Configure GitHub Secrets for production webhook
2. Set up cloud LaTeX compilation service (if not using local only)
3. Configure environment-specific deployments
4. Document LaTeX backend deployment steps

**Estimated Effort:** 2-3 hours

---

## NEXT STEP
Proceed to **STEP 5**: Specify real-time LaTeX render pipeline requirements.
