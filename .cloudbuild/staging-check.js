#!/usr/bin/env node
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

/**
 * @fileoverview This file compares the current commit hash against the staging site. If they're
 * different, and no other build tasks are running, we kick off "staging-deploy".
 */

const { ErrorReporting } = require('@google-cloud/error-reporting');
const { CloudBuildClient } = require('@google-cloud/cloudbuild');
const { getDeployedVersion, getCurrentVersion } = require('../build/git-version.js');

const client = new CloudBuildClient();
const errors = new ErrorReporting();

// This is the trigger ID of "staging-deploy" for "santa-staging".
const deployTriggerId = 'd6401587-de8b-4507-ae71-bc516fdfc64a';

(async () => {
  const deployedVersion = await getDeployedVersion();
  const currentVersion = await getCurrentVersion();
  console.log(`version deployed="${deployedVersion}" local="${currentVersion}""`);

  if (deployedVersion && deployedVersion === currentVersion) {
    console.log(
      'The current and deployed versions are the same, not continuing build.'
    );
    return;
  }

  console.log(
    'The current and deployed versions are different, kicking off deploy build.'
  );

  // Check if there are any existing builds.
  const ret = client.listBuildsAsync({
    projectId: process.env.PROJECT_ID,
    pageSize: 1,
    filter: `trigger_id="${deployTriggerId}" AND (status="WORKING" OR status="QUEUED")`,
  });

  // This is an async iterable, check if we have at least one, if so, there's an active build.
  let activeBuild = false;
  for await (const _build of ret) {
    activeBuild = true;
    break;
  }
  if (activeBuild) {
    console.log(
      'There is a current active or queued build. Not starting another.'
    );
    return;
  }

  try {
    // This just waits for the build to be kicked off, not for its completion (it
    // returns a LROperation).
    await client.runBuildTrigger({
      projectId: process.env.PROJECT_ID,
      triggerId: deployTriggerId,
    });
  } catch (e) {
    errors.report(e);
  }
})();
