import { Bot } from '../entities/bot.js';

export class BotSystem {
  constructor() {
    this.botMap = {};
    this.bots = [];
    this.newBots = [];
    this.oldBots = [];
  }

  addBot() {
    const bot = new Bot();
    this.botMap[bot.id] = bot;
    this.newBots.push(bot);
  }

  removeBot(id) {
    const bot = this.botMap[id];
    this.oldBots.push(bot);
  }

  update(game) {
    while (this.newBots.length) {
      const bot = this.newBots.shift();
      this.botMap[bot.id] = bot;
      this.bots.push(bot);
      bot.setup(game);
    }

    while (this.oldBots.length) {
      const bot = this.oldBots.shift();
      const index = this.bots.indexOf(bot);
      this.bits.splice(index, 1);
      bot.teardown(game);
      delete this.botMap[bot.id];
    }

    for (let i = 0; i < this.bots.length; ++i) {
      const bot = this.bots[i];
      bot.update(game);
    }
  }
}
