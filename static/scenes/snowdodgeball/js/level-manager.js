import { Levels } from './constants.js';

export class LevelManager {
    constructor() {
        this.currentLevelIndex = 0;
    }

    getCurrentLevel() {
        return Levels[this.currentLevelIndex];
    }

    getCurrentLevelNumber() {
        return this.currentLevelIndex + 1;
    }

    hasNextLevel() {
        return this.currentLevelIndex < Levels.length - 1;
    }

    nextLevel() {
        if (this.hasNextLevel()) {
            this.currentLevelIndex++;
            return true;
        }
        return false;
    }

    reset() {
        this.currentLevelIndex = 0;
    }
}
