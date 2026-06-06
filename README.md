# Focus Sync - P2P Video Call & Shared Focus Timer

A peer-to-peer video call application combined with a synchronized Pomodoro/deep work timer, entirely hosted on GitHub Pages with no backend server required.

## 🎯 Features

### Core Features
- **P2P Video Calling**: Direct peer-to-peer video and audio calls via WebRTC
- **Room Creation & Sharing**: Generate shareable room links for easy connection
- **Synchronized Focus Timer**: 25-minute Pomodoro timer synchronized across peers via WebRTC Data Channels
- **Media Controls**: Mute/unmute audio, toggle camera on/off, share your screen
- **Persistent Task Checklist**: Add focus goals that persist across sessions using localStorage
- **Real-time Sync**: Instant timer state sync when one user starts, pauses, or resets
- **Responsive Design**: Dark mode minimalist UI optimized for productivity

### Technical Highlights
- **Zero Backend**: Pure client-side JavaScript running on GitHub Pages
- **Serverless Signaling**: Uses PeerJS's free public signaling server
- **WebRTC Data Channels**: For low-latency timer synchronization
- **Modern ES Modules**: Clean, modular code architecture
- **Vite Build Tool**: Fast development and optimized production builds

## 📋 Architecture

### High-Level Flow

```
┌─────────────────────────────────────────────┐
│         Focus Sync App (GitHub Pages)       │
└─────────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
   ┌────▼────┐ ┌────▼────┐ ┌────▼────┐
   │ PeerJS  │ │ WebRTC  │ │LocalStor│
   │Signaling│ │ Data    │ │  age    │
   │Server   │ │Channels │ │         │
   └────┬────┘ └────┬────┘ └────┬────┘
        │           │           │
   ┌────▼───────────▼────────────▼────┐
   │      Peer A              Peer B  │
   │  (Local User)        (Remote User)│
   │  - Video Stream      - Video Stream
   │  - Audio Stream      - Audio Stream
   │  - Timer State       - Timer State
   └──────────────────────────────────┘
```

### Module Structure

```
src/
├── index.html              # Main HTML entry point
├── styles/
│   ├── main.css           # Base styles & variables
│   ├── video.css          # Video section styles
│   ├── timer.css          # Timer section styles
│   └── checklist.css      # Task list styles
└── js/
    ├── main.js            # Application entry point
    └── modules/
        ├── peerConnection.js    # WebRTC & PeerJS manager
        ├── mediaManager.js      # Media streams manager
        ├── focusTimer.js        # Pomodoro timer with sync
        ├── taskList.js          # Task management with localStorage
        └── ui.js                # UI state management
```

### Data Flow

#### Timer Synchronization
```
User A presses START
       ↓
focusTimer.start()
       ↓
broadcastTimerState('start') via Data Channel
       ↓
User B receives message
       ↓
handleRemoteTimerUpdate() - starts timer on User B's side
       ↓
Both timers tick in sync
```

#### Connection Establishment
```
User A: Create Room → Displays Room ID
       ↓
User A: Listens for incoming connections
       ↓
User B: Enter Room ID → Sends connection request
       ↓
User A: Receives media call → Establishes peer connection
       ↓
Both: Media streams exchanged + Data channel opened
       ↓
Connection established + UI switches to call screen
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ (for build only)
- GitHub account with a repository
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Local Development

1. **Clone/Create Repository**
   ```bash
   git clone https://github.com/your-username/focus-sync.git](https://github.com/CloudSnapManage/Focus-Call.git
   cd focus-sync
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   Opens at `http://localhost:5173`

4. **Build for Production**
   ```bash
   npm run build
   ```
   Creates optimized `dist/` folder

### GitHub Pages Deployment

#### Method 1: Manual Deployment (Recommended for First Deploy)

1. **Build the project**
   ```bash
   npm run build
   ```

2. **Create `gh-pages` branch**
   ```bash
   git checkout --orphan gh-pages
   git rm -rf .
   ```

3. **Copy dist contents to root**
   ```bash
   cp -r dist/* .
   git add .
   git commit -m "Deploy to GitHub Pages"
   git push origin gh-pages
   ```

4. **Return to main branch**
   ```bash
   git checkout main
   ```

#### Method 2: Automated Deployment (Using npm script)

Update `vite.config.js` if your repo is not at the root level:

