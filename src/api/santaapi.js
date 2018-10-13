

import * as transport from './transport.js';
import * as location from './location.js';


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
   * @param {?LatLng}
   */
  set userLocation(v) {
    this._userProvidedLocation = v;
    this._userDestination = undefined;  // forces recalc
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
    const loc = this._userLocation;
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
   * @param {boolean} state 
   */
  _updateOnlineState(online) {
    if (this._online === online) {
      // ok
    } else if (online) {
      this._online = true;
      this.dispatchEvent(new CustomEvent('online'));
    } else {
      this._online = false;
      this.dispatchEvent(new CustomEvent('offline'));
    }
  }

  /**
   * @export
   * @return {!Promise<*>}
   */
  sync() {
    if (this._activeSync) {
      return this._activeSync;
    }
    window.clearTimeout(this._syncTimeout);

    const p = transport.request(this._infoUrl, {
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
        this.dispatchEvent(new CustomEvent('kill'));
      }

      // The API provides a time and offset that the client must respect.
      const localNow = +new Date();
      this._timeOffset = result['now'] + result['timeOffset'] - localNow;
  
      // The API can force the client to reload until it reaches a high water mark.
      const upgradeToVersion = result['upgradeToVersion'];
      if (upgradeToVersion && this._version && this._version < upgradeToVersion) {
        console.warn('reload: this', this._version, 'upgrade to', upgradeToVersion);
        this.dispatchEvent(new CustomEvent('reload', {detail: upgradeToVersion}));
      }
  
      // The API may return a guess of the user's location, based on geoIP.
      this._userInferredLocation = location.parseLatLng(result['location']);
  
      // The API indicates where to find Santa's route. While the entire route is cached offline,
      // this allows the Elves to upload a new route at any point.
      const routeUrl = result['route'];
      if (routeUrl && this._routeUrl !== routeUrl) {
        this._route = null;  // clear route, next request will fetch anew
        this._userDestination = undefined;
      }

      // Pass result to the block below, to schedule another sync.
      return result;
    });

    // Save so we can refer to the result later.
    this._lastInternalSync = internalSync;
    this._activeSync = internalSync.then(() => null);

    // Schedule another sync and deal with errors, if any.
    internalSync
        .then((result) => {
          this._scheduleSync(+result['refresh']);
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
    internalSync.then(() => this.dispatchEvent(new CustomEvent('sync')));

    return this._activeSync;
  }

  /**
   * @param {?number=} after to schedule after
   */
  _scheduleSync(after=null) {
    const foregroundRequest = (after < 0);
    if (!after || !isFinite(after) || after <= 0) {
      // If there's no value here, then it wasn't sent by the server: refresh fairly aggressively,
      // but with lots of jitter. Currently 60s +/- 30s.
      after = (1000 * 60 * (Math.random() + 0.5));
    }
  
    const localTimeout = window.setTimeout(() => {
      if (foregroundRequest) {
        // only sync when we go back into the foreground
        return window.requestAnimationFrame(() => {
          if (localTimeout === this._syncTimeout) {
            this.sync();
          }
        });
      }
      this.sync();
    }, after);
  
    window.clearTimeout(this._syncTimeout);
    this._syncTimeout = localTimeout;
  }

  /**
   * @return {!Promise<!SantaState>}
   */
  state() {
    const p = this._lastRoute();
    return p.then((route) => {
      const userLocation = this.userLocation;
      if (this._userDestination === undefined) {
        this._userDestination = route.nearestDestinationTo(userLocation);
        console.debug('found nearest stop to user', this._userDestination, userLocation);
      }

      return route.getState(this.now, userLocation, this._userDestination);
    });
  }

  /**
   * @return {!Promise<!Route>}
   */
  _lastRoute() {
    if (this._route) {
      return this._route;  // nulled in sync() if URL changes
    }
    const localRoute = this._route = this._internalGetRoute();
    return localRoute.then(() => {
      if (localRoute !== this._route) {
        return this.route();  // something changed, return the replacement
      }
      return localRoute;
    });
  }

  async _internalGetRoute() {
    const internalSync = this._lastInternalSync || this.sync().then(() => this._lastInternalSync);
    const result = await internalSync;
    const routeUrl = result['route'];

    if (!routeUrl) {
      throw new Error('no route URL available');
    }

    // TODO(samthor): outsource to indexdb

    const routeData = await transport.request(routeUrl);
    const route = new location.Route(routeUrl, routeData);
    if (!route.locations.length) {
      console.warn('got bad data', routeData);
      throw new Error('no destinations found for Santa');
    }

    return route;
  }
}
