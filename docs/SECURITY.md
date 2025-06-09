# Security Implementation Guide

## Overview
This document outlines the security measures implemented in the IoT Dashboard Platform and provides guidance for production deployment.

## 🔐 Authentication & Authorization

### JWT Token Security
- **Access tokens**: 15-minute expiration
- **Refresh tokens**: 7-day expiration, stored in database
- **Secure storage**: httpOnly cookies with SameSite protection
- **Production requirement**: Strong JWT secrets (32+ characters)

### Rate Limiting
- **Authentication endpoints**: 5 attempts per 15 minutes
- **General API**: 60 requests per minute
- **Internal data ingestion**: 1000 requests per minute
- **Headers**: `X-RateLimit-*` headers provide client feedback

## 🛡️ Internal API Security

### API Key Protection
- **Endpoint**: `/api/internal/data` (for MQTT client data ingestion)
- **Header**: `X-Internal-API-Key` required
- **Key generation**: Use cryptographically secure random strings
- **Rotation**: Regularly rotate internal API keys

```bash
# Generate secure API key
openssl rand -base64 32
```

### Data Validation
- **Zod schemas**: Strict validation for all incoming data
- **Device token validation**: UUID format enforcement
- **Topic validation**: MQTT topic format checking
- **Payload validation**: JSON structure verification

## 🔒 CORS & Network Security

### Cross-Origin Resource Sharing
- **Configured origins**: Restrict to specific domains
- **Credentials**: Enabled for cookie-based auth
- **Headers**: Controlled allowed headers and methods

### Environment Variables
```bash
# Required in production
JWT_SECRET="your-secure-jwt-secret-32-chars-min"
JWT_REFRESH_SECRET="your-secure-refresh-secret-32-chars-min"
INTERNAL_API_KEY="your-secure-internal-api-key"

# Optional but recommended
ALLOWED_ORIGINS="https://yourdomain.com,https://www.yourdomain.com"
LOG_LEVEL="warn"  # Reduce log verbosity in production
```

## 📊 Logging & Monitoring

### Structured Logging
- **Library**: Pino for high-performance logging
- **Levels**: DEBUG, INFO, WARN, ERROR
- **Components**: Separate loggers for auth, api, database, mqtt, security
- **Security events**: Failed login attempts, invalid API keys

### Security Event Monitoring
```typescript
// Security events automatically logged:
- login_failed_user_not_found
- login_failed_invalid_password
- invalid_api_key_attempt
- rate_limit_exceeded
```

## 🚨 Threat Mitigation

### Implemented Protections
1. **Brute Force**: Rate limiting on authentication
2. **Data Injection**: Zod validation and Prisma ORM
3. **XSS**: httpOnly cookies, no token exposure to JavaScript
4. **CSRF**: SameSite cookie protection
5. **Unauthorized Access**: JWT verification on all protected routes

### Additional Recommendations
1. **HTTPS Only**: Enforce SSL/TLS in production
2. **Security Headers**: Add security headers middleware
3. **Input Sanitization**: Sanitize all user inputs
4. **Database Encryption**: Enable database encryption at rest
5. **Network Isolation**: Use VPC/private networks

## 🏗️ Production Deployment Checklist

### Environment Security
- [ ] Strong JWT secrets (32+ characters)
- [ ] Secure internal API key
- [ ] Database credentials secured
- [ ] HTTPS/SSL certificates configured
- [ ] Environment variables not exposed

### Application Security
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] Logging level set to 'warn' or 'error'
- [ ] Error messages don't expose internal details
- [ ] Health checks don't expose sensitive info

### Infrastructure Security
- [ ] Database access restricted to application
- [ ] MQTT broker authentication enabled
- [ ] Network firewall rules configured
- [ ] Regular security updates scheduled
- [ ] Backup encryption enabled

## 🔄 MQTT Security (Future Enhancement)

### Recommended Improvements
1. **Authentication**: Username/password for each device
2. **Encryption**: TLS for all MQTT communications
3. **Access Control**: Device-specific topic permissions
4. **Certificate Management**: X.509 certificates for devices

### Implementation Guide
```yaml
# mosquitto.conf security configuration
allow_anonymous false
password_file /mosquitto/config/passwd
acl_file /mosquitto/config/acl.conf
listener 8883
cafile /mosquitto/certs/ca.crt
certfile /mosquitto/certs/server.crt
keyfile /mosquitto/certs/server.key
```

## 📈 Monitoring & Alerting

### Key Metrics to Monitor
- Failed authentication attempts per minute
- Internal API key violations
- Rate limit breaches
- Database connection errors
- MQTT connection failures

### Recommended Alerts
- Multiple failed login attempts from same IP
- Invalid internal API key usage
- Unusual data ingestion patterns
- Application error rate spikes
- Database performance degradation

## 🛠️ Security Testing

### Automated Tests
```bash
npm run test              # Run security unit tests
npm run test:coverage     # Generate coverage report
```

### Manual Security Testing
1. **Authentication bypass attempts**
2. **SQL injection testing**
3. **XSS vulnerability testing**
4. **Rate limit validation**
5. **API key security verification**

## 📞 Incident Response

### Security Incident Procedures
1. **Immediate**: Disable compromised API keys
2. **Assessment**: Review security logs for impact
3. **Containment**: Isolate affected systems
4. **Recovery**: Restore from secure backups
5. **Post-incident**: Update security measures

### Contact Information
- **Security Team**: [security@yourcompany.com]
- **Emergency Contact**: [emergency@yourcompany.com]
- **Incident Reporting**: [incidents@yourcompany.com]