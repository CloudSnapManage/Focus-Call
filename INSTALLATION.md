# Installation & Setup Guide

Complete step-by-step guide to set up Focus Sync for development and deployment.

## System Requirements

### Minimum Requirements
- **Node.js**: 16.0.0 or higher
- **npm**: 7.0.0 or higher (comes with Node.js)
- **Git**: 2.0 or higher
- **Browser**: Any modern browser with WebRTC support
  - Chrome/Edge 88+
  - Firefox 85+
  - Safari 14.1+

### Recommended Setup
- **Node.js**: 18 LTS or 20+
- **OS**: macOS, Linux, or Windows
- **Terminal**: bash, zsh, or PowerShell 7+

## Installation Steps

### Step 1: Verify Prerequisites

#### Check Node.js

```bash
node --version
# Should output: v18.0.0 or higher

npm --version
# Should output: 9.0.0 or higher
```

If not installed, download from https://nodejs.org/

#### Check Git

```bash
git --version
# Should output: git version 2.x.x or higher
```

If not installed, download from https://git-scm.com/

### Step 2: Clone Repository

#### Option A: Clone from GitHub

```bash
git clone https://github.com/YOUR_USERNAME/focus-sync.git
cd focus-sync
```

Replace `YOUR_USERNAME` with your GitHub username.

#### Option B: Create from Scratch

```bash
# Create new directory
mkdir focus-sync
cd focus-sync

# Initialize git
git init

# Create package.json with this content:
# (See ../package.json for full content)

# Create basic structure
mkdir -p src/js/modules src/styles .github/workflows
```

### Step 3: Install Dependencies

```bash
npm install
```

This installs:
- **vite** (5.x) - Build tool and dev server
- **peerjs** (1.5.4) - WebRTC abstraction library

**Output should look like:**
```
added 89 packages, and audited 90 packages in 3s

found 0 vulnerabilities
```

### Step 4: Verify Installation

```bash
npm run dev --version
# Should show Vite version

npm list peerjs
# Should show peerjs 1.5.4
```

## Project Structure Setup

Verify your project has this structure:

```
focus-sync/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── src/
│   ├── index.html
│   ├── js/
│   │   ├── main.js
│   │   └── modules/
│   │       ├── peerConnection.js
│   │       ├── mediaManager.js
│   │       ├── focusTimer.js
│   │       ├── taskList.js
│   │       └── ui.js
│   └── styles/
│       ├── main.css
│       ├── video.css
│       ├── timer.css
│       └── checklist.css
├── .gitignore
├── package.json
├── vite.config.js
├── README.md
├── QUICKSTART.md
├── DEPLOYMENT.md
└── ARCHITECTURE.md
```

If any files are missing, copy them from the project.

## Development Environment Setup

### IDE Configuration

#### VS Code (Recommended)

1. **Install Extensions**:
   - ESLint
   - Prettier
   - Live Server (optional)

2. **Create `.vscode/settings.json`**:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "files.exclude": {
    "node_modules": true,
    ".git": true
  }
}
```

3. **Create `.vscode/extensions.json`**:
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode"
  ]
}
```

#### Other IDEs

- **WebStorm**: Built-in support, no config needed
- **Sublime Text**: Install Prettier and ESLint plugins
- **Vim/Neovim**: Install coc-eslint or similar

### Environment Variables (if needed in future)

Create `.env.local` in project root:

```
VITE_API_URL=http://localhost:3000
VITE_ENVIRONMENT=development
```

Access in code via: `import.meta.env.VITE_API_URL`

## Local Development Workflow

### Start Development Server

```bash
npm run dev
```

**Output**:
```
  VITE v5.0.0  ready in 123 ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

- Automatically opens in browser
- Hot reload on file changes
- Source maps for debugging

### Make Changes

Edit any file in `src/`:

```bash
# Example: Change timer duration
src/js/modules/focusTimer.js
# Change: this.focusDuration = 25 * 60;
# To:     this.focusDuration = 30 * 60;
# Save: Ctrl+S (Cmd+S on Mac)
# Browser reloads automatically
```

### Debug in Browser

Open DevTools (F12) and use:

```javascript
// Console tab
console.log(peerManager.getPeerId());
console.log(focusTimer.getState());

// Sources tab: Set breakpoints in src/ files
// Application tab: Check localStorage
```

### Stop Development Server

```bash
# Press Ctrl+C in terminal
^C
```

## Build for Production

### Build Process

```bash
npm run build
```

**Process**:
1. Bundles all modules
2. Minifies JavaScript
3. Optimizes CSS
4. Compresses assets
5. Creates `dist/` folder

**Output example**:
```
✓ 15 modules transformed. (1234ms)
dist/index.html                    0.54 kB │ gzip:   0.35 kB
dist/js/main.js                   14.78 kB │ gzip:   4.82 kB
dist/styles/main.css              10.45 kB │ gzip:   2.13 kB
✓ built in 2.34s
```

### Preview Build Locally

```bash
npm run preview
```

Serves `dist/` folder locally to test production build.

## Git Setup

### Initial Commit

```bash
# Check status
git status

