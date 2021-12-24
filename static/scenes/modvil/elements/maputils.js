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

import {_static} from '../../../src/magic.js';
import {localStorage} from '../../../src/storage.js';
import * as spherical from '../../../src/api/spherical.js';


const lerp = (from, to, ratio) => {
  const delta = to - from;
  return from + delta * ratio;
};

const inverseLerp = (from, to, value) => {
  const range = to - from;
  return (value - from) / range;
};


const polylineColor = '#22a528';
const polylineWeight = 2;
const trailLength = 20;
const routeHourDuration = 25;

const PRESENTS_TRANSIT = 0.3;
const PRESENTS_IN_CITY = 0.7;


export const northpoleLocation = {lat: 84.6, lng: 168};


async function destinationsFor(url) {
  const r = await fetch(url);
  const data = await r.json();
  return data['destinations'] || [];
}


export async function fetchRoute(url, year = (new Date().getFullYear())) {
  // Skews route data over the passed year, suitable for future years if nothing else changes.
  const from = +Date.UTC(year, 11, 24, 10, 0, 0);  // 24th Dec at 10:00 UTC
  const to = (function() {
    const t = new Date(+from);
    t.setHours(t.getHours() + routeHourDuration);
    return +t;
  })();

  const langUrl = url.replace('|LANG|', document.documentElement.lang || 'en');
  const fallbackUrl = url.replace('|LANG|', 'en');

  let destinations;
  try {
    destinations = await destinationsFor(langUrl);
  } catch (e) {
    console.warn('failed to fetch route', langUrl, e);
    try {
      // If this is "en" twice, at least we tried twice.
      destinations = await destinations(fallbackUrl);
    } catch (e) {
      console.warn('failed to fetch fallback', fallbackUrl, e);
      window.ga('send', 'event', 'tracker', 'destinations', 'failure');
    }
  }

  if (!destinations || !destinations.length) {
    return destinations || [];
  }

  const actualFrom = destinations[0].departure;
  const actualTo = destinations[destinations.length - 1].arrival;

  console.info('range', from, to, 'vs actual', actualFrom, actualTo);

  const skew = (value) => {
    if (value === 0) {
      return value;
    }
    const ratio = inverseLerp(actualFrom, actualTo, value);
    return lerp(from, to, ratio);
  };

  // skew [actualFrom,actualTo] to [from,to]
  destinations.forEach((destination) => {
    destination.departure = skew(destination.departure);
    destination.arrival = skew(destination.arrival);
  });

  return destinations;
}


export class DestinationsCache {
  constructor(listener) {
    if (localStorage['destinations']) {
      try {
        this._destinations = JSON.parse(localStorage['destinations']);
        if (!this._destinations.length) {
          // For some reason, we cached an empty destinations array. Force us to be refreshed, this
          // is basically like we had bad/invalid JSON stored.
          throw new Error('trigger exception block');
        }
      } catch (e) {
        this._destinations = null;
        localStorage['routeUrl'] = '';
      }
    }

    this._task = null;
    this._listener = listener;

    if (this._destinations) {
      window.ga('send', 'event', 'tracker', 'destinations', 'cache-hit');
      this._listener(this._destinations);
    }
  }

  get destinations() {
    if (this._task) {
      return this._task;
    }
    return Promise.resolve(this._destinations || []);
  }

  set routeUrl(routeUrl) {
    if (localStorage['routeUrl'] === routeUrl) {
      return;
    }
    localStorage['routeUrl'] = routeUrl;

    const p = fetchRoute(routeUrl).then((destinations) => {
      if (this._task === p) {
        this._destinations = destinations;
        localStorage['destinations'] = JSON.stringify(destinations);
        this._listener(destinations);
        this._task = null;
        window.ga('send', 'event', 'tracker', 'destinations', 'fetch');
      }
      return destinations;
    });
    this._task = p;
  }

  get routeUrl() {
    return routeUrl;
  }
}


export function elementMapsOverlay(layer = 'floatPane') {
  return new class extends google.maps.OverlayView {
    constructor() {
      super();
      this._position = null;
      this._container = document.createElement('div');
      this._container.style.willChange = 'transform';
      this._container.style.background = 'red';
      this._container.style.width = '0px';

      this._container.addEventListener('click', (ev) => ev.stopPropagation());
    }

    onAdd() {
      const n = this.getPanes()[layer];
      n.append(this._container);
    }

    onRemove() {
      const n = this.getPanes()[layer];
      n.removeChild(this._container);  // noop if not here
    }

    set position(latLng) {
      this._position = latLng;
      this.draw();
    }

    get position() {
      return this._position;
    }

    get container() {
      return this._container;
    }

    draw() {
      const projection = this.getProjection();
      if (!projection || !this._position) {
        this._container.hidden = true;
        return;
      }

      this._container.hidden = false;

      const pos = projection.fromLatLngToDivPixel(this._position);
      this._container.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
    }
  };
}


