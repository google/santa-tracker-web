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
 * WRLLoader class
 */
class WRLLoader {
    /**
     * load method
     * @returns {Promise}
     */
    load(path) {
        const xhr = new XMLHttpRequest();

        return new Promise((resolve, reject) => {
            xhr.open('GET', path);
            xhr.addEventListener('readystatechange', () => {
                // console.log('xhr')
                if (xhr.readyState === XMLHttpRequest.DONE && xhr.status === 200) {
                    this.parse(xhr.responseText, resolve, reject);
                }
            });
            xhr.send(null);
        });
    }

    /**
     * parse method
     * @param string
     * @param resolve
     * @param reject
     */
    parse(string, resolve, reject) {
        const groups = [];
        const shapes = string.split('Shape');
        shapes.shift();

        for (let i = 0; i < shapes.length; i++) {
            const vertices = [];
            const faces = [];

            let points = shapes[i].split('point [');
            let coordIndexs = shapes[i].split('coordIndex [');

            points.shift();
            coordIndexs.shift();

            let indexA = points[0].indexOf(']');
            let indexB = coordIndexs[0].indexOf(']');

            points = points[0].slice(0, indexA);
            coordIndexs = coordIndexs[0].slice(0, indexB);

            points = points.split(' ').filter(function(entry) {
                return /\S/.test(entry);
            });
            coordIndexs = coordIndexs.split(' ').filter(function(entry) {
                return /\S/.test(entry) && entry.trim() != '-1,';
            });

            for (let p = 0; p < points.length; p++) {
                let point = points[p];
                let lastIndex = point[point.length-1];

                if (point[lastIndex] == ',') {
                    point = point.slice(0, lastIndex);
                }

                vertices.push(parseInt(point));
            }

            for (let c = 0; c < coordIndexs.length; c++) {
                let coordIndex = coordIndexs[c];
                let lastIndex = coordIndex[coordIndex.length-1];

                if (coordIndex[lastIndex] == ',') {
                    coordIndex = coordIndex.slice(0, lastIndex);
                }

                faces.push(parseInt(coordIndex));
            }

            groups.push({vertices, faces});

        }

        resolve(groups);
    }
}

export default WRLLoader
