/*
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
 * WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
 * License for the specific language governing permissions and limitations under
 * the License.
 */

module.exports = {
  changedFlag: require('./changed_flag'),
  crisper: require('./crisper'),
  devScene: require('./dev-scene'),
  fileManifest: require('./file_manifest'),
  i18nManifest: require('./i18n_manifest'),
  i18nReplace: require('./i18n_replace'),
  mutateHTML: require('./mutate_html'),
  styleModules: require('./style_modules'),
};
