
// Safeguard sessionStorage in case a browser's Private mode prevents use.
export const sessionStorage = window.sessionStorage || {};

/**
 * Checks whether this is an Android TWA. Note that this has side-effects and persists this state
 * for the current session.
 *
 * @param {boolean=} force whether to force enable
 * @return {boolean} whether this is an Android TWA load
 */
export default function isAndroidTWA(force = false) {
  // NOTE: This detection may fail when the user swipes down and refreshes the page, so we
  //  should persist the state somehow, e.g., local storage or URL modification. See:
  //  https://stackoverflow.com/q/54580414
  if (sessionStorage['android-twa'] ||
      document.referrer.startsWith('android-app://com.google.android.apps.santatracker') ||
      force) {
    sessionStorage['android-twa'] = true;
    document.body.setAttribute('data-mode', 'android');
    return true;
  }

  return false;
}
