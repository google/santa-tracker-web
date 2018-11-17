import {Controller} from '@polymer/broadway/lib/controller';
import {logger} from '@polymer/broadway/lib/logger';
import {createStore} from 'redux/es/redux.mjs';  // package.json doesn't export mjs as module

import {SantaAPI} from '../api/santaapi.js';

import {SantaTrackerAction} from './action.js';
import {santaTrackerReducer} from './reducer/santa-tracker.js';

logger.enabled = false;

class SantaTrackerController extends Controller {
  static get initialState() {
    return {
      activeScene: null,
      selectedScene: null,  // nothing loaded until we're asked
      loadAttempt: 0,
      loadProgress: 1,
      showError: false,
      showSidebar: false,
      todayHouse: 'boatload',
      pageVisible: undefined,
      online: undefined,
      api: null,
    };
  }

  constructor() {
    super();

    const santaTrackerStore = createStore(santaTrackerReducer, SantaTrackerController.initialState);

    // Subscribe to state changes from the Redux store, and update
    // the Controller's state, which will notify Adapters:
    this.storeSubscription = santaTrackerStore.subscribe(() => {
      this.updateState(santaTrackerStore.getState());
    });

    // Subscribe to actions from the Controller. These always come from one
    // of the UI frames:
    this.actionSubscription = this.subscribe((action) => {
      // For now, actions can just be dispatched directly to the
      // store. Eventually, we may want to map the actions to
      // action creators, which are functions that should be invoked
      // with the dispatch function as one of their arguments.
      console.warn('Dispatching action', action);
      santaTrackerStore.dispatch(action);
    });

    const santaApi = new SantaAPI(
        'https://next-santa-api.appspot.com',
        'web',
        // TODO(cdata): How do we communicate the language to the worker?
        // document.documentElement.lang,
        'en-US',
        // TODO(cdata): How do we communicate the version to the worker?
        // document.body.getAttribute('data-version')
        null);

    Promise.resolve().then(() => santaApi.sync());
    // TODO(cdata): Somehow proxy this information to the worker...
    // window.addEventListener('online', () => santaApi.sync());

    santaApi.addEventListener('sync', (ev) => {
      const p = (async () => {
        const [now, state, range] =
            await Promise.all([santaApi.now, santaApi.state(), santaApi.range()]);

        santaTrackerStore.dispatch(
            {type: SantaTrackerAction.API_SYNC_COMPLETED, payload: {now, state, range}});
      })();

      p.catch((err) => {
        logger.warn('Error syncing', err);
      });
    });
  }
}

self.santaTrackerController = new SantaTrackerController();
