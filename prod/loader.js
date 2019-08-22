import config from './config.json';

const entrypoint = document.createElement('script');
entrypoint.type = 'module';
entrypoint.src = config.staticScope + 'prod.js';

entrypoint.onload = () => {
  document.body.classList.remove('loading');
};
entrypoint.onerror = () => {
  throw new Error('error');
  window.location = 'error.html';
};

document.head.appendChild(entrypoint);