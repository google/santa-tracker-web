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


import {SantaAPI} from './santaapi.js';


const TEST_BASEURL = 'https://example.com';


class TestSantaAPI extends SantaAPI {
  constructor(clientId='test', lang='xx', version='0') {
    super(TEST_BASEURL, clientId, lang, version);
    this._expect = [];
  }

  expect(url, data, response) {
    this._expect.push({url, data, response});
  }

  verify() {
    assert.equal(this._expect.length, 0);
  }

  _request(url, data=null) {
    const first = this._expect.shift();
    if (first == null) {
      throw new Error('got request, was not expecting one: ' + url);
    }
    assert.equal(url, new URL(first.url, TEST_BASEURL).toString());
    if (first.data !== undefined) {
      assert.deepEqual(data, first.data);
    }
    if (first.response instanceof Error) {
      return Promise.reject(first.response);
    }
    return Promise.resolve(first.response);
  }
}


const SANTA_TAKEOFF = 1514109600000;
const TEST_ROUTE = Object.freeze({
  'stream': [],
  'destinations': [
    {
      'id': 'takeoff',
      'arrival': 0,
      'departure': SANTA_TAKEOFF,
      'population': 0,
      'presentsDelivered': 0,
      'city': 'Santa\'s Village',
      'region': 'North Pole',
      'location': {
        'lat': 84.6,
        'lng': 168,
      },
    },
    {
      'id': 'sydney',
      'arrival': SANTA_TAKEOFF + (1000 * 60),
      'departure': SANTA_TAKEOFF + (1000 * 120),
      'population': 4400000,
      'presentsDelivered': 146084997,
      'city': 'Sydney',
      'region': 'Australia',
      'location': {
        'lat': -33.867139,
        'lng': 151.207114,
      },
    },
    {
      'id': 'landing',
      'arrival': SANTA_TAKEOFF + (1000 * 240),
      'departure': 0,
      'population': 0,
      'presentsDelivered': 7056276203,
      'city': 'Santa\'s Village',
      'region': 'North Pole',
      'location': {
        'lat': 84.6,
        'lng': 168,
      },
    },
  ],
});


