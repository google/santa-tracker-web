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

    this.innerElem = document.createElement('div')
    this.innerElem.setAttribute('class', `penguin__inner`)
    this.elem.appendChild(this.innerElem)

    this.animations = {}

    let sides = ['front', 'back', 'side']
    for (const side of sides) {
      this.animations[side] = game.loadAnimation(`img/penguin/${side}.json`, {
        loop: false,
        autoplay: false,
        renderer: 'svg',
        container: this.innerElem,
        rendererSettings: {
          className: `animation animation--${side}`
        },
      })
    }
  }

  onInit(config) {
    config.height = Constants.PENGUIN_HEIGHT
    config.width = Constants.PENGUIN_WIDTH

    this.animationFrame = Constants.PENGUIN_FRAMES.start
    this.lastAnimationFrame = null

    super.onInit(config)
  }

  onFrame(delta, now) {
    // update animationframe
    if (!this.lastAnimationFrame) {
      this.lastAnimationFrame = now
    }

    const {
      nextFrame,
      frameTime
    } = Utils.nextAnimationFrame(Constants.PENGUIN_FRAMES,
        this.animationFrame, true, this.lastAnimationFrame, now)

    console.log(nextFrame, frameTime)

    this.animationFrame = nextFrame
    this.lastAnimationFrame = frameTime

    super.onFrame()
  }

  render() {
    super.render()

    // detect direction
    this.animations['front'].renderer.svgElement.classList.add('is-active')

    // render animation
    this.animations['front'].goToAndStop(this.animationFrame, true)
  }

  onContact(player) {
    super.onContact(player)
    return [Constants.PLAYER_ACTIONS.RESTART]
  }
}

app.shared.pools.mixin(app.Penguin)
