
function relativeTo(url, base=window.location) {
  return (new URL(url, base)).toString();
}

// nb. Fetches root path in prod.
const root = relativeTo(document.body.getAttribute('data-root') || '/', window.location);
export const SANTA_TRACKER_CONTROLLER_URL = relativeTo('src/app/controller.bundle.js', root);
