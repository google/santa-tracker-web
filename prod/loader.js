import config from './config.json';

// In prod, the documentElement has `lang="en"` or similar.
const documentLang = document.documentElement.lang || null;
const isProd = (documentLang !== null);

const entrypoint = document.createElement('script');
entrypoint.type = 'module';
entrypoint.src = config.staticScope + (isProd ? `${actualLang}_` : '') + 'entrypoint.js';

entrypoint.onload = () => {
  document.body.classList.remove('loading');
};
entrypoint.onerror = () => {
  throw new Error('error');
  window.location = 'error.html';
};

document.head.appendChild(entrypoint);