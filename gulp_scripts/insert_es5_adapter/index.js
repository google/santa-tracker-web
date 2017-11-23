// Insert the Custom Elements ES5 Adapter into a JSDom document
// @see https://github.com/webcomponents/webcomponentsjs#custom-elements-es5-adapterjs
// @see https://github.com/webcomponents/webcomponentsjs/blob/master/custom-elements-es5-adapter.js
module.exports = (document, staticUrl) => {
  const cursor = document.head.querySelector('#ES5_ADAPTER');

  if (cursor == null) {
    return;
  }

  const conditionScript = document.createElement('script');
  conditionScript.textContent =
      `if (!window.customElements) { document.write('<!--') }`;
  const adapterScript = document.createElement('script');
  adapterScript.setAttribute('src',
      `${staticUrl}components/webcomponentsjs/custom-elements-es5-adapter.js`);
  const meaningfulComment = document.createComment('!do not remove');

  document.head.insertBefore(conditionScript, cursor);
  document.head.insertBefore(adapterScript, cursor);
  document.head.insertBefore(meaningfulComment, cursor);

  document.head.removeChild(cursor);
};