```javascript
// If your repo is at github.com/username/repo
base: '/repo/',  // Change this path
```

Then deploy:
```bash
npm run deploy
```

#### Enable GitHub Pages in Repository Settings

1. Go to repository Settings
2. Navigate to "Pages"
3. Select `gh-pages` branch as source
4. Save

Your app will be live at: `https://username.github.io/Focus-Call.git`

## 💡 Usage Guide

### Creating a Session
1. Click **"Generate Room ID"** on welcome screen
2. Copy the generated link or Room ID
3. Share with your focus partner
4. Once they join, video and audio connect automatically

### Joining a Session
1. Click **"Join Room"** on welcome screen
2. Paste the Room ID or full share link
3. Click **"Join Room"**
4. Grant camera/microphone permissions
5. Connection established!

### Using the Timer
- **Start**: Begin 25-minute focus session (synchronized with partner)
- **Pause**: Pause the timer (synchronized with partner)
- **Reset**: Reset to initial time
- **Customize**: Set focus and break durations before session starts

### Task Checklist
- Add focus goals in the checklist section
- Check off completed tasks
- Tasks automatically persist in browser storage
- New sessions preserve your goals

### Media Controls
- **Mute/Unmute**: Toggle microphone on/off
- **Camera**: Toggle camera on/off
- **Screen Share**: Share your screen (press again to stop)
- **Hang Up**: End the session and return to welcome screen

## 🔧 Configuration

### Environment Variables
The app works entirely with CDN-hosted dependencies. No configuration required!

### PeerJS Configuration
To use your own PeerJS server (optional):

Edit `src/js/modules/peerConnection.js`:
```javascript
this.peer = new Peer({
  host: 'your-peerjs-server.com',
  port: 9000,
  path: '/peerjs',
});
```

