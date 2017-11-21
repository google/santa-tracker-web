import { SeedRandom } from '../utils/seed-random.js';

export class NetworkSystem {
  setup(game) {
    const { clientSystem } = game;
    const { clientId } = clientSystem;

    this.globalResetState = null;
    this.pendingUpdateState = [];

    this.socket = null;  // set by caller
  }

  post(payload, coalesce) {
    if (this.socket) {
      this.socket.post(payload, coalesce);
    }
  }

  postMove(from, to) {
    this.post({
      op: 'move',
      path: [from, to],
    });
  }
  postTargetedPosition(targetedPosition) {
    this.post({
      op: 'target',
      target: targetedPosition,
    });
  }

  update(game) {
    const { mapSystem, dropSystem, clientSystem, playerSystem } = game;

    if (this.pendingResetState) {
      const s = this.pendingResetState;

      // TODO(samthor): This should only happen once, but this isn't yet controlled.
      // e.g. triggering a reconnect causes snowballs to hit the own player.

      mapSystem.rebuildMap(game, s.seed);
      for (let erode = 0; erode < s.erode; ++erode) {
        mapSystem.map.erode();
      }

      Object.keys(s.players).forEach((id) => {
        const playerState = s.players[id];
        const index = this._indexFor(game, playerState.joinTick, playerState.at);
        const player = playerSystem.addPlayer(id, index);

        if (id === this.socket.playerId) {
          clientSystem.assignPlayer(player);
        }
      });
    }
    this.pendingResetState = null;

    this.pendingUpdateState.forEach((update) => {
      const { mapSystem, playerSystem, clientSystem } = game;
      const { state, tick } = update;

      if (state.op === 'join') {
        playerSystem.addPlayer(state.id, this._indexFor(game, tick, null));
      }
      const player = state.id ? playerSystem.getPlayer(state.id) : null;

      switch (state.op) {
      case 'erode':
        mapSystem.map.erode();
        break;

      case 'join':
        break;

      case 'part':
        playerSystem.removePlayer(state.id);
        break;

      case 'move':
        if (player.health.dead) {
          // server clearly believes we're alive
          player.health.dead = false;
        }
        const lastPath = state.path[state.path.length - 1];
        const destination = {
          position: lastPath,
          index: mapSystem.grid.positionToIndex(lastPath),
        };
        playerSystem.assignPlayerDestination(state.id, destination);
        break;

      default:
        console.info('got unhandled update at tick', tick, state);
      }
    });
    this.pendingUpdateState = [];
  }

  _indexFor(game, tick, position) {
    const { mapSystem } = game;
    if (position != null) {
      return mapSystem.grid.positionToIndex(position);
    }
    const random = new SeedRandom(tick);
    return mapSystem.map.getRandomHabitableTileIndex(random);
  }

  resetState(tick, state) {
    // `state` contains {seed: number, erode: number, players: {...}}.
    // It's documented in the relay server, and represents the current state at this server `tick`:
    //   https://github.com/santatracker/relay/blob/master/gce/game/snowball/state.go

    // nb. `tick` is the server tick this state is from; it's not yet used, but could be in future
    this.pendingResetState = state;
  }

  updateState(tick, state) {
    // `state` can be a number of things, but conatins at least {op: string, id: string, ...}.
    // It's documented in the relay server, and is a single operation, possibly user-generated— if
    // so, the `id` field is set to the originating player.
    //   https://github.com/santatracker/relay/blob/master/gce/game/snowball/impl.go#L57
    this.pendingUpdateState.push({state, tick});
  }

};
