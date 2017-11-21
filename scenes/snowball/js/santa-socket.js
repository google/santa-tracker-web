
export class SantaSocket {
  constructor(url, game) {
    this.url = url;
    this.game = game;
    this.backoff = 0;
    this.retryTimeout = 0;
    this.socketClientId = '';  // used to rejoin session
    this.onready = null;
    this.playerId = null;

    this.postQueue = new Map();

    this.target_ = null;
    this.serverQueue = [];

    this.socket = new WebSocket(this.url);
    this.configureSocket_(this.socket);
  }

  configureSocket_(socket) {
    socket.addEventListener('open', () => {
      socket.send(JSON.stringify({
        'clientId': this.socketClientId,
        'game': this.game,
      }));

      // Assumes the connection is valid for a time, and send all pending data.
      this.postQueue.forEach((data) => socket.send(data));
    });
    socket.addEventListener('message', (ev) => {
      // on the first message, clear queue/backoff
      this.postQueue = new Map();
      this.backoff = 0;

      const payload = JSON.parse(ev.data);
      if (!this.handlePayload_(payload)) {
        console.warn('got unhandled payload', payload);
      }
    });
    socket.addEventListener('close', () => this.retry_());
  }

  retry_() {
    this.socket.close();
    const backoffTime = 1000 * (Math.pow(this.backoff, 1.02) + Math.random());

    window.clearTimeout(this.retryTimeout);
    this.retryTimeout = window.setTimeout(() => {
      this.socket = new WebSocket(this.url);
      this.configureSocket_(this.socket);
    }, backoffTime);
  }

  set target(target) {
    this.target_ = target;

    if (target) {
      const queue = this.serverQueue;
      queue.forEach((payload) => this.sendToTarget_(payload));
    }
  }

  get target() {
    return this.target_;
  }

  post(data, coalesceKey) {
    const raw = JSON.stringify(data);
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(raw);
    } else {
      this.postQueue.set(coalesceKey, raw);
    }
  }

  handlePayload_(payload) {
    let ok = false;
    let queued = false;

    if ('s' in payload || 'l' in payload) {
      this.sendToTarget_(payload);
      ok = true;
    }

    if (payload['playerId']) {
      this.playerId = payload['playerId'];
      ok = true;
    }

    if (payload['clientId']) {
      this.socketClientId = payload['clientId'];
      this.playerId = null;
      this.onready && this.onready(this.socketClientId);
      ok = true;
    }

    return ok;
  }

  sendToTarget_(payload) {
    if ('s' in payload) {
      this.serverQueue = [payload];  // canonical state

      if (this.target_) {
        this.target_.resetState(payload['tick'], payload['s']);
      }
    }

    if ('l' in payload) {
      this.serverQueue.push(payload);  // update

      if (this.target_) {
        this.target_.updateState(payload['tick'], payload['l']);
      }
    }
  }
}