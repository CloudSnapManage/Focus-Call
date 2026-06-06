# Quick Start Guide

Get Focus Sync running locally in 5 minutes!

## 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/focus-sync.git
cd focus-sync
```

Or if you just have the folder:

```bash
cd /path/to/focus-sync-repo
```

## 2. Install Dependencies (1 minute)

```bash
npm install
```

This installs:
- `vite` (~5MB) - Build tool
- `peerjs` (~2MB) - P2P library

## 3. Start Development Server (30 seconds)

```bash
npm run dev
```

Opens automatically at `http://localhost:5173`

## 4. Test Locally

### Single Device Test

1. Open http://localhost:5173 in your browser
2. Click **"Generate Room ID"**
3. Open the app in another tab
4. Click **"Join Room"** and paste the room ID
5. Grant permissions for camera/microphone when prompted
6. Video should appear on both tabs!

### Multiple Device Test

1. On Device A: Click "Generate Room ID" and copy the link
2. On Device B: Go to the shared link or paste the room ID
3. Both devices should connect via P2P

### Test Features

- **Timer**: Click Start, Pause, Reset - should sync between instances
- **Tasks**: Add a task on one tab, refresh another tab - it persists!
- **Mute/Camera**: Toggle buttons should work
- **Disconnect**: Close connection and return to welcome screen

## 5. Build for Production (1 minute)

```bash
npm run build
```

Creates optimized `dist/` folder (~30KB gzipped)

## 6. Deploy to GitHub Pages (2 minutes)

```bash
npm run deploy
```

Or manually:

```bash
git add -A
git commit -m "Deploy to GitHub Pages"
git push origin main
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## 🎯 Quick Reference

| Task | Command |
|------|---------|
| Start dev server | `npm run dev` |
| Build for prod | `npm run build` |
| Deploy to GitHub Pages | `npm run deploy` |
| Preview build | `npm run preview` |
| View docs | See files below |

## 📚 Documentation Files

- **[README.md](./README.md)** - Full features and guide
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - GitHub Pages deployment detailed
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Technical deep dive

## ❓ Common Tasks

### Change Base Path for Custom Repo Name

Edit `vite.config.js`:

```javascript
// Change this:
base: '/',

// To this (if repo is not username.github.io):
base: '/focus-sync/',
```

### Customize Timer Durations

In browser, use the settings inputs in the timer section, or edit defaults in `src/js/modules/focusTimer.js`:

```javascript
this.focusDuration = 25 * 60;  // minutes
this.breakDuration = 5 * 60;   // minutes
```

### Change Color Scheme

Edit `src/styles/main.css` CSS variables:

```css
:root {
  --accent-primary: #3b82f6;    /* Change this color */
  --bg-primary: #0f172a;        /* And others */
  /* ... */
}
```

### Clear All Tasks

Open browser DevTools (F12) and run:

```javascript
localStorage.removeItem('focusSync_tasks');
location.reload();
```

## 🆘 Troubleshooting

### "Cannot find module 'peerjs'"

```bash
npm install
```

### "localhost:5173 refused to connect"

```bash
# Kill any process on port 5173
npm run dev  # Try again
```

### Camera/Mic Permission Denied

1. Go to browser settings
2. Find Focus Sync in Notifications/Camera/Microphone
3. Allow permissions
4. Refresh page

### App looks different in production

Check `vite.config.js` base path matches your GitHub Pages URL.

## 🚀 Next Steps

1. ✅ Get it running locally (`npm run dev`)
2. ✅ Test with multiple tabs/devices
3. ✅ Deploy to GitHub Pages (`npm run deploy`)
4. ✅ Share link with a focus partner!
5. 📖 Read [ARCHITECTURE.md](./ARCHITECTURE.md) to understand the code
6. 🔧 Customize colors/durations to your preference

## 💡 Tips

- Use Focus Sync for real work! Test with actual focus sessions
- Pair with someone to truly experience the timer sync
- Try screen sharing for collaborative work
- Set ambitious goals in the task checklist

## 📝 Tips for Development

### Add New Feature

1. Create new module in `src/js/modules/` if needed
2. Import in `src/js/main.js`
3. Add styles to `src/styles/` if needed
4. Test with `npm run dev`

### Debug in Browser

Open DevTools (F12) and check:

```javascript
// Access modules in console:
console.log(peerManager.getPeerId());
console.log(focusTimer.getState());
console.log(taskList.getAllTasks());
```

### Hot Reload

Vite automatically reloads changes. Edit files and save:

```bash
src/
├── index.html    # ← edit and save
├── styles/       # ← edit and save
└── js/           # ← edit and save
```

Changes appear instantly in browser!

## 🎉 You're Ready!

Your Focus Sync instance is ready to go. Happy focusing!

For more details, see [README.md](./README.md)
