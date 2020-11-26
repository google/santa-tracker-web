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

import * as location from './location.js';
import * as transport from './transport.js';
import '../polyfill/event-target.js';


export class SantaAPI extends EventTarget {
  /**
   * @param {string|undefined} baseUrl
   * @param {string} clientId
   * @param {string} lang
   * @param {string} version arbitrary string version passed from client
   */
  constructor(baseUrl, clientId, lang, version) {
    super();

    this._clientId = clientId;
    this._lang = lang;
    this._version = version;

    const url = new URL('info', baseUrl || 'https://santa-api.appspot.com');

    /**
     * @private {string}
     */
    this._infoUrl = url.toString();

    /**
     * The user's provided location on the Earth. Supercedes geoIP.
     * @private {?LatLng}
     */
    this._userProvidedLocation = null;

    /**
     * The user's location on the Earth, from the API's geoIP service, or null.
     * @private {?LatLng}
     */
    this._userInferredLocation = null;

    /**
     * The nearest destination to the user, if any.
     * @private {?SantaLocation|undefined}
     */
    this._userDestination = undefined;

    /**
     * A number between 0 and 1, consistent within a user session. Sent to the
     * server to determine a consistent time offset for this client.
     * @const @private {number}
     */
    this._jitterRand = Math.random();

    /**
     * If zero, sync is stopped.
     * @private {number}
     */
    this._syncTimeout = 0;

    /**
     * The offset, in milliseconds, as directed by the server.
     * @private {number}
     */
    this._timeOffset = 0;

    /**
     * @private {?Promise<null>}
     */
    this._activeSync = null;

    /**
     * @private {?Promise<!Object<string, *>>}
     */
    this._lastInternalSync = null;

    /**
     * @private {?string}
     */
    this._routeUrl = null;

    /**
     * @private {?Promise<!location.Route>}
     */
    this._route = null;

    /**
     * @private {boolean|undefined}
     */
    this._online = undefined;
  }

  /**
   * Wraps `transport.request` mostly for test overriding.
   *
   * @param {string} url
   * @param {?Object<string, (string|number)>=} data
   * @return {!Promise<!Object<string, *>>}
   */
  _request(url, data = null) {
    return transport.request(url, data);
  }

  /**
   * @param {?LatLng}
   */
  set userLocation(v) {
    this._userProvidedLocation = location.parseLatLng(v);  // clones
    this._userDestination = undefined;                     // forces recalc
  }

  /**
   * @return {?LatLng}
   * @export
   */
  get userLocation() {
    return this._userProvidedLocation || this._userInferredLocation || null;
  }

  /**
   * @return {boolean} whether this client is likely inside the EU
   * @export
   */
  get userInEurope() {
    const loc = this.userLocation;
    if (loc === null) {
      return true;
    }
    return !(loc.lng > 39.869 || loc.lng < -31.266 || loc.lat > 81.008 || loc.lat < 27.636);
  }

  /**
   * @return {boolean|undefined} whether we're online or pending (undefined)
   * @export
   */
  get online() {
    return this._online;
  }

  /**
   * @return {number}
   * @export
   */
  get now() {
    const localNow = +new Date();
    return (this._timeOffset || 0) + localNow;
  }

  /**
   * @return {!Date}
   * @export
   */
  get dateNow() {
    return new Date(this.now);
  }

  /**
   * @return {boolean} whether this class is syncing
   * @export
   */
  get syncing() {
    return this._syncTimeout !== 0;
  }

  /**
   * @param {boolean} state
   */
  _updateOnlineState(online) {
    if (this._online === online) {
      // ok
    } else if (online) {
      this._online = true;
      this.dispatchEvent(new Event('online'));
    } else {
      this._online = false;
      this.dispatchEvent(new Event('offline'));
    }
  }

  /**
   * Triggers sync, but also makes the class regularly sync.
   * @export
   * @return {!Promise<*>}
   */
  sync() {
    self.clearTimeout(this._syncTimeout);
    this._syncTimeout = -1;  // set to non-zero, explicit sync action

    return this.instantSync();
  }

