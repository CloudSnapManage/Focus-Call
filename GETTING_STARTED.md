# Getting Started with Focus Sync

Welcome to Focus Sync! Follow these steps to get your app running.

## Step 1: Verify Prerequisites (1 minute)

Make sure you have Node.js installed:

```bash
node --version
npm --version
```

If not installed, download from: https://nodejs.org/ (LTS version recommended)

## Step 2: Install Dependencies (2 minutes)

From the project root directory, run:

```bash
npm install
```

This installs:
- Vite (build tool)
- PeerJS (WebRTC library)

You should see: `added XX packages`

## Step 3: Start Development Server (30 seconds)

```bash
npm run dev
```

This should automatically open your browser at: `http://localhost:5173`

## Step 4: Test Locally (5 minutes)

### Test 1: Create and Join Same Device

1. Click "Generate Room ID"
2. Copy the displayed link
3. Open the app in a new browser tab (paste same URL)
4. Click "Join Room"
5. Paste the room ID
6. Grant camera/microphone permissions
7. You should see video on both tabs!

### Test 2: Basic Features

- **Timer**: Click "Start" on one tab, watch it sync to the other
- **Tasks**: Add a task, check it off, refresh page - it persists!
- **Mute**: Click microphone button - should toggle
- **Camera**: Click camera button - should toggle
- **Screen Share**: Click screen share to share your screen

### Test 3: Multiple Devices (Recommended)

1. On Device A: `npm run dev` and click "Generate Room ID"
2. On Device B: Go to the same URL and paste the room ID
3. Grant permissions on both
4. Connect successfully!

## Step 5: Customize (Optional)

### Change Timer Duration

Edit `src/js/modules/focusTimer.js` (find this section):

```javascript
this.focusDuration = 25 * 60;  // Change to 30, 45, etc.
this.breakDuration = 5 * 60;   // Change to 10, 15, etc.
```

Changes automatically reload in browser!

### Change Color Scheme

Edit `src/styles/main.css` (find the :root section):

```css
:root {
  --accent-primary: #3b82f6;     /* Change this to your color */
  --bg-primary: #0f172a;         /* Background color */
  --accent-success: #10b981;     /* Success color */
  /* ... see file for others ... */
}
```

## Step 6: Build for Production (1 minute)

When ready to deploy:

```bash
npm run build
```

This creates an optimized `dist/` folder (~30KB gzipped)

## Step 7: Deploy to GitHub Pages (5 minutes)

### Prerequisites:
- GitHub account
- This code pushed to a GitHub repository

### Deploy with One Command:

```bash
npm run deploy
```

### Or Deploy Manually:

1. Push your code to GitHub
2. Go to repository Settings
3. Click "Pages" in sidebar
4. Select `gh-pages` branch
5. Save
6. Wait 1-2 minutes
7. Visit `https://YOUR_USERNAME.github.io/focus-sync`

## Step 8: Start Using! 🎉

1. Open your deployed app
2. Click "Generate Room ID"
3. Share the link with someone
4. Start a focus session together!

---

## Common Tasks

### Stop Development Server

Press `Ctrl+C` in terminal

### See Console Logs

Press F12 in browser, click "Console" tab

### Debug Connection

In browser console:
```javascript
console.log(peerManager.getPeerId());
console.log(peerManager.getStatus());
```

### Clear All Tasks

```javascript
localStorage.removeItem('focusSync_tasks');
location.reload();
```

### View Local Build

After `npm run build`:
```bash
npm run preview
```

---

## Troubleshooting

### "npm: command not found"
→ Install Node.js from https://nodejs.org/

### "Cannot find module 'peerjs'"
→ Run `npm install`

### App looks broken in browser
→ Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)

### Camera not working
→ Check browser permissions for this domain

### Timer not syncing
→ Check browser console for errors (F12)

### More issues?
→ See [README.md](./README.md) troubleshooting section

---

## Documentation

- **Want quick reference?** → [QUICKSTART.md](./QUICKSTART.md)
- **Need detailed setup?** → [INSTALLATION.md](./INSTALLATION.md)
- **Deploying to GitHub Pages?** → [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Want technical details?** → [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Full feature guide?** → [README.md](./README.md)

---

## File Structure

```
focus-sync/
├── src/
│   ├── index.html              ← Main page
│   ├── js/main.js              ← App entry
│   ├── js/modules/             ← Feature modules
│   └── styles/                 ← CSS files
├── package.json                ← Dependencies
├── vite.config.js              ← Build config
└── [documentation files]       ← Guides & references
```

---

## Next Steps

### For Users
1. ✅ Complete getting started above
2. Share with friends and focus together
3. Customize timer durations to your preference
4. Create focused sessions and track progress

### For Developers
1. ✅ Complete getting started above
2. Read [ARCHITECTURE.md](./ARCHITECTURE.md) to understand code
3. Review code in `src/js/modules/`
4. Modify and add features
5. Deploy your changes

---

## Quick Commands Reference

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build locally
npm run deploy     # Deploy to GitHub Pages
```

---

## Tips for Best Results

1. **Use HTTPS**: The app requires secure context (GitHub Pages auto-HTTPS)
2. **Grant Permissions**: Allow camera/microphone access when prompted
3. **Test on Real Device**: Use actual second device for proper P2P testing
4. **Share Link**: Use the generated room link for easy sharing
5. **Keep Tab Open**: Close app to end session

---

## Support

- Check documentation files (README, ARCHITECTURE, etc.)
- Look at browser console errors (F12)
- Verify Node.js and npm versions
- Try hard refresh of browser
- Check GitHub Pages deployment status

---

**Ready to focus? Start with `npm run dev`! 🎯**

---

## What's Next After Setup?

1. **Learn the Code**: Read [ARCHITECTURE.md](./ARCHITECTURE.md)
2. **Customize Look**: Edit CSS in `src/styles/`
3. **Change Behavior**: Edit JavaScript in `src/js/modules/`
4. **Deploy Changes**: Run `npm run build && npm run deploy`
5. **Share Features**: Tell friends about your app!

---

Happy focusing! 🚀
