/**
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


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
