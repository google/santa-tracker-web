import {html, LitElement} from '@polymer/lit-element';
import {ifDefined} from 'lit-html/directives/if-defined';

const WINS = Object.freeze([7, 56, 448, 73, 146, 292, 273, 84]);
const SHOW_LINE_TIME = 1000;
const RESTART_GAME_TIME_MIN = 10 * 1000;
const RESTART_GAME_TIME_MAX = 60 * 1000;

const delay = (ms) => new Promise((r) => window.setTimeout(r, ms));

export class TicTacToeElement extends LitElement {
  static get properties() {
    return {
      isPlaying: {type: Boolean},
      turn: {type: Boolean},
      redScore: {type: Number},
      blueScore: {type: Number},
      winClass: {type: String},
    };
  }

  constructor() {
    super();

    this.playInterval_;
    this.cellsAvailable_ = [];
    this.cells_ = [];
    this.timers_ = [];
  }

  connectedCallback() {    
    window.setTimeout(() => {
      this.play_();
    }, 1000);
  }

  play_() {
    if (!this.isPlaying || !this.cellsAvailable_.length) {
      this.isPlaying = true;

      // Setup a new game
      this.redScore = 0;
      this.blueScore = 0;

      this.turn = Boolean(Math.random() >= .5);

      this.winClass = '';
      this.redPlayer_ = this.shadowRoot.querySelector('#elves-red');
      this.bluePlayer_ = this.shadowRoot.querySelector('#elves-blue');
      this.redPlayer_.className = 'elves';
      this.bluePlayer_.className = 'elves';

      this.cells_ = Array.from(this.shadowRoot.querySelectorAll('.cell'));
      this.cells_.forEach(cell => cell.className = 'cell empty');
      this.cellsAvailable_ = Array.from(this.cells_);
    }

    // Random is the best AI....
    const rnd = Math.floor(Math.random() * this.cellsAvailable_.length);
    const cell = this.cellsAvailable_.splice(rnd, 1).pop();
    const idx = this.cells_.indexOf(cell);

    this.playCell_(idx, cell);
  }

  /**
   * 
   * @param {string} player 
   * @param {number} w 
   */
  async showWin_(player, w) {
    this.isPlaying = false;

    console.log('show win for', player, w);

    await delay(SHOW_LINE_TIME);
    this.winClass = `${player} pos-${w}`;

    const restartTime = RESTART_GAME_TIME_MIN +
        Math.random()* (RESTART_GAME_TIME_MAX - RESTART_GAME_TIME_MIN);
    await delay(restartTime);

    this.winClass = '';
    this.play_();
  }

  /** 
   * @param {number} score
  */
  checkWin_(score) {
    for (let i = 0; i < WINS.length; ++i) {
      if ((WINS[i] & score) === WINS[i]) {
        return i;
      }
    }
    return false;
  }

  /**
   * @param {number} index
   * @param {!Element} cell}
   * @private 
   */
  async playCell_(index, cell) {
    console.log('play cell', index, cell);
    const moveTime = 500;
    const drawTime = 200;
    const doneDrawTime = 500;
    const moveBackTime = 500;
    const playAgainTime = 1000;
    const posClass = `to-pos-${index + 1}`;

    const player = this.turn ? this.redPlayer_ : this.bluePlayer_;

    player.classList.add(posClass);
    await delay(moveTime);

    player.classList.add('draw');
    await delay(drawTime);

    cell.classList.add(this.turn ? 'red' : 'blue');
    cell.classList.remove('empty');
    await delay(doneDrawTime);

    player.classList.remove('draw');
    player.classList.remove(posClass);
    await delay(moveBackTime);

    if (this.turn) {
      this.redScore += (1 << index);
      var w = this.checkWin_(this.redScore);
      if (w !== false) {
        this.showWin_('red', w);
        return;
      }
    } else {
      this.blueScore += (1 << index);
      var w = this.checkWin_(this.blueScore);
      if (w !== false) {
        this.showWin_('blue', w);
        return;
      }
    }

    if (!this.cellsAvailable_.length) {
      // Draw
      //TODO, hook up ga? Is it still done like this?
      //window.ga('send', 'event', 'village', 'tic-tac', 'draw', {nonInteraction: true});
    }

    this.turn = !this.turn;

    await delay(playAgainTime);
    this.play_();
  }

  update(changedProperties) {
    super.update(changedProperties);
  }

  render() {
    return html`
    <style>${_style`tictactoe`}</style>
    <div>
      <div class="cell empty"></div>
      <div class="cell empty"></div>
      <div class="cell empty"></div>
      <div class="cell empty"></div>
      <div class="cell empty"></div>
      <div class="cell empty"></div>
      <div class="cell empty"></div>
      <div class="cell empty"></div>
      <div class="cell empty"></div>
    </div>
    <div id="elves-red" class="elves"></div>
    <div id="elves-blue" class="elves"></div>
    <div id="win" class="${this.winClass}"></div>
    `;
  }
}

customElements.define('tic-tac-toe', TicTacToeElement);
