# Focus Sync - Technical Architecture

## Overview

Focus Sync is a sophisticated peer-to-peer video calling application with a synchronized Pomodoro timer, entirely hosted on static GitHub Pages. This document details the architecture, design decisions, and implementation specifics.

## Design Principles

### 1. **Zero Backend Requirement**
- No server-side code needed
- No database required
- Fully client-side JavaScript execution
- GitHub Pages as static host

### 2. **P2P Communication**
- All media streams transmitted directly peer-to-peer
- Not routed through centralized servers
- Uses WebRTC for low-latency, encrypted connections
- PeerJS library abstracts WebRTC complexity

### 3. **Real-Time Synchronization**
- WebRTC Data Channels for low-latency message passing
- Eventual consistency model for timer state
- Last-write-wins conflict resolution

### 4. **Privacy-First**
- No tracking or analytics
- No user data stored on servers
- Peer IDs generated locally and client-side
- All data encrypted in transit (WebRTC + HTTPS)

### 5. **Modular Architecture**
- Separation of concerns via ES modules
- Each module handles single responsibility
- Event-driven communication between modules
- Easy to test and maintain

## System Architecture

### High-Level Component Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Focus Sync UI                        │
│  (HTML + CSS + DOM manipulation via UIManager)         │
└────────┬────────────────────────────────────────────────┘
         │
    ┌────┼────┬──────────────┬────────────┬────────────┐
    │    │    │              │            │            │
    ▼    ▼    ▼              ▼            ▼            ▼
┌──────┐ ┌────────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐
│ Peer │ │   Media   │ │  Focus  │ │   Task  │ │ Storage│
│Conn. │ │  Manager  │ │  Timer  │ │  List   │ │(Local) │
│      │ │           │ │         │ │         │ │        │
└──────┘ └────────────┘ └──────────┘ └──────────┘ └────────┘
   │           │            │            │           │
   │    ┌──────┼────────────┴────────────┼───────────┘
   │    │      │                        │
   │    └──────┼────────────────────────┤
   │           │ Sync via Data Channel  │
   │ WebRTC    │ (JSON messages)        │
   │ Media +   │                        │
   │ Data      │                        │
   │ Channels  │                        │
   │           │                        │
   └───────────┤────────────────────────┘
              │
        ┌─────▼──────┐
        │ Remote Peer│
        │  Instance  │
        └────────────┘
```

## Module Deep Dive

### 1. **PeerConnectionManager** (`peerConnection.js`)

**Responsibilities:**
- Initialize PeerJS peer instance
- Manage connections to remote peers
- Handle both media and data connections
- Provide high-level API for peer operations

**Key Methods:**

```javascript
// Initialization
async initializePeer()           // Establishes peer with unique ID
generateRoomId()                 // Creates shareable room identifier
getPeerId()                      // Returns current peer ID

// Connections
async connectToPeer(id, stream) // Initiates connection to remote peer
setupIncomingConnections()      // Listens for incoming calls
setupDataChannel()              // Creates data channel for sync

// Communication
sendData(message)               // Sends data over data channel
isConnected()                   // Checks connection status
disconnect()                    // Cleanly closes connections
```

**Event Flow:**

```
initializePeer()
      ↓
  Connects to PeerJS signaling server
      ↓
   Receives unique Peer ID
      ↓
  Ready to accept/initiate connections
```

**Data Channel Message Format:**

```javascript
{
  type: 'timer',           // Message type
  action: 'start',         // 'start', 'pause', 'reset'
  remainingSeconds: 1234,  // Current timer value
  isBreakTime: false,      // Timer mode
  timestamp: 1234567890    // For diagnostics
}
```

### 2. **MediaManager** (`mediaManager.js`)

**Responsibilities:**
- Request and manage user's camera/microphone
- Handle local media stream
- Set remote peer's media stream
- Control audio/video tracks
- Manage screen sharing

**Key Methods:**

```javascript
// Media initialization
async initializeLocalMedia()      // Requests camera/mic, sets constraints
setRemoteStream(stream)           // Sets remote video element source

// Track control
toggleAudio()                     // Mute/unmute microphone
toggleVideo()                     // Enable/disable camera
async startScreenShare()          // Initiates screen sharing
stopScreenShare()                 // Stops screen share, returns to camera

// Status
isAudioActive()                   // Returns audio state
isVideoActive()                   // Returns video state
isScreenSharingActive()           // Returns screen sharing state
```

**Media Constraints:**

```javascript
// Audio constraints for clarity
audio: {
  echoCancellation: true,   // Remove echo
  noiseSuppression: true,   // Reduce background noise
  autoGainControl: true     // Auto volume adjustment
}

