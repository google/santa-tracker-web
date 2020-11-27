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

import { BasicElement } from '../utils/basic-element.js';
import { Event } from '../core/event.js';
import { Entity } from '../core/entity.js';
import { combine } from '../utils/function.js';

const { Vector2, Raycaster, Octree } = self.THREE;

const HitEvents = new Set([
  'enter', 'move', 'exit', 'pick'
]);

const intermediateVector2 = new Vector2();

/**
 * @constructor
 * @extends {BasicElement}
 * @implements {Entity}
 */
const EntityElement = Entity(BasicElement);

const template = document.createElement('template');

template.innerHTML = `
<style>
:host {
  position: absolute;
  z-index: 1;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}
</style>`;

const addEventListener = (target, eventName, listener) => {
  const removableListener = event => listener(event);
  target.addEventListener(eventName, removableListener, { passive: true });
  return () => target.removeEventListener(eventName, removableListener);
};

export class InputSystem extends EntityElement {
  static get is() { return 'input-system'; }

  static get template() { return template; }

  constructor() {
    super();

    this.stampTemplate();
    this.raycaster = new Raycaster();
    this.octree = new Octree({
      undeferred: false,
      depthMax: Infinity,
      objectsThreshold: 8,
      // percent between 0 and 1 that nodes will overlap each other
      // helps insert objects that lie over more than one node
      overlapPct: 0.15
    });

    this.eventTargets = new WeakMap();
    this.targetHitTrackCount = new WeakMap();
    this.hitSourceEvents = new Map();
    this.previousMoveHits = new Map();

    this.unsubscribe = combine(
        this.on('click', event => this.hitSourceEvents.set('click', event)),
        this.on('pointer-move',
            event => this.hitSourceEvents.set('pointer-move', event)),
        addEventListener(this, 'mousemove',
            event => this.onPointerMove(event), { passive: true }),
        addEventListener(this, 'touchmove',
            event => this.onPointerMove(event), { passive: true }),
        addEventListener(this, 'click',
            event => this.onClick(event), { passive: true }));
  }

  teardown(game) {
    this.unsubscribe();
  }

  onPointerMove(event) {
    const { offsetX: x, offsetY: y } = event;
    this.dispatch(new Event('pointer-move', { x, y }, this));
  }

  onClick(event) {
    const { offsetX: x, offsetY: y } = event;
    this.dispatch(new Event('click', { x, y }, this));
  }

  normalizeXY(x, y, width, height, normalized = new Vector2()) {
    normalized.x = 2 * x / width - 1;
    normalized.y = -2 * y / height + 1;
    return normalized;
  }

  dispatch(event) {
    const targetHandlers = this.eventTargets.get(event.target);

    if (targetHandlers == null) {
      return;
    }

    const handlers = targetHandlers.get(event.type);

    if (handlers == null) {
      return;
    }

    let stopPropagation = false;

    for (let i = 0; i < handlers.length; ++i) {
      stopPropagation = handlers[i](event) === false;

      if (stopPropagation) {
        break;
      }
    }

    return stopPropagation;
  }

  on(eventName, handler, target = this) {
    if (!this.eventTargets.has(target)) {
      this.eventTargets.set(target, new Map());
    }

    const targetHandlers = this.eventTargets.get(target);

    if (!targetHandlers.has(eventName)) {
      targetHandlers.set(eventName, []);
    }

    const handlers = targetHandlers.get(eventName);
    handlers.push(handler);

    if (HitEvents.has(eventName)) {
      this.trackHitTarget(target);
    }

    return () => {
      handlers.splice(handlers.indexOf(handler), 1);

      if (HitEvents.has(eventName)) {
        this.untrackHitTarget(target);
      }
    };
  }

  trackHitTarget(target) {
    const hitTrackCount = this.targetHitTrackCount.get(target) || 0;

    if (hitTrackCount === 0) {
      this.octree.add(target, { useFaces: false });
    }

    this.targetHitTrackCount.set(target, hitTrackCount + 1);
  }

  untrackHitTarget(target) {
    const hitTrackCount = this.targetHitTrackCount.get(target) || 0;

    if (hitTrackCount > 0) {
      const finalCount = hitTrackCount - 1;

      this.targetHitTrackCount.set(target, finalCount);

      if (finalCount === 0) {
        this.octree.remove(target);
      }
    }
  }

  update(game) {
    const { width, height, camera } = game;

    this.octree.update();
    this.octree.rebuild();
    this.testHits(width, height, camera);
  }

  testHits(width, height, camera) {
    if (this.hitSourceEvents.size === 0) {
      return;
    }

    const moveEvent = this.hitSourceEvents.get('pointer-move');

    if (moveEvent != null) {
      const { x, y } = moveEvent.detail;

      const hits = this.intersectHitTargets(x, y, width, height, camera);
      const hitDetails = { x, y, hits };

      hits.forEach((intersections, target) => {
        const details = Object.assign({ intersections }, hitDetails);
        //const details = { ...hitDetails, intersections };
        if (this.previousMoveHits.has(target)) {
          this.previousMoveHits.delete(target);
        } else {
          this.dispatch(new Event('enter', details, target));
        }

        this.dispatch(new Event('move', details, target));
      });

      this.previousMoveHits.forEach((intersections, target) => {
        this.dispatch(new Event('exit', hitDetails, target));
      });

      this.previousMoveHits = hits;
    }

    const clickEvent = this.hitSourceEvents.get('click');

    if (clickEvent != null) {
      const { x, y } = clickEvent.detail;

      const hits = this.intersectHitTargets(x, y, width, height, camera);
      const hitDetails = { x, y, hits };

      let stopPropagation = false;

      hits.forEach((intersections, target) => {
        if (stopPropagation) {
          return;
        }

        const details = Object.assign({ intersections }, hitDetails);
        stopPropagation = this.dispatch(
            new Event('pick', details, target));
            //new Event('pick', { ...hitDetails, intersections }, target));
      });
    }

    this.hitSourceEvents.clear();
  }

  intersectHitTargets(x, y, width, height, camera) {
    const normalized = this.normalizeXY(x, y, width, height, intermediateVector2);

    this.raycaster.setFromCamera(normalized, camera);

    const ray = this.raycaster.ray;
    const candidates = this.octree.search(
        ray.origin, ray.far, true, ray.direction);

    const hits = this.raycaster.intersectOctreeObjects(candidates);

    return hits.sort((a, b) => a.distance > b.distance)
        .reduce((map, hit, index) => {
          const target = hit.object;

          if (!map.has(target)) {
            map.set(target, []);
          }

          map.get(target).push(hit);

          return map;
        }, new Map());
  }
}

customElements.define(InputSystem.is, InputSystem);
