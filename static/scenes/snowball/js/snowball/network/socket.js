/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { MessageType } from '../constants.js';

export class Socket {
  constructor(url, game) {
    this.url = url;
    this.game = game;
    this.backoff = 0;
    this.retryTimeout = 0;
    this.clientId = '';  // used to rejoin session
    this.onready = null;

    this.postQueue = new Map();

    this.target_ = null;
    this.serverQueue = [];

    this.socket = new WebSocket(this.url);
    this.configureSocket_(this.socket);
  }

  configureSocket_(socket) {
    socket.addEventListener('open', () => {
      if (this.socketClientId != null) {
        this.send({
          type: MessageType.RECONNECTED,
          clientId: this.clientId,
          game: this.game
        });
      }

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

    if (this.target && this.target.onSocketMessage &&
        this.target.onSocketMessage(payload) !== false) {
      ok = true;
    }

    return ok;
  }
};
