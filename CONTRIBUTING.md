# Contributing to RepoPulse ⚡

First off, thank you for taking the time to contribute! Contributions are what make the open source community such an amazing place to learn, inspire, and create.

All kinds of contributions are welcome: bug fixes, feature requests, documentation improvements, UI polish, and performance optimizations.

---

## 🧭 Code of Conduct

This project and everyone participating in it is governed by the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

---

## 🛠️ Local Development Setup

### Prerequisites
- **Node.js**: v18.0.0 or later (v20+ recommended)
- **npm**: v9.0.0 or later

### Getting Started
1. **Fork** the repository on GitHub: [https://github.com/cp099/repo-pulse/fork](https://github.com/cp099/repo-pulse/fork)
2. **Clone** your fork locally:
   ```bash
   git clone https://github.com/<your-username>/repo-pulse.git
   cd repo-pulse
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Configure environment (Optional)**:
   ```bash
   cp .env.example .env.local
   ```
   *(Optional: You can run the dashboard in mock/demo mode without any credentials, or sign in via GitHub OAuth).*
5. **Start the development server**:
   ```bash
   npm run dev
   ```
6. Open `http://localhost:5173` in your browser.

---

## 🌿 Branching Strategy & Workflow

1. Create a feature branch off `main`:
   ```bash
   git checkout -b feat/my-awesome-feature
   # or
   git checkout -b fix/issue-description
   ```
2. Commit your changes following [Conventional Commits](https://www.conventionalcommits.org/):
   - `feat:` for new features (e.g. `feat(alerts): add filter by CWE tag`)
   - `fix:` for bug fixes (e.g. `fix(nav): correct mobile tap target size`)
   - `docs:` for documentation updates
   - `style:` for formatting changes
   - `refactor:` for code restructuring without behavioral changes
   - `perf:` for performance improvements
3. Ensure the project builds cleanly with zero TypeScript errors:
   ```bash
   npm run build
   ```
4. Push your branch and open a Pull Request against `main`.

---

## 🎨 Design & Coding Guidelines

- **Component Architecture**: Keep components modular, accessible, and self-contained in `src/components/`.
- **Styling**: Use Tailwind CSS with the established GitHub Primer color palette (`gh-canvas-*`, `gh-border-*`, `gh-fg-*`, `gh-accent-*`).
- **Icons**: Use [Lucide Icons](https://lucide.dev/) matching GitHub's Octicon conventions.
- **Accessibility**:
  - All interactive buttons must have visible focus rings (`focus-visible:ring-2`).
  - Icon-only buttons must include descriptive `aria-label` attributes.
  - Text must satisfy WCAG AA contrast standards (minimum 4.5:1 against dark backgrounds).
- **Zero Secrets**: Never commit API keys, GitHub tokens, or credentials into version control.

---

## 📬 Need Help?

- Check existing [GitHub Issues](https://github.com/cp099/repo-pulse/issues).
- Start a discussion in [GitHub Discussions](https://github.com/cp099/repo-pulse/discussions).
