goog.provide('app.GameManager')

goog.require('Constants')

app.GameManager = {
  _instance: null,
  get instance() {
    if (!this._instance) {
      this._instance = {
        // singletonMethod() {
        //   return 'singletonMethod';
        // },

        _players: [],

        get players() {
          return this._players
        },

        set players(value) {
          this._players.push(value)
        }
      };
    }
    return this._instance;
  }
}
