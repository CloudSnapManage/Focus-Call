/**
 * Focus Sync - Main Application Entry Point
 * P2P Video Call + Shared Focus Session Timer
 */

import PeerConnectionManager from './modules/peerConnection.js';
import MediaManager from './modules/mediaManager.js';
import FocusTimer from './modules/focusTimer.js';
import TaskList from './modules/taskList.js';
import UIManager from './modules/ui.js';

// Global application state
let peerManager;
let mediaManager;
let focusTimer;
let taskList;
let uiManager;
let currentRoomId = '';
let shareGoalsEnabled = false;
let remoteTasks = [];
let remoteGoalsShared = false;

/**
 * Initialize application
 */
async function initializeApp() {
  console.log('Initializing Focus Sync App...');

  // Initialize managers
  peerManager = new PeerConnectionManager();
  mediaManager = new MediaManager();
  focusTimer = new FocusTimer();
  taskList = new TaskList();
  uiManager = new UIManager();

  try {
    // Initialize peer connection
    await peerManager.initializePeer();
    console.log('Peer initialized with ID:', peerManager.getPeerId());

    // Setup event listeners
    setupEventListeners();

    // Setup peer callbacks
    setupPeerCallbacks();

    // Setup UI callbacks
    setupUICallbacks();

    // Initialize task list display
    uiManager.updateShareGoalsToggle(shareGoalsEnabled);
    uiManager.renderPartnerGoals([], false);
    renderTaskList();

    console.log('App initialized successfully');
  } catch (error) {
    console.error('Failed to initialize app:', error);
    uiManager.showError('Failed to initialize app. Please refresh the page.');
  }
}

/**
 * Setup all event listeners
 */
function setupEventListeners() {
  // Welcome screen events
  uiManager.elements.createRoomBtn.addEventListener('click', handleCreateRoom);
  uiManager.elements.joinRoomBtn.addEventListener('click', handleJoinRoom);
  uiManager.elements.copyRoomBtn.addEventListener('click', handleCopyRoom);
  uiManager.elements.roomIdInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleJoinRoom();
  });

  // Video control events
  uiManager.elements.toggleAudioBtn.addEventListener('click', handleToggleAudio);
  uiManager.elements.toggleVideoBtn.addEventListener('click', handleToggleVideo);
  uiManager.elements.toggleScreenBtn.addEventListener('click', handleToggleScreen);
  uiManager.elements.hangupBtn.addEventListener('click', handleHangup);

  // Timer events
  uiManager.elements.startTimerBtn.addEventListener('click', () => focusTimer.start());
  uiManager.elements.pauseTimerBtn.addEventListener('click', () => focusTimer.pause());
  uiManager.elements.resetTimerBtn.addEventListener('click', () => focusTimer.reset());
  uiManager.elements.focusTimeInput.addEventListener('change', (e) => {
    focusTimer.setFocusDuration(parseInt(e.target.value) || 25);
  });
  uiManager.elements.breakTimeInput.addEventListener('change', (e) => {
    focusTimer.setBreakDuration(parseInt(e.target.value) || 5);
  });

  // Task list events
  uiManager.elements.addTaskBtn.addEventListener('click', handleAddTask);
  uiManager.elements.taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleAddTask();
  });
  uiManager.elements.taskInput.addEventListener('taskToggled', handleTaskToggled);
  uiManager.elements.taskInput.addEventListener('taskDeleted', handleTaskDeleted);
  uiManager.elements.shareGoalsToggle.addEventListener('change', handleShareGoalsToggle);

  // Fullscreen video
  uiManager.elements.fullscreenBtn.addEventListener('click', handleToggleFullscreen);

  // Mobile tab navigation
  setupMobileTabs();

  // Disconnect notice
  uiManager.elements.returnToWelcomeBtn.addEventListener('click', handleReturnToWelcome);

  console.log('Event listeners setup complete');
}

function setupMobileTabs() {
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabSections = document.querySelectorAll('[data-tab-content]');

  if (!tabButtons.length || !tabSections.length) {
    return;
  }

  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const selectedTab = button.dataset.tab;

      tabButtons.forEach((btn) => {
        btn.classList.toggle('active', btn === button);
      });

      tabSections.forEach((section) => {
        section.classList.toggle('active', section.dataset.tabContent === selectedTab);
      });
    });
  });
}

/**
 * Setup peer connection callbacks
 */