See: [PeerServer Documentation](https://github.com/peers/peerjs-server)

### Customizing Timer Durations
Default: 25-minute focus, 5-minute break

Users can customize in the UI, or set defaults in `src/js/modules/focusTimer.js`:
```javascript
this.focusDuration = 25 * 60;  // Change to desired minutes * 60
this.breakDuration = 5 * 60;   // Change to desired minutes * 60
```

## 🎨 UI Customization

### Color Scheme
Edit CSS variables in `src/styles/main.css`:

```css
:root {
  --bg-primary: #0f172a;      /* Main background */
  --accent-primary: #3b82f6;  /* Button/accent color */
  --accent-success: #10b981;  /* Success indicator */
  /* ... more variables ... */
}
```

### Responsive Breakpoints
The UI is fully responsive:
- **Desktop**: 3-column layout (video, timer, checklist)
- **Tablet (≤1200px)**: 2-column layout
- **Mobile (≤768px)**: Stacked layout

## 🔐 Security & Privacy

### Important Notes

1. **Peer-to-Peer Connection**: Your video and audio stream directly peer-to-peer, NOT through our servers. We never store or access your media.

2. **Room IDs**: Generated client-side. Not stored anywhere. Only the people with the room ID can connect.

3. **WebRTC Signaling**: Uses PeerJS's public signaling server only for initial connection establishment. After connection, all communication is direct P2P.

4. **Data Persistence**: Tasks stored in localStorage (client-side only). Never sent to servers.

5. **HTTPS Only**: GitHub Pages enforces HTTPS, ensuring all communication is encrypted in transit.

### Privacy Considerations
- Disable camera/audio when not in use
- Be aware screen sharing shows your entire screen
- Close browser tab to end session
- Clear localStorage if needed: Developer Tools > Storage > Local Storage > Delete

## 🐛 Troubleshooting

### Connection Issues

**"Failed to initialize peer connection"**
- Clear browser cache and reload
- Check internet connection
- Try a different browser
- Peer.js CDN might be down - check status

**"Failed to access camera/microphone"**
- Grant permissions in browser settings
- Check if another app is using the camera
- Use HTTPS (required by browser API)

**"Timer not syncing"**
- Ensure data channel is open (check console)
- Reconnect peers
- Check for network connectivity issues

### Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome  | 88+     | ✅ Full support |
| Firefox | 85+     | ✅ Full support |
| Safari  | 14.1+   | ✅ Full support |
| Edge    | 88+     | ✅ Full support |

### Console Debugging

Open Developer Tools (F12) to see:
- Peer ID and connection status
- WebRTC ICE candidates
- Data channel messages
- Timer sync logs

## 📦 Building for Production

### Optimizations Included
- ✅ Code splitting via Vite
- ✅ CSS minification
- ✅ JavaScript minification
- ✅ Asset optimization
- ✅ Source maps for debugging

### Build Output
```
dist/
├── index.html     (~5KB)
├── js/
│   └── main.js    (~15KB gzipped)
└── styles/
    ├── main.css
    ├── video.css
    ├── timer.css
    └── checklist.css
```

Total size: ~30KB gzipped (lightning fast!)

## 🚀 Deployment Tips

### For Better Performance

1. **Enable GZIP compression** (GitHub Pages does this automatically)

2. **Use a CDN** (optional):
   - Cloudflare (free tier available)
   - GitHub Pages already uses Fastly CDN

3. **Monitor with DevTools**:
   - Network tab to check load times
   - Performance tab for runtime analysis

### Custom Domain

1. In repository settings under "Pages", add your custom domain
2. Create CNAME file with domain name
3. Update DNS records pointing to GitHub Pages

## 📚 API Reference

### PeerConnectionManager

```javascript
// Initialize peer
await peerManager.initializePeer();

// Generate room ID
const roomId = peerManager.generateRoomId();

// Connect to remote peer
await peerManager.connectToPeer(remotePeerId, localStream);

// Setup to receive connections
peerManager.setupIncomingConnections(localStream);

// Check connection status
peerManager.isConnected();

// Disconnect
peerManager.disconnect();

// Callbacks
peerManager.on('connectionEstablished', callback);
peerManager.on('remoteStream', callback);
peerManager.on('dataChannelOpen', callback);
peerManager.on('error', callback);
```

### FocusTimer

```javascript
// Start timer
focusTimer.start();

// Pause timer
focusTimer.pause();

// Reset timer
focusTimer.reset();

// Set durations
focusTimer.setFocusDuration(25);  // minutes
focusTimer.setBreakDuration(5);   // minutes

// Get state
focusTimer.getState();

// Callbacks
focusTimer.on('tick', callback);
focusTimer.on('complete', callback);
focusTimer.on('stateChange', callback);
```

### TaskList

```javascript
// Add task
taskList.addTask('Complete project');

// Toggle completion
taskList.toggleTask(taskId);

// Delete task
taskList.deleteTask(taskId);

// Get all tasks
taskList.getAllTasks();

// Get stats
taskList.getStats();

// Clear all
taskList.clearAllTasks();

// Export/Import
taskList.exportTasks();
taskList.importTasks(jsonData);
```

### MediaManager

```javascript
// Initialize media
await mediaManager.initializeLocalMedia();

// Toggle audio
mediaManager.toggleAudio();

// Toggle video
mediaManager.toggleVideo();

// Screen sharing
await mediaManager.startScreenShare();
mediaManager.stopScreenShare();

// Get state
mediaManager.isAudioActive();
mediaManager.isVideoActive();
mediaManager.isScreenSharingActive();

// Cleanup
mediaManager.stopLocalMedia();
```

## 🤝 Contributing

We welcome contributions! Areas for improvement:

- [ ] Custom PeerJS server setup guide
- [ ] Multi-peer support (>2 participants)
- [ ] Recording capability
- [ ] Chat functionality
- [ ] Dark/Light theme toggle
- [ ] Mobile app wrapper
- [ ] Email notifications
- [ ] Audio/video quality settings

## 📄 License

MIT License - See LICENSE file for details

## 🙏 Acknowledgments

- [PeerJS](https://peerjs.com/) - Simple peer-to-peer with WebRTC
- [Vite](https://vitejs.dev/) - Next generation frontend tooling
- [WebRTC](https://webrtc.org/) - Real-time communication APIs

## 📞 Support

For issues or questions:

1. Check the [Troubleshooting](#troubleshooting) section
2. Search existing GitHub issues
3. Create a new issue with details:
   - Browser & OS
   - Steps to reproduce
   - Console errors
   - Expected vs actual behavior

## 🎯 Roadmap

- [ ] Improved notification system
- [ ] Persistent session history
- [ ] Integration with calendar APIs
- [ ] Analytics dashboard
- [ ] Mobile app versions
- [ ] Browser extension

---

**Happy focusing! 🎯**
