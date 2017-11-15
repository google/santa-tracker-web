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
        const ps = s.players[id];
        const player = playerSystem.addPlayer(id, this._indexFor(game, ps.joinTick, ps.at));

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
    this.pendingResetState = state;
  }

  updateState(tick, state) {
    this.pendingUpdateState.push({state, tick});
  }

};
