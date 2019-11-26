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
    this.animations = this.game.animations['penguin']

    // let anim = game.loadAnimation('img/players/a/front.json', {
    //   loop: true,
    //   autoplay: true,
    //   clearDefs: true,
    // })

    // console.log(this.elem, anim.renderer.svgElement)

    // this.elem.appendChild(this.animations['front'].renderer.svgElement)
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
