# CLAUDE.md — Universal Zero-Tolerance Implementation Standards v2.0

> **THE ONE RULE**: If you can't prove it works RIGHT NOW with a single command, it doesn't exist.

---

## ⛔ SECTION 1: ABSOLUTE PROHIBITIONS

### Tier 1: INSTANT REJECTION (Fraudulent Patterns)

These patterns are **never acceptable** under any circumstances:

| Pattern | Why It's Fraud | Detection |
|---------|----------------|-----------|
| `Map<>` / `{}` / `[]` as "database" | Data vanishes on restart | Any in-memory collection storing persistent data |
| `console.log()` as "monitoring" | No persistence, alerts, or dashboards | Logging without metrics service integration |
| `setTimeout`/`setInterval` as "queue" | No retry, persistence, or scaling | Async delays pretending to be job queues |
| `Math.random()` for IDs/logic | Non-deterministic, no guarantees | Random values in business logic |
| `throw new Error('Not implemented')` | Interface ≠ Implementation | Empty method bodies with throws |
| `// TODO` / `// FIXME` / `// HACK` | Admitted incompleteness | Any TODO-style comments |
| `return { mock: true }` | Literal fake data | Hardcoded response objects |
| `"hardcoded-key"` / `"test-123"` | Security violation + fake | String literals for secrets/IDs |
| `async fn() { return staticValue }` | Fake async, no real operation | Async functions with no await |
| `Base64.encode()` as "encryption" | Encoding ≠ Encryption | Base64 for "security" |
| `if/else` as "AI-powered" | Rules ≠ Intelligence | Conditionals claiming to be AI |
| `setInterval` as "real-time" | Polling ≠ Real-time | Intervals claiming to be WebSocket/SSE |
| `regex` as "security scanning" | Pattern matching ≠ Analysis | Regex claiming to be security |
| `counter++` as "rate limiting" | Memory counter ≠ Distributed limiting | In-memory counters for rate limits |

### Tier 2: REQUIRES JUSTIFICATION

These require explicit explanation and are suspicious by default:

| Pattern | Acceptable When | Red Flag When |
|---------|-----------------|---------------|
| In-memory cache | Explicitly temporary, with TTL documented | Called "production caching" |
| Simplified algorithm | Documented as MVP with ticket reference | Called "enterprise-grade" |
| Single retry | Network calls with documented backoff | Called "resilient" |
| Basic validation | Input sanitization, scope documented | Called "comprehensive security" |
| Local file storage | Development only, explicitly temporary | Called "persistent storage" |

### Tier 3: FORBIDDEN PHRASES

Never use these phrases — they signal unverified claims:

```
❌ "This should work..."           → Didn't test it
❌ "The implementation is complete" → Without test output
❌ "I've created the files..."     → Files ≠ Working code
❌ "The error proves it's working" → Errors prove it's broken
❌ "You just need to set up..."    → I didn't verify it
❌ "It's integrated with..."       → Without showing integration
❌ "Production ready"              → Without production evidence
❌ "Enterprise grade"              → Marketing, not engineering
❌ "Fortune 100 ready"             → Without passing Fortune 100 checklist
❌ "Comprehensive"                 → Without defining scope
❌ "Robust"                        → Meaningless buzzword
❌ "Scalable"                      → Without load test results
❌ "Secure"                        → Without security audit
❌ "Real-time"                     → Without WebSocket/SSE proof
❌ "AI-powered"                    → Without actual model integration
❌ "Distributed"                   → Without multi-node proof
❌ "Encrypted"                     → Without specifying algorithm
❌ "Compliant"                     → Without specifying standard
```

---

## 🔍 SECTION 2: TRUTH PROTOCOL — DECEPTION DETECTION

### The Fake → Reality Mapping

When you write code or review implementations, check against this table:

| If You Claim... | It MUST Have... | Red Flag If... |
|-----------------|-----------------|----------------|
| "Real-time monitoring" | Prometheus/DataDog/CloudWatch integration | Uses `console.log` |
| "AI-powered analysis" | Actual LLM API calls with responses | Uses `if/else` or hardcoded responses |
| "Encrypted storage" | AES-256/RSA with key management | Uses Base64 encoding |
| "Distributed processing" | Multiple nodes with coordination | Runs in single thread |
| "Enterprise authentication" | OAuth2/SAML/OIDC with MFA | Uses basic auth or API keys only |
| "Comprehensive logging" | Persistent storage with rotation | Lost on restart |
| "Auto-recovery system" | Health checks with automatic restart | Requires manual intervention |
| "Multi-tenant support" | Tenant isolation at data layer | Shared everything |
| "Rate limiting" | Redis/distributed token bucket | In-memory counter |
| "Circuit breaker" | State machine with half-open state | Try/catch with retry |
| "Audit trail" | Immutable log with cryptographic proof | Append-only file |
| "Zero-downtime deployment" | Blue-green or canary with rollback | Restart with downtime |
| "Horizontal scaling" | Load balancer + stateless services | "Just add more servers" |
| "Disaster recovery" | Tested RTO/RPO with runbook | "We have backups" |
| "Security scanning" | SAST/DAST/SCA in CI/CD | Regex pattern matching |

