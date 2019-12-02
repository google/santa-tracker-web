
/**
 * Is this an Android TWA?
 *
 * @return {boolean}
 */
export default function isAndroid() {
  return document.body.getAttribute('data-mode') === 'android';
}