// Video constraints for optimal quality
video: {
  width: { ideal: 1280 },   // HD quality
  height: { ideal: 720 },
  facingMode: 'user'        // Front camera
}
```

**Media Track Replacement (for screen share):**

```
toggleScreen() called
      ↓
  User selects screen in OS dialog
      ↓
  screenStream obtained
      ↓
  peerConnection.getSenders() finds video sender
      ↓
  sender.replaceTrack(screenTrack) - smooth transition
      ↓
  Remote peer receives new video track automatically
```

### 3. **FocusTimer** (`focusTimer.js`)

**Responsibilities:**
- Manage Pomodoro timer state machine
- Synchronize timer across peers
- Persist user's time preferences
- Trigger notifications on completion
- Handle timer UI updates

**State Machine:**

```
         ┌──────────┐
         │  IDLE    │
         └─────┬────┘
               │ start()
         ┌─────▼────────┐
         │ RUNNING:     │
         │ FOCUS TIME   │◄──┐ (no automatic restart)
         └─────┬────────┘   │
               │ pause()    │ complete()
         ┌─────▼────────┐ ──┘
         │ PAUSED       │
         └─────┬────────┘
               │ start()
               │
         ┌─────▼────────────┐
         │ RUNNING:         │
         │ BREAK TIME       │
         └─────┬────────────┘
               │ complete()
               │
         Switches to FOCUS TIME (new cycle)
```

**Timer Synchronization Protocol:**

```
User A: start()
      ↓
  remainingSeconds = 1500 (25 min)
  isBreakTime = false
  broadcast: { action: 'start', remainingSeconds: 1500, ... }
      ↓
User B receives message
      ↓
  Sync state: remainingSeconds = 1500, isBreakTime = false
  start()
      ↓
Both timers decrement together, staying in sync
```

**Conflict Resolution:**

When both users take action simultaneously, the last received message wins (timestamp-based):

```javascript
if (incomingMessage.timestamp > lastReceivedTimestamp) {
  // Accept newer state
  remainingSeconds = incomingMessage.remainingSeconds;
}
```

### 4. **TaskList** (`taskList.js`)

**Responsibilities:**
- CRUD operations on tasks
- Persist tasks to localStorage
- Calculate completion statistics
- Import/export task data

**localStorage Schema:**

```javascript
// Key: 'focusSync_tasks'
// Value: JSON array
[
  {
    id: 1717591234567,           // Unique timestamp-based ID
    text: "Complete project",     // Task description
    completed: false,             // Completion status
    createdAt: "2024-06-05T..."  // ISO timestamp
  },
  // ... more tasks
]
```

**Persistence Lifecycle:**

```
Task action (add/toggle/delete)
      ↓
  Modify tasks array in memory
      ↓
  Call saveTasks()
      ↓
  JSON.stringify(tasks)
      ↓
  localStorage.setItem('focusSync_tasks', json)
      ↓
  Persisted to browser storage (per origin)
```

**Storage Limits:**

- Per browser: ~5-10MB per origin
- Tasks JSON: ~100 bytes per task
- Supports ~50,000-100,000 tasks before limit
- Sufficient for years of daily use

### 5. **UIManager** (`ui.js`)

**Responsibilities:**
- Cache DOM element references
- Handle screen transitions
- Update UI based on state
- Manage event listeners
- Provide user feedback (errors, notifications)

**Screen State Machine:**

```
┌────────────────┐
│   Welcome      │ ← Initial screen
│   - Create room│
│   - Join room  │
└────────┬───────┘
         │ create/join succeeds
         │
┌────────▼──────────┐
│      Call         │ ← Active session
│ - Video feeds    │
│ - Timer          │
│ - Checklist      │
└────────┬──────────┘
         │ hangup/disconnect
         │
    Return to Welcome
```

**Element Caching (Performance Optimization):**

```javascript
// Initialized once at startup
const elements = {
  welcomeScreen: document.getElementById('welcomeScreen'),
  // ... all other elements cached
};

// Use cached references (no DOM queries during runtime)
elements.welcomeScreen.classList.add('active');
```

This avoids expensive DOM queries in event handlers.

### 6. **Main Application** (`main.js`)

**Responsibilities:**
- Orchestrate all modules
- Connect module events
- Handle application-level flows
- Manage lifecycle

**Initialization Flow:**

```
Window load event
      ↓
initializeApp()
      ↓
Create module instances
      ↓
await peerManager.initializePeer()
      ↓
Setup event listeners
      ↓
Setup peer callbacks
      ↓
