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

import api from '../../src/scene/api.js';
import Accordion from './js/accordion.js';
import { rectify } from '../../src/scene/route.js';

rectify(document.body);  // nb. Accordion does this to itself
new Accordion(document.querySelector('[data-familyguide-accordion]'));

api.ready(async () => {

});