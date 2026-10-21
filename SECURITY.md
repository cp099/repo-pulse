# Security Policy

## 🛡️ Supported Versions

RepoPulse follows a continuous delivery release model hosted directly on GitHub Pages. Only the latest release on the `main` branch is actively supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

---

## 🔒 Security Architecture: Zero-Intermediary Guarantee

RepoPulse is engineered with a strict **client-direct security model**:

1. **Direct Browser-to-GitHub Communication**:
   - All queries to `api.github.com` (such as Dependabot alerts, CodeQL static findings, and Pages deployments) execute directly from your web browser over secure HTTPS.
   - There are **no proxy servers or backend intermediaries** reading your repository contents, tokens, or security advisories.

2. **Token Security**:
   - When signing in via 1-Click GitHub OAuth, your access token is preserved strictly in runtime memory and browser LocalStorage.
   - Tokens are never logged, forwarded, or shared with third parties.

3. **Cloud Synchronization (Firestore)**:
   - If Firebase cloud sync is active, data is stored under project `repopulse-app-71baa` and guarded by strict production Firestore security rules:
     ```javascript
     match /user_dashboards/{userId} {
       allow read, write: if request.auth != null && request.auth.uid == userId;
     }
     ```
   - Only your authenticated GitHub UID can read or modify your dashboard records.

---

## 🚨 Reporting a Vulnerability

We take the security of RepoPulse and its users seriously. If you discover a security vulnerability, please report it responsibly:

1. **Do not create a public issue** on GitHub.
2. Report via GitHub's [Private Vulnerability Reporting](https://github.com/cp099/repo-pulse/security/advisories/new).
3. Alternatively, email the maintainer directly at **chiragpatil07@gmail.com** with the subject `[SECURITY VULNERABILITY] RepoPulse`.

### What to Include in Your Report:
- A detailed description of the vulnerability.
- Steps or a minimal proof of concept (PoC) to reproduce the issue.
- Potential impact and affected components.
- Any suggested remediation or patch.

We will acknowledge receipt within **24 hours** and provide a timeline for resolution. Once addressed, security advisories will be published with attribution to the reporter.