export class DataManager {
  constructor(destinations) {
    this._time = 0;
    this._nextOrCurrentIndex = 0;
    this._destinations = destinations;

    this._destinationsByKey = {};
    destinations.forEach((destination) => {
      this._destinationsByKey[destination.id] = destination;
    });

    if (this._destinations.length === 0) {
      const year = new Date().getFullYear();
      const countdownTo = +Date.UTC(year, 11, 24, 10, 0, 0);  // 24th Dec at 10:00 UTC
      this._destinations = [
        {
          id: 'takeoff',
          location: northpoleLocation,
          presentsDelivered: 0,
          arrival: 0,
          departure: +countdownTo,
          city: 'Santa\'s Village',
          region: 'North Pole',
          distance: 0,
          details: {timezone: 0},
        },
      ];
    } else {
      // We aren't given total distance. Just add it to route data when we get it.
      let previousLocation = destinations[0].location;
      let totalDistance = 0;
      destinations.forEach((destination) => {
        totalDistance += spherical.computeDistanceBetween(previousLocation, destination.location);
        destination.distance = totalDistance;
        previousLocation = destination.location;
      });
    }

    this._details = null;
  }

  closestArrival(userLocation) {
    if (userLocation === null) {
      const year = (new Date(this._destinations[0].departure)).getFullYear();
      const targetDate = new Date(year, 11, 25);
      const target = +targetDate;
      const userOffset = targetDate.getTimezoneOffset() * -60;  // to match remote data

      // Sort first by timezone locality. Use all of the same timezone or the nearest ones.
      let cands = this._destinations.map((destination) => {
        return {
          timezoneDelta: Math.abs(userOffset - destination.details.timezone),
          arrivalDelta: Math.abs(target - destination.arrival),
          id: destination.id,
          arrival: destination.arrival,
        };
      });
      cands.sort((left, right) => left.timezoneDelta - right.timezoneDelta);

      // Limit to candidates with the closest timezone delta.
      const closestDelta = cands[0].timezoneDelta;
      let valid;
      for (valid = 1; valid < cands.length; ++valid) {
        if (cands[valid].timezoneDelta !== closestDelta) {
          break;
        }
      }
      cands = cands.slice(0, valid);

      // Sort by arrival delta (this could be done in one pass but we only have a few stops now).
      cands.sort((left, right) => left.arrivalDelta - right.arrivalDelta);

      if (this._destinations.length > 1) {
        // Log this, but only if we have real destination data (not just single Village stop).
        window.ga('send', 'event', 'tracker', 'timezone-guess', cands[0].id);
        console.info('nearest stop (tz):', cands[0].id);
      }

      return cands[0].arrival;
    }

    let index = 0;  // we assume Santa's Village is a poor candidate
    let bestAngle = 100.0;

    for (let i = 1; i < this._destinations.length; ++i) {
      const candAngle = spherical.computeAngleBetween(userLocation, this._destinations[i].location);
      if (candAngle < bestAngle) {
        bestAngle = candAngle;
        index = i;
      }
    }

    if (this._destinations.length > 1) {
      console.info('nearest stop (ip):', this._destinations[index].id);
    }
    return this._destinations[index].arrival;
  }

  get range() {
    if (this._destinations.length === 1) {
      const only = this._destinations[0];
      return {
        from: only.departure,
        to: only.departure,
      };
    }
    return {
      from: this._destinations[0].departure,
      to: this._destinations[this._destinations.length - 1].arrival,
    };
  }

  stop(i) {
    if (typeof i !== 'number') {
      return this._destinationsByKey[i] || null;
    }
    if (i < 0) {
      i = this._destinations.length - i;
    }
    return this._destinations[i] || null;
  }

  get length() {
    return this._destinations.length;
  }

  get details() {
    if (this._details === null) {
      this._details = this._buildDetails();
    }
    return this._details;
  }

