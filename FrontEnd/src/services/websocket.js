// WebSocket Service with Exponential Backoff Reconnection (PRD 5.2.4)
class SignageWebSocketClient {
  constructor() {
    this.ws = null;
    this.url = import.meta.env.VITE_WS_URL || 'ws://localhost:5000';
    this.listeners = new Map();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.baseDelay = 1000; // 1s
    this.maxDelay = 30000; // 30s max backoff
    this.pingInterval = null;
    this.isConnected = false;
    this.manualClose = false;
  }

  connect(deviceId = null) {
    this.manualClose = false;
    this.deviceId = deviceId;
    
    try {
      const fullUrl = this.deviceId 
        ? `${this.url}?deviceId=${encodeURIComponent(this.deviceId)}`
        : this.url;
        
      this.ws = new WebSocket(fullUrl);

      this.ws.onopen = () => {
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.emit('connection_status', { connected: true });

        // Start heartbeat ping every 10 seconds (PRD 5.1.3)
        this.startHeartbeat();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type) {
            this.emit(data.type, data.payload || data);
          }
          this.emit('message', data);
        } catch (err) {
          console.warn('Non-JSON message received via WS:', event.data);
        }
      };

      this.ws.onclose = () => {
        this.isConnected = false;
        this.stopHeartbeat();
        this.emit('connection_status', { connected: false });
        if (!this.manualClose) {
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (err) => {
        this.emit('error', err);
        this.ws?.close();
      };
    } catch (err) {
      this.isConnected = false;
      this.scheduleReconnect();
    }
  }

  // Exponential backoff reconnect: delay = min(maxDelay, baseDelay * 2^attempts)
  scheduleReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.warn('Max reconnect attempts reached. Waiting before next try.');
      return;
    }

    const delay = Math.min(
      this.maxDelay,
      this.baseDelay * Math.pow(2, this.reconnectAttempts)
    );
    this.reconnectAttempts++;
    this.emit('reconnecting', { attempt: this.reconnectAttempts, delay });

    setTimeout(() => {
      if (!this.manualClose && !this.isConnected) {
        this.connect(this.deviceId);
      }
    }, delay);
  }

  startHeartbeat() {
    this.stopHeartbeat();
    this.pingInterval = setInterval(() => {
      if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
        this.send({
          type: 'heartbeat',
          deviceId: this.deviceId,
          timestamp: new Date().toISOString()
        });
      }
    }, 10000); // 10s ping
  }

  stopHeartbeat() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  send(message) {
    if (this.isConnected && this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(typeof message === 'string' ? message : JSON.stringify(message));
    }
  }

  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  off(event, callback) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).delete(callback);
    }
  }

  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(cb => {
        try {
          cb(data);
        } catch (e) {
          console.error(`Error in WS event callback [${event}]:`, e);
        }
      });
    }
  }

  disconnect() {
    this.manualClose = true;
    this.stopHeartbeat();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const wsService = new SignageWebSocketClient();

