let ls;

try {
  // We need to catch this because Chrome might be throwing a security error.
  ls = window.localStorage;
} catch (e) {
  ls = {};
}

export const localStorage = ls;