App ready (welcome screen shown)
```

**Connection Flow (Join):**

```
User enters room ID and clicks "Join"
      ↓
handleJoinRoom()
      ↓
Extract remote peer ID from input
      ↓
await mediaManager.initializeLocalMedia()
      ↓
Request camera/mic from browser (user grants permission)
      ↓
await peerManager.connectToPeer(remotePeerId, localStream)
      ↓
Send media call to remote peer
      ↓
Establish data channel
      ↓
uiManager.showCallScreen()
      ↓
On data channel open: focusTimer.setDataChannel(channel)
      ↓
App ready for video + synchronized timer
```

## Data Flow Diagrams

### Timer Synchronization Flow

```
Scenario: User A starts timer

User A UI: Clicks "Start" button
      ↓
focusTimer.start()
      ↓
Set isRunning = true
Set interval for each second: remainingSeconds--
      ↓
focusTimer.broadcastTimerState('start')
      ↓
Create message: {
  type: 'timer',
  action: 'start',
  remainingSeconds: 1500,
  isBreakTime: false,
  timestamp: ...
}
      ↓
peerManager.sendData(JSON.stringify(message))
      ↓
WebRTC Data Channel
      ↓
User B's peerManager receives data
      ↓
focusTimer.handleRemoteTimerUpdate(message)
      ↓
Check action = 'start'
Sync remainingSeconds and isBreakTime
Call focusTimer.start()
      ↓
