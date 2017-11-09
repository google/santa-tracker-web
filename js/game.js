/*
 * Copyright 2017 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

/**
 * @typedef {{
 *   clientId: (string|undefined),
 *   p: (*|undefined),
 *   r: (undefined|!Array<*>),
 *   k: (string|undefined),
 *   error: (string|undefined)
 * }}
 */
var SocketPayload;

/**
 * SantaSocket wraps a WebSocket to connect to the Santa relay server.
 *
 * @export
 */
class SantaSocket {
  constructor(game) {
    this.host_ = 'ws://localhost:8080/socket';
    this.clientId_ = '';

    /** @private {!Array<string>} */
    this.queue_ = [];

    this.backoff_ = 0;
    this.timeout_ = 0;
    this.shutdown_ = false;

    /** @private {!WebSocket} */
    this.socket_ = new WebSocket(this.host_);
    this.configureSocket_(this.socket_);
  }

  configureSocket_(socket) {
    socket.addEventListener('open', () => {
      this.backoff_ = 0;
      socket.send(JSON.stringify({'clientId': this.clientId_}));

      while (this.queue_.length) {
        // assumes this will send probably
        socket.send(this.queue_.shift());
      }

    });
    socket.addEventListener('message', (ev) => {
      const data = /** @type {SocketPayload} */ (JSON.parse(ev.data));
      let ok = false;
      if (data.clientId) {
        this.clientId_ = data.clientId;
        ok = true;
      }
      if (data.k) {
        throw new Error('no support for keyed data: ' + data.k);
      }
      if (data.p) {
        // got 'stuff'
        Events.trigger(this, 'message', data.s);
        ok = true;
      }
      if (!ok) {
        console.debug('got unkown message', data);
      }
    });
    socket.addEventListener('error', (ev) => {
      ++this.backoff_;
    });
    socket.addEventListener('close', () => this.retry_());
  }

  retry_() {
    if (this.shutdown_) {
      return;  // done
    }

    window.clearTimeout(this.timeout_);
    this.timeout_ = window.setTimeout(() => {
      this.socket_ = new WebSocket(this.host_);
      this.configureSocket_(this.socket_);
    }, Math.pow(this.backoff_, 1.8) * Math.random());
  }

  /**
   * @export
   */
  shutdown() {
    this.socket_.close();
    this.shutdown_ = true;
  }

  /**
   * @param {*} data JSON-stringify data
   */
  send(data) {
    // TODO(samthor): Pretend to be Promise-based to delay multiple messages?
    const raw = JSON.stringify(data);
    if (this.socket_.readyState === WebSocket.OPEN) {
      this.socket_.send(raw);
    } else {
      this.queue_.push(raw);
    }
  }

  /**
   * @param {string} eventName
   * @param {function(...*)} listener
   * @export
   */
  addListener(eventName, listener) {
    return Events.addListener(this, eventName, listener);
  }

  /**
   * @param {string} eventName
   * @param {function(...*)} listener
   * @return {boolean} true if removed
   * @export
   */
  removeListener(eventName, listener) {
    return Events.removeListener(this, eventName, listener);
  }
}