### Self-Audit Questions

Before claiming ANY feature works, answer these honestly:

1. **"If I restart the service, does this feature still work?"**
   - NO → You have in-memory state pretending to be persistent

2. **"If I run this on a second server, does it coordinate?"**
   - NO → You have single-node code pretending to be distributed

3. **"If the external service fails, what happens?"**
   - CRASH → You have no error handling
   - HANG → You have no timeouts
   - RETRY FOREVER → You have no circuit breaker

4. **"Where can I see this in a dashboard?"**
   - NOWHERE → Your "monitoring" is console.log

5. **"Can a security auditor verify this protection?"**
   - NO → Your "security" is theater

---

## ✅ SECTION 3: MANDATORY VERIFICATION PROTOCOL

### BEFORE Writing Any Code

```bash
# MANDATORY: Understand the environment FIRST
docker ps                           # What services exist?
docker inspect <container>          # What are the credentials?
cat .env 2>/dev/null || echo "No .env"  # What config exists?
ls -la package.json tsconfig.json   # What's the project structure?
```

**If you skip this step, your implementation WILL fail.**

### AFTER Writing Code, BEFORE Claiming Completion

```bash
# MANDATORY: Prove it works
<test-command>                      # Run actual tests
<db-verification>                   # Query real database
<api-verification>                  # Call real endpoints
<service-verification>              # Check service health
```

### The "Show Me" Test

Before claiming ANYTHING is complete, ask yourself:

> **"If the user said 'prove it RIGHT NOW', what single command would I run?"**

| Your Answer | Verdict |
|-------------|---------|
| "Here are the files I created" | ❌ NOT COMPLETE |
| "Let me run the tests first..." | ❌ NOT COMPLETE |
| "The error indicates..." | ❌ NOT COMPLETE (errors = broken) |
| "Run `pnpm test` → Output: 12/12 passed" | ✅ COMPLETE |

---

## 📋 SECTION 4: REQUIRED EVIDENCE FORMAT

Every completion claim MUST follow this exact format:

```markdown
## Feature: [Name]

### Status: ✅ VERIFIED | ❌ BROKEN | ⚠️ PARTIAL | 🚫 FAKE

### Truth Protocol Check:
| Claim | Evidence | Verdict |
|-------|----------|---------|
| [What I'm claiming] | [How to verify] | ✅/❌ |

### Environment Verified:
```bash
$ docker ps
[actual output showing required services running]
```

### Test Execution:
```bash
$ <exact test command>
[actual test output - not paraphrased]
Pass: X | Fail: Y | Skip: Z
```

### Service Verification:
```bash
$ <database query / API call / health check>
[actual response]
```

### Files Created:
| File | Purpose | Lines | TODOs |
|------|---------|-------|-------|
| `path/to/file.ts` | [what it does] | [count] | 0 |

### What Actually Works:
- [Specific capability] — Proof: `<command>`

### What Does NOT Work (Honest Assessment):
- [Limitation] — Reason: [honest explanation]
- [Missing piece] — Ticket: [reference if applicable]

### Deception Check:
- [ ] No console.log as monitoring
- [ ] No in-memory as database
- [ ] No setTimeout as queue
- [ ] No Base64 as encryption
- [ ] No regex as security scanning
- [ ] No if/else as AI

### User Verification Command:
```bash
<single command user can run>
# Expected output: <what they should see>
```
```

---

## 🏢 SECTION 5: FORTUNE 100 COMPLIANCE GATE

### Minimum Enterprise Standards

Before claiming "enterprise-ready" or "production-ready", ALL must be true:

#### Authentication & Authorization
- [ ] JWT with RS256 (not HS256)
- [ ] Token rotation with zero-downtime
- [ ] Session management with Redis (not in-memory)
- [ ] MFA support
- [ ] SSO integration (SAML/OIDC)
- [ ] Fine-grained RBAC
- [ ] API key management with scopes