User B's timer now running in sync with User A
```

### Local-Remote Media Stream Setup

```
User A (Caller):
  initializeLocalMedia()
    ↓
  getUserMedia() → localStream (A's camera)
    ↓
  connectToPeer(B_id, localStream)
    ↓
  peer.call(B_id, localStream)
    ↓
                    ┌─────────────────────┐
                    │ PeerJS Signaling    │
                    │ Server (establishes │
                    │ WebRTC connection)  │
                    └─────────────────────┘
                    
User B (Callee):
  peer listens for 'call' event
    ↓
  Receives media call from A
    ↓
  mediaConnection.answer(localStream)
    ↓
  getUserMedia() → localStream (B's camera)
    ↓
  Send B's stream to A
    ↓
  WebRTC ICE connection establishes
    ↓
Both sides exchange video/audio streams directly
    ↓
  mediaConnection.on('stream', (remoteStream) => {
    mediaManager.setRemoteStream(remoteStream)
    remoteVideo.srcObject = remoteStream
  })
```

## Performance Considerations

### Bundle Size

| Component | Size (gzipped) |
|-----------|----------------|
| main.js | ~15 KB |
| styles/*.css | ~10 KB |
| HTML | ~5 KB |
| PeerJS CDN | ~25 KB |
| **Total** | **~55 KB** |

### Optimization Strategies

1. **Code Splitting**: Vite automatically chunks imports
2. **CSS Minification**: Production builds optimize styles
3. **JavaScript Minification**: Terser plugin enabled
4. **Asset Compression**: GitHub Pages uses gzip
5. **DOM Caching**: Elements cached to avoid selector queries

### Memory Usage

- Each active media stream: ~5-20 MB (depends on resolution)
- Timer: < 1 KB
- Task list (100 tasks): < 50 KB
- Total: Typical ~30-50 MB for active call

### Latency

- Peer discovery: ~500ms (first connection)
- Media connection: ~1-2 seconds
- Data channel: < 50ms round trip (depends on network)
- Timer sync jitter: < 100ms (acceptable for UI)

## Security Architecture

### Transport Security

```
GitHub Pages (HTTPS)
      ↓
  All assets encrypted
      ↓
PeerJS Signaling (HTTPS)
      ↓
  Initial peer discovery encrypted
      ↓
WebRTC DTLS-SRTP
      ↓
  Media & data streams encrypted
      ↓
  Peer-to-peer (bypasses servers)
```

### Data Isolation

- **Room IDs**: Generated client-side, never stored server-side
- **Peer IDs**: Generated by PeerJS cloud, not linked to user identity
- **Media**: Only transmitted directly between connected peers
- **Tasks**: Only stored in user's browser localStorage
- **Session**: Destroyed when tab closed

### Privacy Model

| Data | Location | Encrypted | Visible to Others |
|------|----------|-----------|------------------|
| Camera/audio | Local device + P2P | Yes (DTLS-SRTP) | Only connected peer |
| Room ID | Browser URL/memory | Yes (HTTPS) | Only shared link recipients |
| Tasks | localStorage | Browser protection | Only this browser |
| Peer ID | PeerJS server | Yes (HTTPS) | Only signaling phase |

## Extensibility Points

### Adding New Modules

1. Create new module in `src/js/modules/newModule.js`
2. Export class with standard lifecycle:
```javascript
export class NewModule {
  constructor() { }
  init() { }
  on(event, callback) { }
  destroy() { }
}
```
3. Import and initialize in `main.js`
4. Wire up callbacks to other modules

### Adding New Message Types

In `focusTimer.js` `handleRemoteTimerUpdate()`:
```javascript
switch (message.type) {
  case 'timer':
    // Handle timer...
    break;
  case 'newType':
    // Handle new message type
    break;
}
```

### Custom Signaling Server

Replace PeerJS cloud server with self-hosted PeerServer:

```javascript
// In peerConnection.js
this.peer = new Peer({
  host: 'your-server.com',
  port: 9000,
  path: '/peerjs',
});
```

See: https://github.com/peers/peerjs-server

## Limitations & Tradeoffs

### Current Limitations

1. **1-on-1 only**: Current WebRTC setup supports 2 peers (easily extensible)
2. **No persistence**: Room data lost on refresh (can add Firebase)
3. **No recording**: Doesn't record video sessions
4. **Basic notifications**: No email/SMS alerts
5. **No analytics**: No usage metrics

### Design Tradeoffs

| Requirement | Chosen | Alternative | Why |
|---|---|---|---|
| Signaling | PeerJS Cloud | Self-hosted | Simpler, zero infrastructure |
| Storage | localStorage | Firebase | Works offline, simpler |
| Timer Sync | Data Channels | Server-based | Lower latency, P2P ethos |
| UI Framework | Vanilla JS | React/Vue | Smaller bundle, simpler build |
| Build Tool | Vite | Webpack | Faster dev, better defaults |

## Testing Strategy

### Manual Testing Checklist

- [ ] Create room and share link
- [ ] Join room from different device/browser
- [ ] Video/audio streams appear on both sides
- [ ] Mute/unmute audio works on both sides
- [ ] Camera toggle works
- [ ] Screen share initiates and switches back
- [ ] Timer starts and displays on both screens
- [ ] Pause button pauses both timers
- [ ] Reset works for both
- [ ] Switch between focus/break
- [ ] Add/complete/delete tasks
- [ ] Tasks persist on page refresh
- [ ] Disconnect gracefully handled
- [ ] Return to welcome and restart session

### Automated Testing (Future)

```javascript
// Example test structure
describe('FocusTimer', () => {
  it('should sync start action across peers', async () => {
    const timer1 = new FocusTimer();
    const timer2 = new FocusTimer();
    
    // Simulate data channel connection
    timer1.setDataChannel(mockDataChannel);
    timer2.on('stateChange', onStateChange);
    
    timer1.start();
    
    // Verify timer2 received start message
    assert(timer2.isRunning === true);
  });
});
```

## Monitoring & Debugging

### Browser DevTools

```javascript
// In console, access global objects:
console.log(peerManager.getPeerId());     // Current peer ID
console.log(focusTimer.getState());       // Timer state
console.log(taskList.getAllTasks());      // All tasks
console.log(mediaManager.getLocalStream());// Media status
```

### Debug Logging

All modules log to console. In production, set:

```javascript
// In main.js
if (process.env.NODE_ENV !== 'production') {
  console.log('Debug info:', ...);
}
```

### Common Issues & Root Causes

| Symptom | Root Cause | Solution |
|---------|-----------|----------|
| No video | Camera not granted | Check browser permissions |
| Timer not syncing | Data channel closed | Check network/reconnect |
| High latency | Poor internet | ICE candidates being negotiated |
| Audio echo | Echo cancellation off | Enable in constraints |
| Tasks lost | localStorage cleared | Use export before clearing |

## Future Enhancements

### Phase 1 (Roadmap)
- [ ] Multi-peer support (3+ participants)
- [ ] Chat functionality
- [ ] Screen annotation tools
- [ ] Custom timer presets

### Phase 2
- [ ] Session recording
- [ ] Cloud backup (Firebase)
- [ ] Mobile native app
- [ ] Browser extension

### Phase 3
- [ ] Calendar integration
- [ ] Analytics dashboard
- [ ] Team workspaces
- [ ] API for third-party integrations

---

## References

- [WebRTC Specification](https://w3c.github.io/webrtc-pc/)
- [PeerJS Documentation](https://peerjs.com/)
- [Vite Documentation](https://vitejs.dev/)
- [MDN Web APIs](https://developer.mozilla.org/en-US/docs/Web/API)

**Document Version**: 1.0  
**Last Updated**: June 2024  
**Status**: Production Ready
