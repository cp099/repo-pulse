# ⚡ RepoPulse

> **A real-time GitHub Health, Dependabot, CodeQL Security & Pages Build Dashboard.**  
> Monitor security vulnerabilities, code scanning alerts, and deployment health across all your repositories in one concise, unified interface.

![RepoPulse Dashboard Preview](https://img.shields.io/badge/Security-CodeQL%20%7C%20Dependabot-blue?style=for-the-badge&logo=github)
![GitHub Pages](https://img.shields.io/badge/Hosted%20On-GitHub%20Pages-22c55e?style=for-the-badge&logo=githubpages)
![React](https://img.shields.io/badge/Frontend-React%2018%20%2B%20Vite%20%2B%20Tailwind-61dafb?style=for-the-badge&logo=react)
![Firebase](https://img.shields.io/badge/Sync-Firebase%20Firestore-f58220?style=for-the-badge&logo=firebase)

---

## 🎯 The Problem Solved

Managing tens or hundreds of repositories on GitHub is tedious:
- You must navigate to each repository individually to check the **Security** tab for Dependabot vulnerabilities.
- CodeQL scanning results are buried across individual pull requests and repository settings.
- GitHub Pages build failures aren't surfaced in a single bird's-eye view.

**RepoPulse** consolidates your entire GitHub portfolio into a single dashboard that:
1. **Aggregates Health**: View high-level metrics for Critical/High Dependabot CVEs, CodeQL scanning flaws, and Pages build statuses.
2. **Reverse-Engineered GitHub Primer UI**: High-fidelity dark and light themes matching GitHub's exact design language and color tokens.
3. **Repository Onboarding & Feature Detection**: Probes which repositories have Dependabot, CodeQL, or Pages enabled so you only track what matters.
4. **Direct Deep Links**: One-click links straight to the offending GitHub alert page (`/security/dependabot/:id`, `/security/code-scanning/:id`, `/actions/runs/:id`).
5. **Continuous Live Updates**: Configurable background auto-refresh with countdown timer, manual instant refresh, and rate limit tracking.
6. **Deployable Anywhere**: Hosted for free on GitHub Pages with optional multi-device cloud synchronization via Firebase Firestore.

---

## 🚀 Quick Start

### 1. Run Locally
```bash
# Clone the repository
git clone https://github.com/cp099/repo-pulse.git
cd repo-pulse

# Install dependencies
npm install

# Start local development server
npm run dev
```

### 2. Connect Your GitHub Account
1. Open the dashboard (defaults to **Demo Mode** with realistic sample data).
2. Click **Settings** (gear icon) in the top right.
3. Paste a **GitHub Personal Access Token (classic or fine-grained)** with the following read scopes:
   - `security_events`: Read CodeQL code scanning alerts.
   - `repo`: Read Dependabot alerts & private repository statuses.
   - `actions:read`: Read GitHub Actions and Pages build statuses.
4. Click **Save Changes**.
5. Click **Track Repos** in the top bar to select which of your repositories to monitor!

---

## 🌐 Deploying to GitHub Pages

This repository is already configured with an automated GitHub Actions deployment workflow:
1. Go to your repository on GitHub: `Settings` → `Pages`.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Push your code to the `main` branch.
4. GitHub Actions will build and deploy RepoPulse automatically to `https://<username>.github.io/repo-pulse/`!

---

## 🛠️ Architecture & Tech Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS with GitHub Primer color variables.
- **Icons**: Lucide React matching Primer Octicons.
- **API**: GitHub REST API v3 (2022-11-28).
- **Backend / Sync**: Firebase Firestore (optional multi-device state sync) with graceful fallback to browser storage.
- **CI/CD**: GitHub Actions (`deploy-pages`).

---

## 🔒 Security & Privacy

- **Client-Side First**: Your GitHub Personal Access Token is stored directly in your browser's encrypted local storage by default.
- No third-party proxy servers intercept your GitHub tokens or alerts. All API calls are executed directly from your browser to `api.github.com`.
