# GitHub Pages Deployment Guide

This guide provides step-by-step instructions to deploy Focus Sync to GitHub Pages.

## Prerequisites

- Git installed on your machine
- GitHub account
- Node.js 16+ (for building only)

## Step 1: Set Up Your Repository

### Option A: Using an Existing Repository

```bash
# Navigate to your repo directory
cd /path/to/your/focus-sync-repo

# Initialize if needed
git init
git add .
git commit -m "Initial commit: Focus Sync"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/focus-sync.git
git push -u origin main
```

### Option B: Creating a New Repository

1. Go to [GitHub.com](https://github.com/new)
2. Create a new repository named `focus-sync`
3. Clone it locally:

```bash
git clone https://github.com/YOUR_USERNAME/focus-sync.git
cd focus-sync
```

## Step 2: Install Dependencies

```bash
npm install
```

This installs:
- `vite` - Build tool
- `peerjs` - P2P library

## Step 3: Configure for GitHub Pages

### Check Your Base Path

The `vite.config.js` file includes:

```javascript
base: '/',
```

**If your repository name is the base (not username)**, update to:

```javascript
base: '/focus-sync/',
```

### Find Your Deployment URL

- **User/Organization Pages**: `https://USERNAME.github.io`
  - Repository must be named `USERNAME.github.io`
  - Base should be `/`

- **Project Pages**: `https://USERNAME.github.io/focus-sync`
  - Repository can be named anything
  - Base should be `/focus-sync/`

## Step 4: Build the Project

```bash
npm run build
```

This creates a `dist/` folder with optimized production code.

## Step 5: Deploy to GitHub Pages

### Method 1: Using npm script (Recommended)

The `package.json` includes a convenient deploy script:

```bash
npm run deploy
```

This script:
1. Builds the project
2. Creates/updates the `gh-pages` branch
3. Pushes to GitHub

### Method 2: Manual Deployment

```bash
# Build
npm run build

# Create gh-pages branch if it doesn't exist
git checkout --orphan gh-pages

# Remove all files from staging
git rm -rf .

# Copy dist files to root
cp -r dist/. .
rm -rf dist

# Commit and push
git add .
git commit -m "Deploy to GitHub Pages"
git push -u origin gh-pages

# Return to main branch
git checkout main
```

### Method 3: Automatic Deployment with GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm install

      - name: Build
        run: npm run build

      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

This workflow automatically deploys when you push to `main`.

## Step 6: Enable GitHub Pages in Repository

1. Go to your repository on GitHub
2. Click **Settings**
3. Scroll to **Pages** section
4. Under "Source", select:
   - Branch: `gh-pages`
   - Folder: `/ (root)`
5. Click **Save**

GitHub will show: "Your site is published at `https://USERNAME.github.io/focus-sync`"

## Step 7: Verify Deployment

1. Wait 1-2 minutes for GitHub Pages to build and deploy
2. Visit your deployment URL in a browser
3. Test all features:
   - Create a room
   - Connect from another device
   - Test timer sync
   - Test task list persistence

## Troubleshooting Deployment

### Issue: "404 Not Found" error

**Solution**: Check your base path in `vite.config.js` matches your repo URL path.

```javascript
// If URL is https://mysite.github.io/focus-sync
base: '/focus-sync/',

// If URL is https://focus-sync.github.io (or https://myname.github.io)
base: '/',
```

### Issue: App loads but styling/scripts don't work

**Solution**: Check browser console for 404 errors on asset paths. This usually indicates incorrect base path.

### Issue: Deployment doesn't update

**Solutions**:
1. Hard refresh browser (Ctrl+F5 or Cmd+Shift+R)
2. Clear browser cache
3. Check that `gh-pages` branch was updated:
   ```bash
   git branch -a
   # should show: remotes/origin/gh-pages
   ```

### Issue: "Repository not found" when pushing

**Solution**: Check your GitHub token and remote URL:

```bash
git remote -v
# Should show your repository URL

# If wrong, update:
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/focus-sync.git
```

## Custom Domain (Optional)

To use a custom domain:

1. Add a `CNAME` file to your repository root with your domain:
   ```
   yourdomain.com
   ```

2. Update your DNS provider's records to point to:
   ```
   USERNAME.github.io
   ```

3. In GitHub repository Settings > Pages > Custom domain, enter your domain

4. Enable "Enforce HTTPS" (wait a few minutes for certificate)

## Continuous Updates

To keep your app updated:

```bash
# Make changes
git add .
git commit -m "Update: Add new features"
git push origin main

# If using GitHub Actions, deployment happens automatically
# If using npm run deploy:
npm run deploy
```

## Performance Tips

### Optimize Bundle Size

Current bundle is ~30KB gzipped. To reduce further:

1. **Remove unused modules** in `main.js`
2. **Tree-shake unused code** (Vite does this automatically)
3. **Use production build**:
   ```bash
   npm run build  # Creates optimized dist/
   ```

### Monitor Performance

Use Lighthouse in Chrome DevTools:

1. Open app in Chrome
2. Press F12 > Lighthouse tab
3. Click "Analyze page load"
4. View performance metrics

### Cache Busting

GitHub Pages caches assets. Force refresh with:

```bash
git push origin :gh-pages  # Delete remote branch
npm run deploy              # Redeploy fresh
```

## CDN Integration (Advanced)

For improved global performance, use Cloudflare (free tier):

1. Sign up at [Cloudflare](https://dash.cloudflare.com/)
2. Add your site
3. Update nameservers at your DNS provider
4. Enable "Always Use HTTPS" and caching

Cloudflare will automatically cache your `dist/` folder globally.

## Monitoring Deployments

### View Deployment History

```bash
# On GitHub: Settings > Pages > See deployment
# Or: Actions tab to see workflow runs
```

### Check Deployment Status

```bash
git log --oneline -10  # View recent commits
git branch -a          # View all branches
git show-ref           # View all references
```

## Rollback Previous Version

If deployment breaks:

```bash
# View deployment history
git log --oneline remotes/origin/gh-pages

# Revert to previous deploy
git push origin <commit-hash>:gh-pages

# Or reset completely
git push origin :gh-pages  # Delete branch
npm run deploy             # Redeploy current version
```

## Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [GitHub Pages Custom Domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [Vite Deploy Guide](https://vitejs.dev/guide/static-deploy.html#github-pages)

## Frequently Asked Questions

### Q: Why does my app look broken after deploying?

A: Usually a base path issue. Check `vite.config.js` and ensure it matches your URL path.

### Q: Can I use a custom domain?

A: Yes! See "Custom Domain" section above. GitHub Pages supports free HTTPS with custom domains.

### Q: How do I make deployments automatic?

A: Use GitHub Actions (see Method 3 above). After setup, deployments happen automatically on push to `main`.

### Q: What's included in the deployment?

A: Only files in the `dist/` folder. Source code (`src/`) is not deployed. Your repository remains private if set to private.

### Q: Can multiple people collaborate on development?

A: Yes! Use standard Git workflow:
```bash
git pull origin main      # Get latest changes
# Make your changes
git add .
git commit -m "Description"
git push origin main
```

---

**Congratulations! Your Focus Sync app is live on GitHub Pages! 🎉**

For questions, check the main README.md or open an issue on GitHub.
