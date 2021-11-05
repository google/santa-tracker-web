/**
 * Copyright 2021 Google LLC
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

const git = require('git-last-commit');
const { default: fetch } = require('node-fetch');

/**
 * @returns {Promise<string>}
 */
const getDeployedVersion = async () => {
  const text = await fetch('https://santa-staging.appspot.com/hash')
    .then((res) => (res.ok ? res.text() : ''));
  // This looks like "git_hash:build_version", e.g., "ab123141f1e:v20211123...", and we only want
  // the git hash on the left.
  return text.split(':')[0];
};

/**
 * @return {Promise<string>}
 */
const getCurrentVersion = () => {
  return new Promise((resolve) => {
    git.getLastCommit((err, commit) => {
      if (err) {
        console.warn(`Could not retrieve current git revision`, err)
      }
      resolve(commit && commit.hash || '');
    });
  });
};

module.exports = {
  getDeployedVersion,
  getCurrentVersion,
};