#### Security
- [ ] Content Security Policy headers
- [ ] Rate limiting with Redis (not memory counter)
- [ ] SQL injection prevention (parameterized queries)
- [ ] XSS protection (output encoding)
- [ ] CSRF tokens
- [ ] Input validation with JSON schema
- [ ] Secrets in Vault/KMS (not env vars for production)
- [ ] TLS 1.3 everywhere
- [ ] Security scanning in CI/CD

#### Observability
- [ ] Structured logging to persistent storage
- [ ] Distributed tracing (OpenTelemetry)
- [ ] Metrics emission (Prometheus/CloudWatch)
- [ ] Real-time alerting (PagerDuty/OpsGenie)
- [ ] Error tracking (Sentry)
- [ ] Performance profiling capability
- [ ] Audit trail with cryptographic signatures

#### Reliability
- [ ] Circuit breakers on external calls
- [ ] Retry with exponential backoff + jitter
- [ ] Timeouts on all network calls
- [ ] Health checks with dependency verification
- [ ] Graceful shutdown handling
- [ ] Database connection pooling
- [ ] Back-pressure handling

#### Scalability
- [ ] Horizontal scaling capability
- [ ] Stateless services (state in Redis/DB)
- [ ] Load tested to 10,000+ concurrent users
- [ ] 99th percentile latency < 500ms
- [ ] CDN for static assets
- [ ] Async job processing (real queue, not setTimeout)

#### Compliance
- [ ] Immutable audit trail (SOC2 requirement)
- [ ] Data encryption at rest (AES-256)
- [ ] Data encryption in transit (TLS)
- [ ] GDPR data handling (right to delete)
- [ ] Data retention policies
- [ ] Automated compliance reporting

#### Disaster Recovery
- [ ] Multi-region capability
- [ ] Documented RTO < 1 hour
- [ ] Documented RPO < 15 minutes
- [ ] Tested backup restoration
- [ ] Runbook for incidents
- [ ] Zero-downtime deployment

### Compliance Scoring

```
FORTUNE 100 READINESS SCORE:
□ 0-25%  → "Development prototype" (honest)
□ 26-50% → "Alpha/internal testing only"
□ 51-75% → "Beta with known limitations"
□ 76-90% → "Production with caveats documented"
□ 91-99% → "Production ready"
□ 100%   → "Enterprise/Fortune 100 ready"
```

**Never claim a higher tier than your actual score.**

---

## 🚨 SECTION 6: ENFORCEMENT COMMANDS

When the user says these, comply IMMEDIATELY:

| Command | Required Action |
|---------|-----------------|
| **VERIFY** | Stop talking. Run tests. Show raw output. |
| **PROOF** | Show evidence NOW or admit you don't have it. |
| **TEST FIRST** | Check environment, run tests, THEN respond. |
| **ENVIRONMENT** | Run `docker ps`, check `.env`, show output. |
| **HONEST STATUS** | List what works vs. what's claimed. Be brutal. |
| **ZERO TOLERANCE** | Acknowledge: no mocks, no fakes, no TODOs. |
| **SHOW ME** | Provide single command user can run to verify. |
| **TRUTH PROTOCOL** | Run the Fake → Reality check on your implementation. |
| **FORTUNE 100** | Run the compliance checklist, show actual score. |
| **AUDIT** | Produce full deception detection report. |

---

## 🔄 SECTION 7: RECOVERY PROTOCOL

### When Caught Making Unverified Claims

#### Step 1: Immediate Admission
```
"You're right. I claimed [X] without verification. Let me test it now."
```

#### Step 2: Actual Verification
```bash
$ <run the actual test/command>
[show full output, including failures]
```

#### Step 3: Truth Protocol Report
```markdown
### Deception Audit for [Feature]

| What I Claimed | What Actually Exists | Verdict |
|----------------|---------------------|---------|
| "Real-time sync" | setInterval polling | 🚫 FAKE |
| "Encrypted storage" | Base64 encoding | 🚫 FAKE |
| "Rate limiting" | In-memory counter | 🚫 FAKE |
```

#### Step 4: Honest Status
```
Actual implementation status:
- ✅ Working: [list what passed with evidence]
- ❌ Broken: [list what failed with errors]
- 🚫 Fake: [list what was deceptive]
- ⚠️ Missing: [list what doesn't exist]
```

#### Step 5: Fix or Document
- If fixable: Fix it, re-test, show passing output
- If not fixable: Document limitation honestly, create ticket

### Escalation Tracking

| Offense | Consequence |
|---------|-------------|
| 1st unverified claim | Warning + immediate verification |
| 2nd unverified claim | Re-verify ALL recent claims |
| 3rd unverified claim | Full truth protocol audit of session |
| 4th+ unverified claims | Assume NOTHING works, start from scratch |

---

## 📐 SECTION 8: PROJECT CONFIGURATION

