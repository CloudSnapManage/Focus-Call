/**
 * Media Manager
 * Handles local media streams (audio/video) and remote streams
 */

export class MediaManager {
  constructor() {
    this.localStream = null;
    this.screenStream = null;
    this.isAudioEnabled = true;
    this.isVideoEnabled = true;
    this.isScreenSharing = false;
  }

  /**
   * Initialize local media stream
   */
  async initializeLocalMedia() {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user',
        },
      });

      if (!this.isScreenSharing) {
        this.updateLocalPreview(this.localStream);
      }

      return this.localStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      throw new Error(`Could not access camera/microphone: ${error.message}`);
    }
  }

  /**
   * Set remote media stream
   */
  setRemoteStream(stream) {
    const remoteVideo = document.getElementById('remoteVideo');
    const noRemoteStream = document.getElementById('noRemoteStream');

    if (remoteVideo) {
      remoteVideo.srcObject = stream;

      const videoTrack = stream?.getVideoTracks()[0];
      if (videoTrack) {
        const settings = videoTrack.getSettings();
        if (settings.width && settings.height) {
          remoteVideo.style.aspectRatio = `${settings.width}/${settings.height}`;
        } else {
          remoteVideo.style.removeProperty('aspect-ratio');
        }
      } else {
        remoteVideo.style.removeProperty('aspect-ratio');
      }

      this._playVideoElement(remoteVideo);

      // Show/hide no-stream placeholder
      if (stream && stream.getTracks().length > 0) {
        if (noRemoteStream) noRemoteStream.classList.add('hidden');
      } else {
        if (noRemoteStream) noRemoteStream.classList.remove('hidden');
      }
    }
  }

  /**
   * Play a video element and ignore autoplay rejections
   */
  _playVideoElement(videoElement) {
    if (!videoElement) return;
    const playPromise = videoElement.play();
    if (playPromise && typeof playPromise.then === 'function') {
      playPromise.catch((error) => {
        console.warn('Video playback prevented by browser autoplay policy:', error);
      });
    }
  }

  updateLocalPreview(stream) {
    const localVideo = document.getElementById('localVideo');
    if (!localVideo) return;
    localVideo.srcObject = stream;

    const videoTrack = stream?.getVideoTracks()[0];
    if (videoTrack) {
      const settings = videoTrack.getSettings();
      if (settings.width && settings.height) {
        localVideo.style.aspectRatio = `${settings.width}/${settings.height}`;
      } else {
        localVideo.style.removeProperty('aspect-ratio');
      }
    } else {
      localVideo.style.removeProperty('aspect-ratio');
    }

    this._playVideoElement(localVideo);
  }

  /**
   * Toggle audio (mute/unmute microphone)
   */
  toggleAudio() {
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      this.isAudioEnabled = !this.isAudioEnabled;
      return this.isAudioEnabled;
    }
    return false;
  }

  /**
   * Toggle video (on/off)
   */
  toggleVideo() {
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = !track.enabled;
      });
      this.isVideoEnabled = !this.isVideoEnabled;
      return this.isVideoEnabled;
    }
    return false;
  }

  /**
   * Start screen sharing
   */
  async startScreenShare() {
    try {
      this.screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          cursor: 'always',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30, max: 60 },
        },
        audio: false,
      });

      this.isScreenSharing = true;
      this.updateLocalPreview(this.screenStream);
      return this.screenStream;
    } catch (error) {
      if (error.name !== 'NotAllowedError') {
        console.error('Error starting screen share:', error);
      }
      this.isScreenSharing = false;
      return null;
    }
  }

  /**
   * Stop screen sharing
   */
  stopScreenShare() {
    if (this.screenStream) {
      this.screenStream.getTracks().forEach(track => {
        track.stop();
      });
      this.screenStream = null;
      this.isScreenSharing = false;
      if (this.localStream) {
        this.updateLocalPreview(this.localStream);
      }
    }
  }

  /**
   * Get local stream
   */
  getLocalStream() {
    return this.localStream;
  }

  /**
   * Stop all local media
   */
  stopLocalMedia() {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        track.stop();
      });
      this.localStream = null;
    }

    this.stopScreenShare();
  }

  /**
   * Get current audio state
   */
  isAudioActive() {
    return this.isAudioEnabled;
  }

  /**
   * Get current video state
   */
  isVideoActive() {
    return this.isVideoEnabled;
  }

  /**
   * Get screen sharing state
   */
  isScreenSharingActive() {
    return this.isScreenSharing;
  }
}

export default MediaManager;
