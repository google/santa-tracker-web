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

goog.provide('Card');

/**
 * All the data associated with a card.
 * @export
 * @record
 */
var Card = class {

  constructor() {
    this.flipped = false;
    this.matched = false;
    /** Language that this card represents. Used for matching. */ 
    this.languageCode = false;
    this.content = '';
    /**
     * Language of the card's content. Translations are in the language of the
     * translation, but the language names are in the user's language.
     */
    this.contentLanguage = '';
    this.backgroundColor = '';
    this.textColor = '';
  }

}