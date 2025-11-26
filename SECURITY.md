# Security Guide - Fireflies.ai Clone

## 🔒 Production Security Checklist

Before deploying to production, ensure ALL of the following security measures are implemented:

### 🚨 CRITICAL: Environment Configuration

#### Required Secrets

**JWT Secrets** (MANDATORY - Application will not start without these)
```bash
# Generate secure JWT secrets (minimum 32 characters)
openssl rand -base64 32  # Use for JWT_SECRET
openssl rand -base64 32  # Use for JWT_REFRESH_SECRET
```

**Encryption Key** (Required for sensitive data encryption)
```bash
# Generate AES-256 encryption key (exactly 32 characters)
openssl rand -hex 32  # Use for ENCRYPTION_KEY
```

#### Environment Variables Security

✅ **DO:**
- Store secrets in environment variables or secret management service (AWS Secrets Manager, HashiCorp Vault)
- Use different secrets for each environment (dev, staging, production)
- Rotate secrets periodically (every 90 days recommended)
- Use `.env` files for local development only (NEVER commit to git)

❌ **DON'T:**
- Commit `.env` files to version control
- Use default or example values in production
- Share secrets via email, Slack, or other insecure channels
- Reuse secrets across different services

### 🔐 Authentication & Authorization

#### Implemented Security Features

✅ **JWT with httpOnly Cookies**
- Tokens stored in secure httpOnly cookies (protected against XSS)
- Automatic token refresh mechanism
- Token blacklisting for logout

✅ **Rate Limiting**
- Login/Register: 5 attempts per 15 minutes
- Password Reset: 3 attempts per hour
- Prevents brute force attacks

✅ **Password Security**
- Minimum 8 characters
- Requires: uppercase, lowercase, number, special character
- Bcrypt hashing with 12 rounds
- Password reset with one-time tokens (1 hour expiry)

✅ **Session Management**
- Session tracking with device info
- Session expiration (7 days default)
- Logout invalidates sessions

#### Additional Recommendations

🔒 **Enable MFA** for admin accounts
🔒 **Implement account lockout** after failed login attempts
🔒 **Add CAPTCHA** on registration and login forms
🔒 **Monitor suspicious activity** (multiple failed logins, unusual locations)

### 🌐 HTTPS & Transport Security

**Production Requirements:**

```nginx
# Force HTTPS redirect
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS configuration
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL certificates
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Modern SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
}
```

**Environment Variables:**
```env
COOKIE_SECURE=true  # REQUIRED for production
NODE_TLS_REJECT_UNAUTHORIZED=1  # Verify SSL certificates
```

### 🛡️ Security Headers

The application uses Helmet.js with the following headers:

```javascript
// Configured in apps/api/src/index.ts
helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
})
```

### 🔍 Data Protection

#### Encryption at Rest

**Sensitive Data Fields** (encrypted before storage):
- MFA secrets
- OAuth tokens
- API keys
- Integration credentials

**Implementation:**
```typescript
import { encrypt, decrypt } from './utils/encryption';

// Before saving to database
const encryptedToken = encrypt(token, process.env.ENCRYPTION_KEY);

// When retrieving from database
const decryptedToken = decrypt(encryptedData, process.env.ENCRYPTION_KEY);
```

#### Encryption in Transit

- All API communication over HTTPS
- WebSocket connections over WSS
- Database connections with SSL

### 📊 Logging & Monitoring

**What to Log:**
✅ Authentication events (login, logout, failed attempts)
✅ Authorization failures
✅ Critical errors
✅ Security events (password resets, MFA changes)

**What NOT to Log:**
❌ Passwords
❌ JWT tokens
❌ Session IDs
❌ Credit card numbers
❌ PII without proper redaction

**Implemented Logging:**
```typescript
// Production-safe logging (Chrome Extension)
Logger.error('Authentication failed', error);  // Sends to backend
Logger.analytics('meeting_detected', { platform: 'zoom' });  // No PII

// Backend logging (Winston)
logger.info('User login', { userId, ipAddress, userAgent });
logger.error('Database error', { error: error.message, stack: error.stack });
```

