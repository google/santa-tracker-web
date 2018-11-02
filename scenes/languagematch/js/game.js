goog.provide('app.Game');

/**
 * @export
 */
app.Game = class Game {
  constructor(elem) {
    console.info(`Language game starting`);

    const cards = elem.getElementsByClassName('card');
    for (const card of cards) {
      card.addEventListener('click', () => {
        card.classList.toggle('flipped');
      });
    }
  }

};
