/**
 * Focus Timer Manager
 * Handles Pomodoro timer with WebRTC Data Channel synchronization
 */

export class FocusTimer {
  constructor() {
    this.isRunning = false;
    this.isPaused = false;
    this.totalSeconds = 25 * 60; // 25 minutes default
    this.remainingSeconds = this.totalSeconds;
    this.focusDuration = 25 * 60;
    this.breakDuration = 5 * 60;
    this.isBreakTime = false;
    this.intervalId = null;
    this.dataChannel = null;
    this.callbacks = {
      onTick: null,
      onComplete: null,
      onStateChange: null,
    };

    this.updateDisplay();
  }

  /**
   * Set data channel for real-time sync
   */
  setDataChannel(dataChannel) {
    this.dataChannel = dataChannel;
  }

  /**
   * Start the timer
   */
  start(shouldBroadcast = true) {
    if (this.isRunning) return;

    this.isRunning = true;
    this.isPaused = false;
    if (shouldBroadcast) {
      this.broadcastTimerState('start');
    }

    this.intervalId = setInterval(() => {
      this.remainingSeconds--;

      if (this.remainingSeconds <= 0) {
        this.onTimerComplete();
      } else {
        this.updateDisplay();
        if (this.callbacks.onTick) {
          this.callbacks.onTick(this.remainingSeconds);
        }
      }
    }, 1000);

    this.updateDisplay();
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange({
        isRunning: this.isRunning,
        isPaused: this.isPaused,
        remainingSeconds: this.remainingSeconds,
      });
    }
  }

  /**
   * Pause the timer
   */
  pause(shouldBroadcast = true) {
    if (!this.isRunning) return;

    this.isRunning = false;
    this.isPaused = true;
    if (shouldBroadcast) {
      this.broadcastTimerState('pause');
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.updateDisplay();
    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange({
        isRunning: this.isRunning,
        isPaused: this.isPaused,
        remainingSeconds: this.remainingSeconds,
      });
    }
  }

  /**
   * Reset the timer
   */
  reset(shouldBroadcast = true) {
    this.isRunning = false;
    this.isPaused = false;
    if (shouldBroadcast) {
      this.broadcastTimerState('reset');
    }

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.remainingSeconds = this.isBreakTime ? this.breakDuration : this.focusDuration;
    this.updateDisplay();

    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange({
        isRunning: this.isRunning,
        isPaused: this.isPaused,
        remainingSeconds: this.remainingSeconds,
        isBreakTime: this.isBreakTime,
      });
    }
  }

  /**
   * Set focus duration
   */
  setFocusDuration(minutes) {
    this.focusDuration = minutes * 60;
    if (!this.isBreakTime && !this.isRunning) {
      this.remainingSeconds = this.focusDuration;
      this.updateDisplay();
    }
  }

  /**
   * Set break duration
   */
  setBreakDuration(minutes) {
    this.breakDuration = minutes * 60;
    if (this.isBreakTime && !this.isRunning) {
      this.remainingSeconds = this.breakDuration;
      this.updateDisplay();
    }
  }

  /**
   * Handle timer completion and switch to break/focus
   */
  onTimerComplete() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning = false;
    this.isPaused = false;

    // Play notification sound (optional - will use system beep)
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.connect(gain);
      gain.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = 'sine';

      gain.gain.setValueAtTime(0.3, audioContext.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (e) {
      console.warn('Audio notification failed:', e);
    }

    // Switch mode
    this.isBreakTime = !this.isBreakTime;
    this.remainingSeconds = this.isBreakTime
      ? this.breakDuration
      : this.focusDuration;

    this.updateDisplay();

    if (this.callbacks.onComplete) {
      this.callbacks.onComplete({
        isBreakTime: this.isBreakTime,
        remainingSeconds: this.remainingSeconds,
      });
    }

    if (this.callbacks.onStateChange) {
      this.callbacks.onStateChange({
        isRunning: this.isRunning,
        isPaused: this.isPaused,
        remainingSeconds: this.remainingSeconds,
        isBreakTime: this.isBreakTime,
      });
    }

    // Auto-start next session (optional)
    // this.start();
  }