### 🚨 Incident Response

**Security Incident Procedures:**

1. **Detect**: Monitor logs and alerts
2. **Contain**: Disable compromised accounts/tokens
3. **Investigate**: Review audit logs
4. **Remediate**: Fix vulnerability, rotate secrets
5. **Notify**: Inform affected users if data breach

**Emergency Actions:**
```bash
# Rotate JWT secrets immediately
# 1. Generate new secrets
openssl rand -base64 32

# 2. Update environment variables
# 3. Restart application (all users will be logged out)

# Revoke all sessions
# Run in production console:
await prisma.session.deleteMany({});

# Blacklist specific user sessions
await prisma.session.deleteMany({ where: { userId: 'compromised-user-id' }});
```

### 🔐 Database Security

**PostgreSQL Configuration:**
```sql
-- Enable SSL connections
ssl = on
ssl_cert_file = '/path/to/server.crt'
ssl_key_file = '/path/to/server.key'

-- Restrict connections
listen_addresses = 'localhost'
max_connections = 100

-- Enable logging
log_connections = on
log_disconnections = on
log_statement = 'mod'  # Log all data-modifying queries
```

**Redis Security:**
```conf
# Require authentication
requirepass your-strong-redis-password

# Bind to localhost only
bind 127.0.0.1

# Disable dangerous commands
rename-command FLUSHDB ""
rename-command FLUSHALL ""
rename-command CONFIG ""
```

### 📦 Dependency Security

**Regular Security Audits:**
```bash
# Check for vulnerabilities
npm audit

# Fix automatically (review changes!)
npm audit fix

# Update dependencies
npm outdated
npm update

# Use Snyk or similar for continuous monitoring
npx snyk test
```

**Recommended Tools:**
- Snyk (vulnerability scanning)
- Dependabot (automated updates)
- npm audit (built-in security check)

### 🔄 Security Maintenance

**Monthly:**
- Review audit logs
- Check for failed login attempts
- Update dependencies
- Review user permissions

**Quarterly:**
- Rotate JWT secrets
- Rotate database passwords
- Review and update security policies
- Conduct security training

**Annually:**
- Full security audit
- Penetration testing
- Compliance review (GDPR, SOC2, etc.)
- Update incident response plan

### 🚫 Known Limitations & Roadmap

**Current Limitations:**
- No automatic account lockout (after failed logins)
- No IP-based rate limiting
- No geo-blocking capabilities
- No advanced threat detection

**Security Roadmap:**
- [ ] Implement Web Application Firewall (WAF)
- [ ] Add anomaly detection for suspicious activity
- [ ] Implement SAML 2.0 for enterprise SSO
- [ ] Add security event alerting (Slack, email)
- [ ] Implement data loss prevention (DLP)

### 📞 Security Contacts

**Reporting Security Vulnerabilities:**

If you discover a security vulnerability, please email:
- **Security Team**: security@yourcompany.com
- **DO NOT** create public GitHub issues for security vulnerabilities

**Expected Response Time:**
- Critical: 24 hours
- High: 48 hours
- Medium: 1 week
- Low: 2 weeks

### 📚 Additional Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Express Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

## 🎯 Quick Production Deployment Checklist

Before going live, verify:

- [ ] All environment variables configured with secure values
- [ ] JWT_SECRET and JWT_REFRESH_SECRET are strong (>32 chars)
- [ ] COOKIE_SECURE=true in production
- [ ] HTTPS enabled with valid SSL certificate
- [ ] Database connections use SSL
- [ ] Redis password set
- [ ] Rate limiting enabled
- [ ] Security headers configured
- [ ] Audit logging enabled
- [ ] Monitoring and alerting set up
- [ ] Backup and disaster recovery tested
- [ ] Incident response plan documented

**Remember: Security is not a one-time task. It requires continuous monitoring, updating, and improvement.**