  _buildDetails() {
    if (this._nextOrCurrentIndex === 0) {
      return {
        raw: this._destinations[0],
        visibleTo: 0,
        location: northpoleLocation,
        presents: 0,
        distance: 0,
        heading: 0,
        stop: true,
        home: true,
        next: Math.max(0, this._destinations[0].departure - this._time),
      };
    }

    const curr = this._destinations[this._nextOrCurrentIndex];
    const prev = this._destinations[this._nextOrCurrentIndex - 1];

    // Is Santa currently at a stop?
    if (this._time >= curr.arrival) {
      // This is after the transit delivery.
      const ratio = PRESENTS_TRANSIT +
          inverseLerp(curr.arrival, curr.departure, this._time) * PRESENTS_IN_CITY;
      return {
        raw: curr,
        visibleTo: this._nextOrCurrentIndex,
        location: curr.location,
        presents: Math.round(lerp(prev.presentsDelivered, curr.presentsDelivered, ratio)),
        distance: curr.distance,
        heading: spherical.computeHeading(prev.location, curr.location),
        stop: true,
        home: (this._nextOrCurrentIndex + 1 >= this._destinations.length),
        next: (curr.departure - this._time),
      };
    }

    // Otherwise, interpolate during flight.
    const flightRatio = inverseLerp(prev.departure, curr.arrival, this._time);
    const presentsRatio = flightRatio * PRESENTS_TRANSIT;
    const location = spherical.interpolate(prev.location, curr.location, flightRatio);
    return {
      raw: curr,
      visibleTo: this._nextOrCurrentIndex - 1,  // don't show upcoming marker
      location,
      presents: Math.round(lerp(prev.presentsDelivered, curr.presentsDelivered, presentsRatio)),
      distance: prev.distance + spherical.computeDistanceBetween(prev.location, location),
      heading: spherical.computeHeading(prev.location, curr.location),
      stop: false,
      home: false,
      next: (curr.arrival - this._time),
    };
  }

  set now(time) {
    time = +time || 0;

    if (time === this._time) {
      return;  // ignore for same or no data (assume at least one stop)
    }

    this._details = null;  // invalidate details

    if (time < this._time) {
      // We went back in time. Reset the state of everything.
      this._nextOrCurrentIndex = 0;
    }
    this._time = time;

    let i = this._nextOrCurrentIndex;
    while (i < this._destinations.length) {
      if (time <= this._destinations[i].departure) {
        this._nextOrCurrentIndex = i;
        break;
      }
      ++i;
    }
    if (i === this._destinations.length) {
      this._nextOrCurrentIndex = this._destinations.length - 1;
    }
  }

  get now() {
    return this._time;
  }
}


export class StopManager {
  constructor(map, manager, listener) {
    this._map = map;
    this._visibleTo = 0;
    this._listener = listener;

    const markerIcon = /** @type {google.maps.Icon} */ ({
      url: _static`img/tracker/marker.png`,
      size: new google.maps.Size(15, 18),
      scaledSize: new google.maps.Size(15, 18),
    });

    const homeIcon = /** @type {google.maps.Icon} */ ({
      url: _static`img/tracker/northpole.png`,
      size: new google.maps.Size(132, 100),
      scaledSize: new google.maps.Size(66, 50),
      anchor: new google.maps.Point(33, 25),
    });

    this._markers = [];
    for (let i = 0; i < manager.length; ++i) {
      const {id, location, city, region} = manager.stop(i);
      const isHome = (id === 'takeoff');  // last stop is a real icon, which looks cute
      const marker = new google.maps.Marker({
        position: location,
        map,
        icon: isHome ? homeIcon : markerIcon,
        visible: (i === 0),  // implicit time is zero, hide by default
        title: `${city}, ${region}`,
      });
      marker.addListener('click', () => listener(id));
      this._markers.push(marker);
    }

    this._activeTrail = new google.maps.Polyline({
      geodesic: true,
      strokeColor: polylineColor,
      strokeWeight: polylineWeight,
      map,
    });

    this._trail = [];
    for (let i = 0; i < trailLength; ++i) {
      const polyline = new google.maps.Polyline({
        geodesic: true,
        strokeColor: polylineColor,
        strokeWeight: polylineWeight,
        strokeOpacity: 1 - (i / trailLength),
        map,
      });
      this._trail.push(polyline);
    }

    this._manager = manager;
  }

  update() {
    const details = this._manager.details;
    const delta = (details.visibleTo - this._visibleTo);
    const reverseTime = (delta < 0);

    // Configure marker visibility.
    if (reverseTime) {
      // we went back in time, clear markers
      for (let i = details.visibleTo + 1; i <= this._visibleTo; ++i) {
        this._markers[i].setVisible(false);
      }
    } else {
      for (let i = this._visibleTo; i <= details.visibleTo; ++i) {
        this._markers[i].setVisible(true);
      }
    }

    // Set trail components if something changed.
    if (delta) {
      const usable = Math.min(details.visibleTo, trailLength);
      let i = 0;
      if (!details.home) {
        // Don't draw any lines at home (start or end).
        for (i = 0; i < usable; ++i) {
          const polyline = this._trail[i];
          polyline.setPath([
            this._manager.stop(details.visibleTo - i).location,
            this._manager.stop(details.visibleTo - i - 1).location,
          ]);
        }
      }
      while (i < trailLength) {
        this._trail[i].setPath([]);
        ++i;
      }
    }

    // Set last trail.
    if (details.stop) {
      this._activeTrail.setPath([]);
    } else {
      const last = this._manager.stop(details.visibleTo);
      this._activeTrail.setPath([
        last.location,
        details.location,
      ]);
    }

    this._visibleTo = details.visibleTo;
  }

  destroy() {
    this._markers.forEach((marker) => marker.setMap(null));
  }
}
