/**
 * UI Manager
 * Handles all UI state, interactions, and screen management
 */

export class UIManager {
  constructor() {
    this.currentScreen = 'welcome';
    this.elements = this.cacheElements();
  }

  /**
   * Cache DOM elements for performance
   */
  cacheElements() {
    return {
      // Screens
      welcomeScreen: document.getElementById('welcomeScreen'),
      callScreen: document.getElementById('callScreen'),

      // Welcome screen
      createRoomBtn: document.getElementById('createRoomBtn'),
      joinRoomBtn: document.getElementById('joinRoomBtn'),
      roomIdInput: document.getElementById('roomIdInput'),
      createdRoomInfo: document.getElementById('createdRoomInfo'),
      roomIdDisplay: document.getElementById('roomIdDisplay'),
      copyRoomBtn: document.getElementById('copyRoomBtn'),
      connectionError: document.getElementById('connectionError'),
      connectionStatus: document.getElementById('connectionStatus'),
      callRoomInfo: document.getElementById('callRoomInfo'),
      callRoomIdDisplay: document.getElementById('callRoomIdDisplay'),

      // Video controls
      toggleAudioBtn: document.getElementById('toggleAudioBtn'),
      toggleVideoBtn: document.getElementById('toggleVideoBtn'),
      toggleScreenBtn: document.getElementById('toggleScreenBtn'),
      fullscreenBtn: document.getElementById('fullscreenBtn'),
      hangupBtn: document.getElementById('hangupBtn'),

      // Timer controls
      startTimerBtn: document.getElementById('startTimerBtn'),
      pauseTimerBtn: document.getElementById('pauseTimerBtn'),
      resetTimerBtn: document.getElementById('resetTimerBtn'),
      focusTimeInput: document.getElementById('focusTimeInput'),
      breakTimeInput: document.getElementById('breakTimeInput'),

      // Task list
      taskInput: document.getElementById('taskInput'),
      addTaskBtn: document.getElementById('addTaskBtn'),
      shareGoalsToggle: document.getElementById('shareGoalsToggle'),
      taskList: document.getElementById('taskList'),
      tasksProgress: document.getElementById('tasksProgress'),
      partnerTaskList: document.getElementById('partnerTaskList'),
      partnerGoalsStatus: document.getElementById('partnerGoalsStatus'),

      // Sync indicator
      syncStatus: document.getElementById('syncStatus'),
      syncText: document.getElementById('syncText'),

      // Disconnect notice
      disconnectNotice: document.getElementById('disconnectNotice'),
      returnToWelcomeBtn: document.getElementById('returnToWelcomeBtn'),
    };
  }

  /**
   * Show welcome screen
   */
  showWelcomeScreen() {
    this.currentScreen = 'welcome';
    this.elements.welcomeScreen.classList.add('active');
    this.elements.callScreen.classList.remove('active');
    this.clearErrors();
  }

  /**
   * Show call screen
   */
  showCallScreen() {
    this.currentScreen = 'call';
    this.elements.welcomeScreen.classList.remove('active');
    this.elements.callScreen.classList.add('active');
  }

  /**
   * Display error message
   */
  showError(message) {
    this.elements.connectionError.textContent = message;
    this.elements.connectionError.classList.remove('hidden');
  }

  /**
   * Clear error messages
   */
  clearErrors() {
    this.elements.connectionError.classList.add('hidden');
    this.elements.connectionError.textContent = '';
  }

  /**
   * Display status message
   */
  showStatus(message) {
    this.elements.connectionStatus.textContent = message;
  }

  /**
   * Clear status message
   */
  clearStatus() {
    this.elements.connectionStatus.textContent = '';
  }

  /**
   * Display created room info
   */
  displayCreatedRoom(roomId, shareLink) {
    this.elements.roomIdDisplay.textContent = shareLink || roomId;
    this.elements.createdRoomInfo.classList.remove('hidden');
  }

  /**
   * Hide created room info
   */
  hideCreatedRoom() {
    this.elements.createdRoomInfo.classList.add('hidden');
  }

  /**
   * Show current room ID on the call screen
   */
  showCallRoomInfo(roomId) {
    if (!this.elements.callRoomInfo || !this.elements.callRoomIdDisplay) return;
    this.elements.callRoomIdDisplay.textContent = roomId || 'N/A';
    this.elements.callRoomInfo.classList.remove('hidden');
  }

  /**
   * Hide current room ID on the call screen
   */
  hideCallRoomInfo() {
    if (!this.elements.callRoomInfo) return;
    this.elements.callRoomInfo.classList.add('hidden');
  }

  /**
   * Update sync status indicator
   */
  setSyncStatus(connected) {
    if (connected) {
      this.elements.syncStatus.classList.remove('disconnected');
      this.elements.syncText.textContent = 'Synced';
    } else {
      this.elements.syncStatus.classList.add('disconnected');
      this.elements.syncText.textContent = 'Disconnected';
    }
  }

  /**
   * Show disconnect notice
   */
  showDisconnectNotice() {
    this.elements.disconnectNotice.classList.remove('hidden');
  }