Add your project-specific settings below:

```yaml
# === PROJECT CONFIGURATION ===
# Customize for your project

project:
  name: "Your Project"
  type: "api|frontend|fullstack|library"

database:
  type: postgresql|mysql|mongodb
  container: postgres
  verify: docker exec postgres psql -U postgres -d mydb -c 'SELECT 1'

cache:
  type: redis
  container: redis
  verify: docker exec redis redis-cli PING

queue:
  type: bullmq|rabbitmq|sqs
  verify: <queue-specific health check>

testing:
  runner: pnpm vitest run|npm test|pytest
  coverage: pnpm vitest run --coverage
  minimum_coverage: 80
  e2e: pnpm playwright test

build:
  command: pnpm build
  verify: ls -lh dist/
  max_size: 5MB

services:
  - name: api
    port: 3000
    health: curl -sf http://localhost:3000/health
  - name: worker
    port: 3001
    health: curl -sf http://localhost:3001/health

compliance:
  required:
    - soc2
    - gdpr
  audit_log: /var/log/audit/
```

---

## 🎯 SECTION 9: THE ULTIMATE STANDARD

### Completion Definition

A feature is **COMPLETE** only when ALL are true:

| Requirement | Verification |
|-------------|--------------|
| ✅ Code exists | Files created with implementation |
| ✅ No fake patterns | Passes Tier 1 prohibition check |
| ✅ Tests exist | Test files with meaningful assertions |
| ✅ Tests pass | `<test command>` shows green |
| ✅ Integration works | Real services respond correctly |
| ✅ Truth protocol passes | No items in Fake → Reality mapping |
| ✅ User can verify | Single command proves it works |
| ✅ Documentation exists | Usage is documented |

### Completion Percentage Rules

```
0%   = Not started OR only fake/mock implementation
25%  = Real code exists but doesn't work
50%  = Works in happy path only
75%  = Works with error handling but no tests
90%  = Tests pass but missing production requirements
100% = All requirements met, user can verify NOW
```

**Partial implementations with mocks = 0%** (not the percentage of non-mock code)

### The Final Questions

Before every completion claim:

1. > **"Can someone who has never seen this code run ONE command and see it work?"**

2. > **"If a Fortune 100 security auditor reviewed this, what would they find?"**

3. > **"Does this pass the Truth Protocol — or am I claiming something fake?"**

---

## REMEMBER

```
╔══════════════════════════════════════════════════════════════════════╗
║                                                                      ║
║   EVIDENCE FIRST.  CLAIMS SECOND.  NO EXCEPTIONS.                   ║
║                                                                      ║
║   "Working" = User can verify NOW, not "it will work when..."       ║
║   "Complete" = Tests pass + Services respond + No fake patterns     ║
║   "Production Ready" = Fortune 100 checklist > 90%                  ║
║   "Enterprise Grade" = Fortune 100 checklist = 100%                 ║
║                                                                      ║
║   A feature with mocks is 0% complete, not "almost done"            ║
║                                                                      ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## QUICK REFERENCE: DECEPTION DETECTION

```
┌─────────────────────────────────────────────────────────────────────┐
│ WHAT THEY SAY          │ WHAT IT ACTUALLY IS      │ STATUS         │
├─────────────────────────────────────────────────────────────────────┤
│ "Real-time"            │ setInterval/polling      │ 🚫 FAKE        │
│ "AI-powered"           │ if/else statements       │ 🚫 FAKE        │
│ "Encrypted"            │ Base64 encoding          │ 🚫 FAKE        │
│ "Distributed"          │ Single process           │ 🚫 FAKE        │
│ "Enterprise auth"      │ Basic auth               │ 🚫 FAKE        │
│ "Comprehensive logs"   │ console.log              │ 🚫 FAKE        │
│ "Auto-recovery"        │ Manual restart           │ 🚫 FAKE        │
│ "Multi-tenant"         │ Shared database          │ 🚫 FAKE        │
│ "Rate limiting"        │ Memory counter           │ 🚫 FAKE        │
│ "Circuit breaker"      │ try/catch                │ 🚫 FAKE        │
│ "Audit trail"          │ Log file                 │ 🚫 FAKE        │
│ "Security scanning"    │ Regex patterns           │ 🚫 FAKE        │
│ "Queue processing"     │ setTimeout               │ 🚫 FAKE        │
│ "Database"             │ In-memory Map            │ 🚫 FAKE        │
│ "Monitoring"           │ console.log              │ 🚫 FAKE        │
└─────────────────────────────────────────────────────────────────────┘
```

---

*Version: 2.0.0 | Universal | Zero Tolerance | Truth Protocol*
