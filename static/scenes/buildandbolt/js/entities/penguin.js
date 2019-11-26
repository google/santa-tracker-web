goog.provide('app.Penguin')

goog.require('Constants')

goog.require('app.Slider')
goog.require('app.shared.pools');
goog.require('Utils')

app.Penguin = class Penguin extends app.Slider {
  constructor(game, config) {
    super(game, config)

    document.getElementById('penguins').append(this.elem)
    this.elem.setAttribute('class', 'penguin')
    this.animations = {}

    let sides = ['front', 'back', 'side']

    for (const side of sides) {
      this.animations[side] = game.loadAnimation(`img/penguin/${side}.json`, {
        loop: false,
        autoplay: false,
        renderer: 'svg',
        container: this.elem,
        rendererSettings: {
          className: `animation animation--${side}`
        },
      })
    }
  }

  onInit(config) {
    config.height = Constants.PENGUIN_HEIGHT
    config.width = Constants.PENGUIN_WIDTH

    super.onInit(config)
  }

  onContact(player) {
    super.onContact(player)
    return [Constants.PLAYER_ACTIONS.RESTART]
  }
}

app.shared.pools.mixin(app.Penguin)
