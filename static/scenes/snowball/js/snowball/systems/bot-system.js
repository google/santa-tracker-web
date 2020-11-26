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

import { Bot } from '../entities/bot.js';

export class BotSystem {
  constructor() {
    this.botMap = {};
    this.bots = [];
    this.newBots = [];
    this.oldBots = [];
  }

  teardown(game) {}

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