# Add all files
git add .

# Commit
git commit -m "Initial commit: Focus Sync application"

# Set main branch
git branch -M main

# Add remote (replace with your repo)
git remote add origin https://github.com/YOUR_USERNAME/focus-sync.git

# Push
git push -u origin main
```

### Regular Commits

```bash
# Check what changed
git status

# Stage changes
git add .
git add src/js/modules/focusTimer.js  # Or specific files

# Commit with message
git commit -m "Add: Feature description"

# Push
git push
```

### Branching for Development

```bash
# Create feature branch
git checkout -b feature/my-feature

# Make changes and commit
git add .
git commit -m "Add: My feature"

# Push branch
git push origin feature/my-feature

# Create Pull Request on GitHub
# After review, merge to main
```

## Deployment Setup

### Prerequisites for GitHub Pages

1. **GitHub Account**: Create at https://github.com/signup
2. **Repository**: Create at https://github.com/new
3. **Git Configured**: 
```bash
git config --global user.name "Your Name"
git config --global user.email "your@email.com"
```

### Deploy Manually

```bash
# Build project
npm run build

# Deploy using script
npm run deploy
```

Or step-by-step:

```bash
# 1. Build
npm run build

# 2. Create/checkout gh-pages branch
git checkout --orphan gh-pages

# 3. Clear staging
git rm -rf .

# 4. Copy dist files
cp -r dist/. .

# 5. Commit and push
git add .
git commit -m "Deploy to GitHub Pages"
git push origin gh-pages

# 6. Return to main
git checkout main
```

### Enable GitHub Pages

1. Go to repository Settings
2. Click "Pages" in sidebar
3. Select `gh-pages` branch
4. Click Save
5. Wait 1-2 minutes
6. Visit `https://YOUR_USERNAME.github.io/focus-sync`

## Troubleshooting Installation

### Issue: "command not found: npm"

**Solution**: Install Node.js from https://nodejs.org/

### Issue: "Permission denied" on npm install

**Solution**: 
```bash
# macOS/Linux
sudo npm install -g npm@latest

# Or use nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

### Issue: Port 5173 already in use

**Solution**: Kill the process or use different port:
```bash
npm run dev -- --port 5174
```

### Issue: "Cannot find module 'vite'"

**Solution**: Reinstall dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Issue: "git: not found"

**Solution**: Install Git from https://git-scm.com/

### Issue: Build fails with "Cannot find module"

**Solution**: Check imports match export names:
```javascript
// In importing file
import FocusTimer from './modules/focusTimer.js';  // ✓ correct

// In focusTimer.js
export default FocusTimer;  // ✓ correct

// Not: export { FocusTimer } without default
```

### Issue: CSS not updating in dev server

**Solution**: Clear browser cache:
```
Ctrl+Shift+R (Windows/Linux)
Cmd+Shift+R (Mac)
```

## Performance Optimization

### Monitor Build Size

```bash
# See bundle composition
npm run build -- --analyze  # if analyzer added
```

### Optimize Images (if added in future)

```bash
# Compress before adding
npx imagemin image.png --out-dir=src/assets
```

### Code Splitting

Vite automatically splits code. Import modules as needed:

```javascript
// Good: Dynamic import
const mediaManager = await import('./modules/mediaManager.js');

// Efficient: Lazy loading
const module = () => import('./modules/module.js');
```

## Continuous Integration Setup

### GitHub Actions (Auto Deploy)

The `.github/workflows/deploy.yml` file enables automatic deployment:

1. Push to `main` branch
2. GitHub Actions builds your code
3. Automatically deploys to GitHub Pages

No additional setup needed!

### Monitor Deployments

1. Go to repository
2. Click "Actions" tab
3. See deployment history and status

## Next Steps

1. ✅ Complete all installation steps above
2. Run development server: `npm run dev`
3. Test locally with multiple tabs/devices
4. Read [QUICKSTART.md](./QUICKSTART.md) for quick reference
5. Review [ARCHITECTURE.md](./ARCHITECTURE.md) to understand code
6. Deploy to GitHub Pages: `npm run deploy`
7. Share with friends and focus together!

## Support & Resources

- **Official Docs**: 
  - [Node.js](https://nodejs.org/en/docs/)
  - [Vite](https://vitejs.dev/)
  - [PeerJS](https://peerjs.com/)
  - [WebRTC](https://webrtc.org/)

- **Community**:
  - GitHub Issues in repository
  - Stack Overflow ([peerjs], [webrtc] tags)
  - MDN Web Docs

## File Reference

| File | Purpose | Edit |
|------|---------|------|
| `package.json` | Dependencies | Only for new deps |
| `vite.config.js` | Build config | Only base path |
| `src/index.html` | HTML structure | Rarely |
| `src/js/main.js` | App entry point | Add features here |
| `src/js/modules/*` | Feature modules | Edit for changes |
| `src/styles/*` | Styling | Change colors/layout |
| `.github/workflows/` | CI/CD | Don't edit |
| `.gitignore` | Git config | Don't edit |

---

**Installation Complete! 🎉**

Your development environment is ready. Start with `npm run dev`!
