# Security Policy

## Supported Versions

We actively support the following versions of our website:

| Version | Supported          |
| ------- | ------------------ |
| 3.x.x   | :white_check_mark: |
| 2.x.x   | :white_check_mark: |
| < 2.0   | :x:                |

## Reporting a Vulnerability

We take security seriously at Burni Token. If you discover a security vulnerability, please report it responsibly.

### How to Report

1. **Email**: security@burnitoken.com
2. **Discord**: Direct message to administrators
3. **Telegram**: Contact @burnicoin_admin

### What to Include

Please include the following information in your report:

- Description of the vulnerability
- Steps to reproduce the issue
- Potential impact assessment
- Suggested fix (if any)
- Your contact information

### Response Timeline

- **Initial Response**: Within 24 hours
- **Status Update**: Within 72 hours
- **Resolution**: Within 30 days (depending on severity)

### Security Measures

Our website implements multiple security layers:

#### Content Security Policy (CSP)
- Strict CSP headers to prevent XSS attacks
- Nonce-based script execution
- Restricted resource loading

#### HTTP Security Headers
- HSTS (HTTP Strict Transport Security)
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

#### Data Protection
- No personal data collection without consent
- Secure transmission (HTTPS only)
- Regular security audits

#### Infrastructure Security
- Regular dependency updates
- Automated vulnerability scanning
- Secure hosting environment

### Responsible Disclosure

We follow responsible disclosure practices:

1. **Investigation**: We investigate all reports thoroughly
2. **Confirmation**: We confirm the vulnerability exists
3. **Fix Development**: We develop and test a fix
4. **Deployment**: We deploy the fix to production
5. **Public Disclosure**: We may publicly disclose after fix deployment

### Bug Bounty

Currently, we do not offer a formal bug bounty program. However, we appreciate security researchers and may offer recognition for significant findings.

### Contact

For any security-related questions or concerns:

- **Security Team**: security@burnitoken.com
- **General Contact**: hello@burnitoken.com

Thank you for helping keep Burni Token secure!
