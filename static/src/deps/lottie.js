import {join} from '../lib/url.js';

let cachedLoad;

export default function load() {
  // If we're already loaded for some reason (<script> on page) then go ahead.
  if (window.lottie) {
    return window.lottie;
  } else if (cachedLoad) {
    return cachedLoad;
  }

  cachedLoad = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = join(import.meta.url, '../../third_party/lib/lottie/lottie.min.js');
    script.onload = () => resolve(window.lottie);
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return cachedLoad;
}