// IDK if this will work or not but I want to try it out to see if it can be used to sync the timer across peers without needing to send start/pause/reset commands every time.
//sorry for the long ass message, I just wanted to explain my thought process behind this method. I want to try to send the entire timer state every time it changes so that if a peer joins in the middle of a session, they can sync up with the current timer state without needing to know the history of start/pause/reset commands that led to that state. This way, we can also handle edge cases like a peer pausing the timer and then another peer starting it again, which could lead to desync if we were only sending commands without the full state. By sending the full state, we can ensure that all peers are always in sync regardless of when they join or what actions they take.


  /**
   * Update UI display
   */
  updateDisplay() {
    const minutes = Math.floor(this.remainingSeconds / 60);
    const seconds = this.remainingSeconds % 60;

    const minutesEl = document.getElementById('timerMinutes');
    const secondsEl = document.getElementById('timerSeconds');
    const modeEl = document.getElementById('sessionMode');
    const timerDisplay = document.querySelector('.timer-display');

    if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
    if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');

    if (modeEl) {
      modeEl.textContent = this.isBreakTime ? 'Break Time' : 'Focus Time';
      modeEl.classList.toggle('break', this.isBreakTime);
      modeEl.classList.toggle('focus', !this.isBreakTime);
    }

    if (timerDisplay) {
      timerDisplay.classList.toggle('paused', this.isPaused);
    }

    // Update button states
    this.updateButtonStates();
  }

  /**
   * Update button states based on timer state
   */
  updateButtonStates() {
    const startBtn = document.getElementById('startTimerBtn');
    const pauseBtn = document.getElementById('pauseTimerBtn');
    const resetBtn = document.getElementById('resetTimerBtn');

    if (startBtn) {
      startBtn.classList.toggle('btn-active', !this.isRunning && !this.isPaused);
      startBtn.disabled = this.isRunning;
    }

    if (pauseBtn) {
      pauseBtn.classList.toggle('btn-active', this.isPaused);
      pauseBtn.disabled = !this.isRunning && !this.isPaused;
    }

    if (resetBtn) {
      resetBtn.disabled = !this.isRunning && !this.isPaused && this.remainingSeconds === (this.isBreakTime ? this.breakDuration : this.focusDuration);
    }
  }

  /**
   * Broadcast timer state through data channel
   */
  broadcastTimerState(action) {
    if (this.dataChannel && (this.dataChannel.open || this.dataChannel.readyState === 'open')) {
      const message = {
        type: 'timer',
        action, // 'start', 'pause', 'reset'
        remainingSeconds: this.remainingSeconds,
        isBreakTime: this.isBreakTime,
        timestamp: Date.now(),
      };

      try {
        this.dataChannel.send(JSON.stringify(message));
      } catch (error) {
        console.warn('Failed to broadcast timer state:', error);
      }
    }
  }

  /**
   * Handle remote timer updates
   */
  handleRemoteTimerUpdate(message) {
    if (message.type !== 'timer') return;

    // Prevent local action if received from remote
    const { action, remainingSeconds, isBreakTime } = message;

    switch (action) {
      case 'start':
        if (!this.isRunning) {
          this.remainingSeconds = remainingSeconds;
          this.isBreakTime = isBreakTime;
          this.start(false);
        }
        break;

      case 'pause':
        if (this.isRunning) {
          this.remainingSeconds = remainingSeconds;
          this.isBreakTime = isBreakTime;
          this.pause(false);
        }
        break;

      case 'reset':
        this.remainingSeconds = remainingSeconds;
        this.isBreakTime = isBreakTime;
        this.reset(false);
        break;

      default:
        break;
    }
  }

  /**
   * Register callback
   */
  on(event, callback) {
    if (this.callbacks.hasOwnProperty(`on${event.charAt(0).toUpperCase()}${event.slice(1)}`)) {
      this.callbacks[`on${event.charAt(0).toUpperCase()}${event.slice(1)}`] = callback;
    }
  }

  /**
   * Get current state
   */
  getState() {
    return {
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      remainingSeconds: this.remainingSeconds,
      isBreakTime: this.isBreakTime,
      focusDuration: this.focusDuration,
      breakDuration: this.breakDuration,
    };
  }

  /**
   * Cleanup
   */
  destroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

export default FocusTimer;
