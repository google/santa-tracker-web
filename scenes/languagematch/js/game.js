goog.provide('app.Game');

app.Game = class Game {
  constructor(elem) {
    console.info(`Language game starting`);

    const cards = elem.getElementsByClassName('card');
    for (let i = 0; i < cards.length; i ++) {
      const card = cards[i];
      card.addEventListener('click', () => {
        card.classList.toggle('flipped');
      })
    }
  }

};
