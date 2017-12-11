export class StateSystem {
  get hasCurrentPopulation() {
    return this.population &&
        this.population.present > -1 &&
        this.population.maximum > -1;
  }

  recordPlayerConnected() {
    this.population.allTime++;
    this.population.present++;
  }

  recordPlayerDisconnected() {
    if (this.population.present > 0) {
      this.population.present--;
    }
  }

  recordPlayerKnockedOut() {
    this.population.knockedOut++;
  }

  finishMatch(tick, winner = null) {
    this.matchFinished = true;
    this.matchFinishTick = tick;
    this.winner = winner;
  }

  setup(game) {
    this.winner = null;
    this.matchFinished = false;
    this.matchFinishTick = -1;
    this.population = {
      // Total number of clients that ever connected to the game:
      allTime: 0,
      // Total number of living players:
      present: -1,
      // Maximum players allowed in an instance:
      maximum: game.maximumPlayers != null ? game.maximumPlayers : 1,
      // Total number of non-living players:
      knockedOut: 0
    };
  }

  update(game) {
    const { playerSystem, tick } = game;
    const { players } = playerSystem;

    let lastLivingPlayer = null;
    let livingPlayerCount = 0;

    for (let i = 0; i < players.length; ++i) {
      const player = players[i];
      const { health } = player;

      if (health.dead) {
        continue;
      }

      lastLivingPlayer = player;
      livingPlayerCount++;
    }

    if (livingPlayerCount < 2) {
      this.finishMatch(tick, lastLivingPlayer);
    }
  }
};