function setupPeerCallbacks() {
  peerManager.on('connectionEstablished', () => {
    console.log('Connection established');
    uiManager.setSyncStatus(true);
    uiManager.showStatus('Connected to focus partner!');
    setTimeout(() => uiManager.clearStatus(), 3000);
  });

  peerManager.on('connectionClosed', () => {
    console.log('Connection closed');
    uiManager.setSyncStatus(false);
    focusTimer.pause();
    uiManager.showDisconnectNotice();
  });

  peerManager.on('remoteStream', (stream) => {
    console.log('Remote stream received');
    mediaManager.setRemoteStream(stream);
  });

  peerManager.on('dataChannelOpen', (dataChannel) => {
    console.log('Data channel opened');
    focusTimer.setDataChannel(dataChannel);
    if (shareGoalsEnabled) {
      sendTaskUpdate();
    }
  });

  peerManager.on('dataReceived', (message) => {
    console.log('Data received:', message);
    try {
      const parsed = typeof message === 'string' ? JSON.parse(message) : message;
      if (parsed.type === 'tasks') {
        handleRemoteTaskUpdate(parsed);
      } else {
        focusTimer.handleRemoteTimerUpdate(parsed);
      }
    } catch (error) {
      console.warn('Failed to parse remote data message:', error, message);
    }
  });

  peerManager.on('error', (error) => {
    console.error('Peer error:', error);
    uiManager.showError(`Connection error: ${error.message}`);
  });
}

/**
 * Setup UI callbacks
 */
function setupUICallbacks() {
  focusTimer.on('tick', () => {
    // Timer ticked (already updated display)
  });

  focusTimer.on('complete', () => {
    uiManager.showNotification(
      focusTimer.isBreakTime ? 'Break time over! Ready to focus?' : 'Great work! Time for a break!',
      5000
    );
  });

  focusTimer.on('stateChange', () => {
    // State changed (already updated display)
  });
}

/**
 * Handle create room
 */
async function handleCreateRoom() {
  try {
    const roomId = peerManager.generateRoomId();
    const currentUrl = window.location.href.split('#')[0];
    const shareLink = `${currentUrl}#${roomId}`;

    uiManager.displayCreatedRoom(roomId, shareLink);
    currentRoomId = roomId;
    uiManager.showStatus('Room created. Waiting for peer to join...');

    // Setup to receive incoming connections
    await mediaManager.initializeLocalMedia();
    peerManager.setupIncomingConnections(mediaManager.getLocalStream());

    uiManager.showCallScreen();
    uiManager.showCallRoomInfo(currentRoomId);
  } catch (error) {
    console.error('Error creating room:', error);
    uiManager.showError(error.message);
  }
}

/**
 * Handle join room
 */
async function handleJoinRoom() {
  try {
    const remotePeerId = uiManager.getRoomIdInput();

    if (!remotePeerId) {
      uiManager.showError('Please enter a valid Room ID or paste the share link');
      return;
    }

    uiManager.showStatus('Connecting to peer...');
    uiManager.clearErrors();

    // Initialize local media
    await mediaManager.initializeLocalMedia();

    // Connect to remote peer
    await peerManager.connectToPeer(remotePeerId, mediaManager.getLocalStream());
    currentRoomId = remotePeerId;

    uiManager.showCallScreen();
    uiManager.showCallRoomInfo(currentRoomId);
  } catch (error) {
    console.error('Error joining room:', error);
    uiManager.showError(`Failed to join room: ${error.message}`);
  }
}

/**
 * Handle copy room link
 */
async function handleCopyRoom() {
  const roomIdDisplay = uiManager.elements.roomIdDisplay.textContent;
  const copied = await uiManager.copyToClipboard(roomIdDisplay);

  if (copied) {
    uiManager.showNotification('Room link copied to clipboard!');
  } else {
    uiManager.showError('Failed to copy to clipboard');
  }
}

/**
 * Handle toggle audio
 */
function handleToggleAudio() {
  const isEnabled = mediaManager.toggleAudio();
  uiManager.updateAudioButton(isEnabled);
  uiManager.showNotification(isEnabled ? 'Microphone on' : 'Microphone off', 2000);
}

/**
 * Handle toggle video
 */
function handleToggleVideo() {
  const isEnabled = mediaManager.toggleVideo();
  uiManager.updateVideoButton(isEnabled);
  uiManager.showNotification(isEnabled ? 'Camera on' : 'Camera off', 2000);
}

/**
 * Handle toggle screen share
 */
async function handleToggleScreen() {
  try {
    if (mediaManager.isScreenSharingActive()) {
      mediaManager.stopScreenShare();
      // Switch back to camera
      await mediaManager.initializeLocalMedia();
      if (peerManager.remoteConnection) {
        // Restart call with camera stream
        peerManager.remoteConnection.peerConnection.getSenders().forEach((sender) => {
          if (sender.track.kind === 'video') {
            const videoTrack = mediaManager.getLocalStream().getVideoTracks()[0];
            sender.replaceTrack(videoTrack);
          }
        });
      }
      uiManager.updateScreenButton(false);
    } else {
      const screenStream = await mediaManager.startScreenShare();
      if (screenStream) {
        if (peerManager.remoteConnection) {
          // Replace video track with screen stream
          peerManager.remoteConnection.peerConnection.getSenders().forEach((sender) => {
            if (sender.track.kind === 'video') {
              const screenTrack = screenStream.getVideoTracks()[0];
              sender.replaceTrack(screenTrack);
            }
          });
        }
        uiManager.updateScreenButton(true);
      }
    }
  } catch (error) {
    console.error('Error toggling screen share:', error);
    uiManager.showError('Failed to share screen');
  }
}

