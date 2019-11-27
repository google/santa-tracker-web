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

    super.onInit(config)

    this.animationFrame = Constants.PENGUIN_FRAMES.start
    this.lastAnimationFrame = null

    if (this.config.isVertical) {
      this.animations['side'].renderer.svgElement.classList.remove('is-active')
      this.animationDirection = 'front'
    } else {
      this.animations['front'].renderer.svgElement.classList.remove('is-active')
      this.animations['back'].renderer.svgElement.classList.remove('is-active')
      this.animationDirection = 'side'
    }
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

    this.animationFrame = nextFrame
    this.lastAnimationFrame = frameTime

    super.onFrame()
  }

  render() {
    super.render()

    // handle direction change this frame
    if (this.flipped) {
      if (this.config.isVertical) {
        if (this.reversing) {
          this.animationDirection = 'back'
          this.animations['front'].renderer.svgElement.classList.remove('is-active')
        } else {
          this.animationDirection = 'front'
          this.animations['back'].renderer.svgElement.classList.remove('is-active')
        }
      } else {
        if (this.reversing) {
          this.innerElem.classList.add('is-flipped')
        } else {
          this.innerElem.classList.remove('is-flipped')
        }
      }
    }

    // render animation
    this.animations[this.animationDirection].renderer.svgElement.classList.add('is-active')
    this.animations[this.animationDirection].goToAndStop(this.animationFrame, true)
  }

  onContact(player) {
    super.onContact(player)
    return [Constants.PLAYER_ACTIONS.RESTART]
  }
}

app.shared.pools.mixin(app.Penguin)