  /**
   * Performs a single sync action. Does not change sync state.
   * @export
   * @return {!Promise<*>}
   */
  instantSync() {
    self.clearTimeout(this._syncTimeout);
    if (this._activeSync) {
      return this._activeSync;
    }

    const p = this._request(this._infoUrl, {
      'rand': this._jitterRand,
      'client': this._clientId,
      'language': this._lang,
    });

    const internalSync = p.then((result) => {
      const ok = (result['status'] === 'OK' && !result['switchOff']);
      if (ok) {
        this._updateOnlineState(true);
      } else {
        console.error('api', result['status'], 'switchOff', result['switchOff']);
        this.dispatchEvent(new Event('kill'));
      }

      // The API provides a time and offset that the client must respect.
      if ('now' in result || +result['timeOffset']) {
        const localNow = +new Date();
        const now = ('now' in result ? +result['now'] : localNow);
        const timeOffset = +result['timeOffset'] || 0;
        this._timeOffset = now - localNow + timeOffset;
      }

      // The API can force the client to reload until it reaches a high water
      // mark.
      const upgradeToVersion = result['upgradeToVersion'];
      if (upgradeToVersion && this._version && this._version < upgradeToVersion) {
        console.warn('reload: this', this._version, 'upgrade to', upgradeToVersion);
        this.dispatchEvent(new Event('reload', {detail: upgradeToVersion}));
      }

      // The API may return a guess of the user's location, based on geoIP.
      this._userInferredLocation = location.parseLatLng(result['location']);

      // The API indicates where to find Santa's route. While the entire route
      // is cached offline, this allows the Elves to upload a new route at any
      // point.
      const routeUrl = result['route'];
      if (routeUrl && this._routeUrl !== routeUrl) {
        this._userDestination = undefined;  // force recalc
        if (this._routeUrl) {
          // only clear route if we already had one
          this._route = null;
        }
        this._routeUrl = routeUrl;
      }

      // Pass result to the block below, to schedule another sync.
      return result;
    });

    // Save so we can refer to the result later.
    this._lastInternalSync = internalSync;
    this._activeSync = internalSync.then(() => null);

    // Schedule another sync to refresh and deal with errors, if any.
    const safePromise = internalSync
                            .then((result) => {
                              const after =
                                  parseInt(result['refresh']);  // parseInt so '' becomes NaN
                              if (after >= 0 || !isFinite(after)) {
                                this._scheduleSync(after);
                              }
                            })
                            .catch((err) => {
                              console.warn('unhandled sync err', err);
                              try {
                                this._updateOnlineState(false);
                                this._scheduleSync(-1);
                              } catch (e) {
                                console.warn('internal sync err', err);
                              }
                            })
                            .then(() => {
                              // always clear _activeSync
                              this._activeSync = null;
                            });

    // Inform listeners that sync has occured.
    safePromise.then(() => this.dispatchEvent(new Event('sync')));

    return this._activeSync;
  }

  /**
   * @return {boolean} whether a sync was pending
   * @export
   */
  cancelSync() {
    self.clearTimeout(this._syncTimeout);
    const wasSync = Boolean(this._syncTimeout);
    this._syncTimeout = 0;
    return wasSync;
  }

  /**
   * @param {?number=} after to schedule after, <=0 to get random value
   */
  _scheduleSync(after = null) {
    if (this._syncTimeout === 0) {
      return false;  // sync was disabled or not yet enabled
    }

    const foregroundRequest = (after < 0);
    if (!after || !isFinite(after) || after <= 0 || after > 60 * 60 * 1000) {
      // If there's no value here, then it wasn't sent by the server: refresh
      // fairly aggressively, but with lots of jitter. Currently 60s +/- 30s.
      // Also catch values >1hr (for sanity).
      after = (1000 * 60 * (Math.random() + 0.5));
    }

    const localTimeout = self.setTimeout(() => {
      // TODO(cdata): Come up with a way to inform the worker of frame
      // visibility
      /*
      //if (foregroundRequest) {
        // only sync when we go back into the foreground
        return window.requestAnimationFrame(() => {
          if (localTimeout === this._syncTimeout) {
            this.sync();
          }
        });
      }
      */
      this.sync();
    }, after);

    self.clearTimeout(this._syncTimeout);
    this._syncTimeout = localTimeout;
  }

  /**
   * @return {!Promise<?{start: number, end: number}>}
   * @export
   */
  range() {
    const p = this._lastRoute();
    return p.then((route) => {
      if (route !== null) {
        const first = route.locations[0];
        const last = route.locations[route.locations.length - 1];
        return {
          start: first.departure,
          end: last.arrival,
        };
      }

      // fallback to previoust flight times, for the current year >= Oct
      const now = new Date();
      const year = now.getFullYear() - (now.getMonth() < 10 ? 1 : 0);
      const flightHours = 25;

      const start = +Date.UTC(year, 11, 24, 10, 0, 0);  // 24th Dec at 10:00 UTC
      return {
        start,
        end: start + (flightHours * 60 * 60 * 1000),    // 25th Dec at 11:00 UTC
      };
    });
  }

  /**
   * @return {!Promise<?SantaState>}
   * @export
   */
  state() {
    const p = this._lastRoute();
    return p.then((route) => {
      if (route === null) {
        return null;
      }
      const userLocation = this.userLocation;
      if (this._userDestination === undefined) {
        this._userDestination = route.nearestDestinationTo(userLocation);
      }
      return route.getState(this.now, userLocation, this._userDestination);
    });
  }

  /**
   * @return {!Promise<!Route>}
   */
  _lastRoute() {
    if (this._route === null) {
      // nulled in sync() if URL changes, but the old route is still valid
      this._route = this._internalGetRoute();
    }
    return this._route;
  }

  async _internalGetRoute() {
    const internalSync =
        this._lastInternalSync || this.instantSync().then(() => this._lastInternalSync);
    const result = await internalSync;

    const routeUrl = result['route'];
    if (!routeUrl) {
      return null;  // no route available, possibly too early or too late
    }

    // TODO(samthor): outsource to indexdb

    const routeData = await this._request(routeUrl);
    const route = new location.Route(routeUrl, routeData);
    if (!route.locations.length) {
      console.warn('got bad data, no dests', routeData);
      throw new Error('no destinations found for Santa');
    }

    return route;
  }
}