/**
 * Handle hangup
 */
function handleHangup() {
  if (confirm('Are you sure you want to end the call?')) {
    // Stop media
    mediaManager.stopLocalMedia();

    // Disconnect peer
    peerManager.disconnect();

    // Reset timer
    focusTimer.reset();
    focusTimer.destroy();

    // Return to welcome screen
    uiManager.showWelcomeScreen();
    uiManager.resetWelcomeInputs();
    uiManager.hideDisconnectNotice();
    uiManager.hideCallRoomInfo();

    // Reinitialize timer for next session
    focusTimer = new FocusTimer();

    uiManager.showStatus('Ended call. Create a new room to start again.');
    setTimeout(() => uiManager.clearStatus(), 3000);
  }
}

/**
 * Handle return to welcome from disconnect
 */
function handleReturnToWelcome() {
  // Same as hangup but without confirmation
  mediaManager.stopLocalMedia();
  peerManager.disconnect();
  focusTimer.reset();
  focusTimer.destroy();

  uiManager.showWelcomeScreen();
  uiManager.resetWelcomeInputs();
  uiManager.hideDisconnectNotice();
  uiManager.hideCallRoomInfo();

  focusTimer = new FocusTimer();
}

/**
 * Handle add task
 */
function handleAddTask() {
  const taskText = uiManager.elements.taskInput.value.trim();

  if (!taskText) {
    return;
  }

  taskList.addTask(taskText);
  uiManager.clearTaskInput();
  renderTaskList();
  sendTaskUpdate();
}

/**
 * Handle task toggled
 */
function handleTaskToggled(event) {
  const { taskId } = event.detail;
  taskList.toggleTask(taskId);
  renderTaskList();
  sendTaskUpdate();
}

/**
 * Handle task deleted
 */
function handleTaskDeleted(event) {
  const { taskId } = event.detail;
  taskList.deleteTask(taskId);
  renderTaskList();
  sendTaskUpdate();
}

/**
 * Render task list
 */
function renderTaskList() {
  const tasks = taskList.getAllTasks();
  const stats = taskList.getStats();

  uiManager.renderTaskList(tasks);
  uiManager.updateTaskProgress(stats.completed, stats.total);
  uiManager.renderPartnerGoals(remoteTasks, remoteGoalsShared);
}

function handleShareGoalsToggle(event) {
  shareGoalsEnabled = event.target.checked;
  sendTaskUpdate();
}

function handleToggleFullscreen() {
  const remoteVideoContainer = document.getElementById('remoteVideoContainer');
  if (!remoteVideoContainer) return;

  if (!document.fullscreenElement) {
    remoteVideoContainer.requestFullscreen?.().catch((error) => {
      console.warn('Fullscreen request failed:', error);
    });
  } else {
    document.exitFullscreen?.().catch((error) => {
      console.warn('Exit fullscreen failed:', error);
    });
  }
}

function sendTaskUpdate() {
  if (!peerManager || !peerManager.isConnected()) return;

  const payload = {
    type: 'tasks',
    shareEnabled: shareGoalsEnabled,
    tasks: shareGoalsEnabled ? taskList.getAllTasks() : [],
    timestamp: Date.now(),
  };

  peerManager.sendData(JSON.stringify(payload));
}

function handleRemoteTaskUpdate(message) {
  if (typeof message.shareEnabled !== 'boolean') return;

  remoteGoalsShared = message.shareEnabled;
  remoteTasks = Array.isArray(message.tasks) ? message.tasks : [];
  uiManager.renderPartnerGoals(remoteTasks, remoteGoalsShared);
}

/**
 * Handle hash changes (share link navigation)
 */
window.addEventListener('hashchange', () => {
  const roomId = window.location.hash.slice(1);
  if (roomId && uiManager.currentScreen === 'welcome') {
    uiManager.elements.roomIdInput.value = roomId;
    uiManager.showStatus('Room ID detected from link');
  }
});

/**
 * Handle page unload - cleanup
 */
window.addEventListener('beforeunload', () => {
  mediaManager.stopLocalMedia();
  peerManager.disconnect();
  focusTimer.destroy();
});

/**
 * Handle visibility change - pause timer when tab hidden
 */
document.addEventListener('visibilitychange', () => {
  if (document.hidden && focusTimer.isRunning) {
    focusTimer.pause();
    uiManager.showNotification('Timer paused (tab inactive)', 3000);
  }
});

/**
 * Start application on load
 */
window.addEventListener('load', () => {
  initializeApp();

  // Check for room ID in hash
  const roomId = window.location.hash.slice(1);
  if (roomId) {
    uiManager.elements.roomIdInput.value = roomId;
  }
});

console.log('Focus Sync Application Ready');
