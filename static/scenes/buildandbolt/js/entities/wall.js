goog.provide('app.Wall')

goog.require('Constants')

goog.require('app.Entity')
goog.require('Utils')

app.Wall = class Wall extends app.Entity {
  constructor(game, config) {
    super(game)
    this.config = config
    console.log('constructor')

    this.elem = document.createElement('div')
    document.getElementById('walls').append(this.elem)
    this.elem.setAttribute('class', 'wall')
    // this.render()
    // this.game.board.addEntityToBoard(this,
    //     this.config.x, this.config.y,
    //     this.config.width, this.config.height)
  }

  reset() {

  }

  onFrame() {

  }

  render() {
    this.elem.style.height = `${Utils.gridToPixelValue(this.config.height)}px`
    this.elem.style.width = `${Utils.gridToPixelValue(this.config.width)}px`
    Utils.renderAtGridLocation(this.elem, this.config.x, this.config.y)
  }

  onContact(player) {
    super.onContact(player)
    return [Constants.PLAYER_ACTIONS.BLOCK]
  }

  onInit(config) {
    console.log('oninit', config)
    this.config = config
    this.render()
    this.game.board.addEntityToBoard(this,
        this.config.x, this.config.y,
        this.config.width, this.config.height)
  }

  onDispose() {
    console.log('ondispose')
    this.elem.classList.add('hidden')
    // this.game.board.removeEntityFromBoard(this,
    //     this.config.x, this.config.y)
  }
}

app.shared.pools.mixin(app.Wall);
