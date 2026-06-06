/**
 * Peer Connection Manager
 * Handles WebRTC P2P connections using PeerJS
 * Manages both media streams and data channels for timer sync
 */

export class PeerConnectionManager {
  constructor() {
    this.peer = null;
    this.peerId = null;
    this.connection = null;
    this.dataChannel = null;
    this.remoteConnection = null;
    this.callbacks = {
      onConnectionEstablished: null,
      onConnectionClosed: null,
      onRemoteStream: null,
      onDataChannelOpen: null,
      onDataChannelClose: null,
      onDataReceived: null,
      onError: null,
    };
  }

  /**
   * Initialize PeerJS with config for GitHub Pages
   */
  async initializePeer() {
    try {
      // Load PeerJS from CDN
      if (typeof Peer === 'undefined') {
        throw new Error('PeerJS library not loaded');
      }

      // Initialize peer with default signaling server
      this.peer = new Peer({
        // Using PeerJS cloud signaling server (free tier)
        // For production, consider hosting your own PeerServer
        // or using a service like: https://peerjs.com/peerserver
      });

      return new Promise((resolve, reject) => {
        this.peer.on('open', (id) => {
          this.peerId = id;
          console.log('Peer ID:', this.peerId);
          resolve(this.peerId);
        });

        this.peer.on('error', (error) => {
          console.error('Peer error:', error);
          if (this.callbacks.onError) {
            this.callbacks.onError(error);
          }
          reject(error);
        });

        this.peer.on('disconnected', () => {
          console.warn('Peer disconnected');
        });

        // Set timeout for initialization
        setTimeout(() => {
          if (!this.peerId) {
            reject(new Error('Peer initialization timeout'));
          }
        }, 5000);
      });
    } catch (error) {
      console.error('Error initializing peer:', error);
      throw error;
    }
  }

  /**
   * Generate room ID
   */
  generateRoomId() {
    return this.peerId || `room-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Get peer ID
   */
  getPeerId() {
    return this.peerId;
  }

  /**
   * Initiate connection to remote peer
   */
  async connectToPeer(remotePeerId, localStream) {
    try {
      if (!this.peer) {
        throw new Error('Peer not initialized');
      }

      // Establish media connection
      const mediaConnection = this.peer.call(remotePeerId, localStream);

      mediaConnection.on('stream', (remoteStream) => {
        console.log('Received remote stream');
        if (this.callbacks.onRemoteStream) {
          this.callbacks.onRemoteStream(remoteStream);
        }
      });

      mediaConnection.on('close', () => {
        console.log('Media connection closed');
        this.handleConnectionClose();
      });

      mediaConnection.on('error', (error) => {
        console.error('Media connection error:', error);
        if (this.callbacks.onError) {
          this.callbacks.onError(error);
        }
      });

      this.remoteConnection = mediaConnection;

      // Establish data connection
      const dataConnection = this.peer.connect(remotePeerId, {
        reliable: true,
      });

      this.setupDataChannel(dataConnection);

      return mediaConnection;
    } catch (error) {
      console.error('Error connecting to peer:', error);
      throw error;
    }
  }

  /**
   * Handle incoming connections
   */
  setupIncomingConnections(localStream) {
    if (!this.peer) return;

    // Handle incoming media calls
    this.peer.on('call', (mediaConnection) => {
      console.log('Incoming media call');

      if (localStream) {
        mediaConnection.answer(localStream);
      }

      mediaConnection.on('stream', (remoteStream) => {
        console.log('Received remote stream');
        if (this.callbacks.onRemoteStream) {
          this.callbacks.onRemoteStream(remoteStream);
        }
      });

      mediaConnection.on('close', () => {
        console.log('Media connection closed');
        this.handleConnectionClose();
      });

      mediaConnection.on('error', (error) => {
        console.error('Media connection error:', error);
        if (this.callbacks.onError) {
          this.callbacks.onError(error);
        }
      });

      this.remoteConnection = mediaConnection;
    });

    // Handle incoming data connections
    this.peer.on('connection', (dataConnection) => {
      console.log('Incoming data connection');
      this.setupDataChannel(dataConnection);
    });
  }

  /**
   * Setup data channel for real-time sync
   */
  setupDataChannel(dataConnection) {
    this.connection = dataConnection;

    dataConnection.on('open', () => {
      console.log('Data channel opened');
      this.dataChannel = dataConnection;

      if (this.callbacks.onDataChannelOpen) {
        this.callbacks.onDataChannelOpen(dataConnection);
      }

      if (this.callbacks.onConnectionEstablished) {
        this.callbacks.onConnectionEstablished();
      }
    });

    dataConnection.on('data', (message) => {
      console.log('Received data:', message);
      if (this.callbacks.onDataReceived) {
        this.callbacks.onDataReceived(message);
      }
    });

    dataConnection.on('close', () => {
      console.log('Data channel closed');
      this.dataChannel = null;

      if (this.callbacks.onDataChannelClose) {
        this.callbacks.onDataChannelClose();
      }
    });

    dataConnection.on('error', (error) => {
      console.error('Data channel error:', error);
      if (this.callbacks.onError) {
        this.callbacks.onError(error);
      }
    });
  }

  /**
   * Send data through data channel
   */
  sendData(message) {
    if (this.dataChannel && this.dataChannel.open) {
      try {
        this.dataChannel.send(message);
        return true;
      } catch (error) {
        console.error('Error sending data:', error);
        return false;
      }
    }
    return false;
  }

  /**
   * Check if connected
   */
  isConnected() {
    return this.dataChannel && this.dataChannel.open;
  }

  /**
   * Handle connection close
   */
  handleConnectionClose() {
    if (this.callbacks.onConnectionClosed) {
      this.callbacks.onConnectionClosed();
    }
  }

  /**
   * Disconnect from peer
   */
  disconnect() {
    try {
      if (this.remoteConnection) {
        this.remoteConnection.close();
        this.remoteConnection = null;
      }

      if (this.connection) {
        this.connection.close();
        this.connection = null;
      }

      this.dataChannel = null;
    } catch (error) {
      console.error('Error during disconnect:', error);
    }
  }

  /**
   * Destroy peer connection
   */
  destroy() {
    this.disconnect();

    if (this.peer) {
      this.peer.destroy();
      this.peer = null;
    }

    this.peerId = null;
  }

  /**
   * Register callback
   */
  on(event, callback) {
    const callbackKey = `on${event.charAt(0).toUpperCase()}${event.slice(1)}`;
    if (this.callbacks.hasOwnProperty(callbackKey)) {
      this.callbacks[callbackKey] = callback;
    }
  }

  /**
   * Get connection status
   */
  getStatus() {
    return {
      peerId: this.peerId,
      isConnected: this.isConnected(),
      hasMediaConnection: !!this.remoteConnection,
      hasDataChannel: !!this.dataChannel,
    };
  }
}

export default PeerConnectionManager;