suite('santaapi', () => {
  let api;

  setup(() => {
    api = new TestSantaAPI();
  });

  teardown(() => {
    api.verify();
  });

  test('offline', async () => {
    assert.isUndefined(api.online);

    api.expect('info', undefined, new TypeError('pretend we are offline'));
//    api.expect('info', undefined, {status: 'OK'});

    let offlineEvent = 0;
    api.addEventListener('offline', (ev) => {
      ++offlineEvent;
    });

    try {
      await api.instantSync();
    } catch (e) {
      // ignore
    }
    assert.isFalse(api.syncing, 'instantSync does not cause syncing');
    assert.isFalse(api.cancelSync(), 'no pending sync');
    assert.isFalse(api.online, 'api is not online');
    assert.equal(offlineEvent, 1);

    // TODO(samthor): We don't test actual network retries here, as the mocking occurs before e.g.
    // calling xhrRequest inside `transport.js`.
  });

  test('online', async () => {
    assert.isUndefined(api.online);

    api.expect('info', {
      'rand': api._jitterRand,
      'client': 'test',
      'language': 'xx',
    }, {
      'status': 'OK',
      'refresh': 1,
    });

    let onlineEvent = 0;
    api.addEventListener('online', (ev) => {
      ++onlineEvent;
    });

    await api.instantSync();
    assert.isTrue(api.online, 'client should now be oline');
    assert.equal(onlineEvent, 1, 'online event should dispatch');
    await Promise.resolve();  // wait for microtask to cleanup

    api.expect('info', undefined, {'status': 'OK', 'refresh': -1});
    await api.instantSync();
    assert.equal(onlineEvent, 1, 'online event should only dispatch once');
  });

  test('sync', async () => {
    api.expect('info', undefined, {
      'status': 'OK',
      'refresh': 1,
    });
    await api.sync();
    assert.isTrue(api.syncing, 'client should be syncing');
    await Promise.resolve();  // microtask

    // now, wait for the inevitable sync to occur in a _whole_ 1ms
    api.expect('info', undefined, {'status': 'OK'});
    await new Promise((resolve, reject) => {
      api.addEventListener('sync', resolve, {once: true});
      window.setTimeout(reject, 100);
    });

    // cleanup state
    assert.isTrue(api.cancelSync(), 'class was syncing, should clear state');
    assert.isFalse(api.syncing, 'test cancelSync');
    api.expect('info', undefined, {
      'status': 'OK',
      'refresh': -1,
    });
    await api.instantSync();
    assert.isFalse(api.syncing, 'instantSync does not cause sync');
    await Promise.resolve();  // microtask

    assert.isFalse(api.cancelSync(), 'cancelSync should return false, was not syncing');
  });

  test('time', async () => {
    api.expect('info', undefined, {
      'status': 'OK',
      'now': SANTA_TAKEOFF + (1000 * 30),  // 1/2 way to Sydney
    });
    await api.instantSync();
    await Promise.resolve();

    const deltaNow = api.now - (SANTA_TAKEOFF + (1000 * 30));
    assert.isTrue(deltaNow >= 0 && deltaNow <= 100, 'now should be as info now');

    api.expect('info', undefined, {
      'status': 'OK',
      'now': SANTA_TAKEOFF + (1000 * 30),  // 1/2 way to Sydney
      'timeOffset': (1000 * 60),           // an extra 60s in future
    });
    await api.instantSync();
    await Promise.resolve();

    const deltaOffset = api.now - (SANTA_TAKEOFF + (1000 * 90));
    assert.isTrue(deltaOffset >= 0 && deltaOffset <= 100, 'now should be as info offset');
  });

  const stateDelayFrame = async (data) => {
    if (data !== undefined) {
      api.expect('info', undefined, data);
      await api.instantSync();
    }
    const state = await api.state();
    await Promise.resolve();
    return state;
  };

  test('route', async () => {
    api.expect('info', undefined, {
      'status': 'OK',
      'route': `${TEST_BASEURL}/route.json`,
      'now': SANTA_TAKEOFF + (1000 * 30),  // 1/2 way to Sydney
    });

    api.expect('route.json', null, TEST_ROUTE);

    // check while flying to location
    const stateToSydney = await stateDelayFrame();
    assert.isFalse(api.syncing, 'route does not cause syncing');
    assert.isTrue(api.online, 'route causes online state');
    assert.isNull(stateToSydney.userDestination, 'destination not known');
    assert.equal(stateToSydney.prev.id, 'takeoff');
    assert.isNull(stateToSydney.stopover, 'should not be at stop');
    assert.equal(stateToSydney.next.id, 'sydney');

    // check while at location
    const stateAtSydney = await stateDelayFrame({
      'status': 'OK',
      'now': SANTA_TAKEOFF + (1000 * 90),  // 1/2 way during Sydney
    });
    assert.equal(stateAtSydney.dests.length, 2);
    assert.equal(stateAtSydney.prev.id, 'takeoff');
    assert.equal(stateAtSydney.stopover.id, 'sydney');
    assert.isBelow(stateAtSydney.presentsDelivered, 146084997);
    assert.equal(stateAtSydney.next.id, 'landing');

    // confirm just after
    const stateJustAfterSydney = await stateDelayFrame({
      'status': 'OK',
      'now': SANTA_TAKEOFF + (1000 * 120) + 1,  // just 1ms after Sydney
    });
    assert.isAbove(stateJustAfterSydney.presentsDelivered, 146084997);

    // check while at takeoff
    const stateAtTakeoff = await stateDelayFrame({
      'status': 'OK',
      'now': 1000,  // at the Unix epoch
    });
    assert.equal(stateAtTakeoff.dests.length, 1);
    assert.isNull(stateAtTakeoff.prev);
    assert.equal(stateAtTakeoff.stopover.id, 'takeoff');
    assert.equal(stateAtTakeoff.presentsDelivered, 0);
    assert.equal(stateAtTakeoff.next.id, 'sydney');

    // check while at landing
    const santaAtLanding = await stateDelayFrame({
      'status': 'OK',
      'now': SANTA_TAKEOFF + (1000 * 240),   // exactly at arrival time
    });
    assert.equal(santaAtLanding.dests.length, 3);
    assert.equal(santaAtLanding.prev.id, 'sydney');
    assert.equal(santaAtLanding.stopover.id, 'landing');
    assert.equal(santaAtLanding.presentsDelivered, 7056276203);
    assert.isNull(santaAtLanding.next);

    // check range
    const range = await api.range();
    assert.deepEqual(range, {
      start: SANTA_TAKEOFF,
      end: SANTA_TAKEOFF + (1000 * 240),
    });
  });

  test('noroute', async () => {
    api.expect('info', undefined, {
      'status': 'OK',
      'now': SANTA_TAKEOFF - (1000 * 30),
    });

    const state = await stateDelayFrame();
    assert.isNull(state);

    const range = await api.range();
    assert.isNull(range);
  });

  test('location', async () => {
    api.userLocation = {
      'lat': -33,
      'lng': 151,
    };

    api.expect('info', undefined, {
      'status': 'OK',
      'route': `${TEST_BASEURL}/route.json`,
      'now': 0,
    });
    api.expect('route.json', null, TEST_ROUTE);

    const state = await stateDelayFrame();
    assert.isNotNull(state.userDestination);
    assert.equal(state.userDestination.id, 'sydney');

    // TODO(samthor): Test that location drift occurs over the user's location.
  });

  // TODO(samthor): Test stream, if it is even still relevant in 2018+.
});