  /**
   * Hide disconnect notice
   */
  hidePartnerGoals() {
    if (this.elements.partnerTaskList) {
      this.elements.partnerTaskList.innerHTML = '<li class="partner-placeholder">Partner has not shared goals yet.</li>';
    }
    if (this.elements.partnerGoalsStatus) {
      this.elements.partnerGoalsStatus.textContent = 'Not shared';
    }
  }

  /**
   * Render partner goals list
   */
  renderPartnerGoals(tasks, shared) {
    if (!this.elements.partnerTaskList) return;

    this.elements.partnerTaskList.innerHTML = '';

    if (!shared) {
      this.elements.partnerTaskList.innerHTML = '<li class="partner-placeholder">Partner has not shared goals yet.</li>';
      this.updatePartnerGoalsStatus(false);
      return;
    }

    if (!tasks || tasks.length === 0) {
      this.elements.partnerTaskList.innerHTML = '<li class="partner-placeholder">Partner is sharing goals, but none are set yet.</li>';
      this.updatePartnerGoalsStatus(true);
      return;
    }

    tasks.forEach(task => {
      const li = document.createElement('li');
      li.className = `task-item ${task.completed ? 'completed' : ''}`;
      li.textContent = task.text;
      this.elements.partnerTaskList.appendChild(li);
    });

    this.updatePartnerGoalsStatus(true);
  }

  /**
   * Update partner goals status text
   */
  updatePartnerGoalsStatus(shared) {
    if (!this.elements.partnerGoalsStatus) return;
    this.elements.partnerGoalsStatus.textContent = shared ? 'Shared' : 'Not shared';
  }

  /**
   * Update share goals toggle state
   */
  updateShareGoalsToggle(isEnabled) {
    if (this.elements.shareGoalsToggle) {
      this.elements.shareGoalsToggle.checked = isEnabled;
    }
  }

  /**
   * Hide disconnect notice
   */
  hideDisconnectNotice() {
    this.elements.disconnectNotice.classList.add('hidden');
  }

  /**
   * Update audio button state
   */
  updateAudioButton(isEnabled) {
    this.elements.toggleAudioBtn.classList.toggle('active', isEnabled);
  }

  /**
   * Update video button state
   */
  updateVideoButton(isEnabled) {
    this.elements.toggleVideoBtn.classList.toggle('active', isEnabled);
  }

  /**
   * Update screen share button state
   */
  updateScreenButton(isSharing) {
    this.elements.toggleScreenBtn.classList.toggle('active', isSharing);
  }

  /**
   * Render task list
   */
  renderTaskList(tasks) {
    const taskList = this.elements.taskList;
    taskList.innerHTML = '';

    if (tasks.length === 0) {
      taskList.classList.add('empty');
      return;
    }

    taskList.classList.remove('empty');

    tasks.forEach(task => {
      const li = document.createElement('li');
      li.className = `task-item ${task.completed ? 'completed' : ''}`;
      li.dataset.taskId = task.id;

      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.className = 'task-checkbox';
      checkbox.checked = task.completed;
      checkbox.addEventListener('change', () => {
        this.elements.taskInput.dispatchEvent(new CustomEvent('taskToggled', { detail: { taskId: task.id } }));
      });

      const text = document.createElement('span');
      text.className = 'task-text';
      text.textContent = task.text;

      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'task-delete';
      deleteBtn.textContent = '✕';
      deleteBtn.addEventListener('click', () => {
        this.elements.taskInput.dispatchEvent(new CustomEvent('taskDeleted', { detail: { taskId: task.id } }));
      });

      li.appendChild(checkbox);
      li.appendChild(text);
      li.appendChild(deleteBtn);
      taskList.appendChild(li);
    });
  }

  /**
   * Update task progress
   */
  updateTaskProgress(completed, total) {
    this.elements.tasksProgress.textContent = `${completed} of ${total} completed`;
  }

  /**
   * Clear task input
   */
  clearTaskInput() {
    this.elements.taskInput.value = '';
  }

  /**
   * Get room ID from input
   */
  getRoomIdInput() {
    const input = this.elements.roomIdInput.value.trim();

    // Extract room ID from share link if pasted
    if (input.includes('#')) {
      return input.split('#')[1];
    }
    return input;
  }

  /**
   * Copy to clipboard
   */
  async copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      return false;
    }
  }

  /**
   * Show temporary notification
   */
  showNotification(message, duration = 3000) {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background-color: var(--accent-success);
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      box-shadow: var(--shadow-lg);
      z-index: 2000;
      animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => {
        notification.remove();
      }, 300);
    }, duration);
  }

  /**
   * Reset all inputs
   */
  resetWelcomeInputs() {
    this.elements.roomIdInput.value = '';
    this.hideCreatedRoom();
    this.clearErrors();
    this.clearStatus();
  }

  /**
   * Get UI element by ID
   */
  getElement(id) {
    return document.getElementById(id);
  }

  /**
   * Add event listener
   */
  addEventListener(elementId, event, callback) {
    const element = this.getElement(elementId);
    if (element) {
      element.addEventListener(event, callback);
    }
  }
}

export default UIManager;
