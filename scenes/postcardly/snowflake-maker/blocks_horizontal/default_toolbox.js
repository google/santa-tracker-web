/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2016 Massachusetts Institute of Technology
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

goog.provide('Blockly.Blocks.defaultToolbox');

goog.require('Blockly.Blocks');

/**
 * @fileoverview Provide a default toolbox XML.
 */

Blockly.Blocks.defaultToolbox = '<xml id="toolbox-categories" style="display: none">' +
    '   <block type="turtle_colour">' +
    '     <value name="COLOUR">' +
    '       <shadow type="dropdown_colour"></shadow>' +
    '     </value>' +
    '   </block>' +
    '   <block type="pentagon_stamp">' +
    '     <value name="SIZE">' +
    '       <shadow type="dropdown_pentagon">' +
    '         <field name="CHOICE">125</field>' +
    '       </shadow>' +
    '     </value>' +
    '   </block>' +
    '   <block type="square_stamp">' +
    '     <value name="SIZE">' +
    '       <shadow type="dropdown_square">' +
    '         <field name="CHOICE">125</field>' +
    '       </shadow>' +
    '     </value>' +
    '   </block>' +
    '   <block type="triangle_stamp">' +
    '     <value name="SIZE">' +
    '       <shadow type="dropdown_triangle">' +
    '         <field name="CHOICE">125</field>' +
    '       </shadow>' +
    '     </value>' +
    '   </block>' +
    '   <block type="turtle_move_forward">' +
    '     <value name="VALUE">' +
    '       <shadow type="dropdown_move_forward">' +
    '         <field name="CHOICE">20</field>' +
    '       </shadow>' +
    '     </value>' +
    '   </block>' +
    '   <block type="turtle_move_backward">' +
    '     <value name="VALUE">' +
    '       <shadow type="dropdown_move_backward">' +
    '         <field name="CHOICE">20</field>' +
    '       </shadow>' +
    '     </value>' +
    '   </block>' +
    '   <block type="turtle_turn_left">' +
    '     <value name="ANGLE">' +
    '       <shadow type="dropdown_turn_left">' +
    '         <field name="CHOICE">30</field>' +
    '       </shadow>' +
    '     </value>' +
    '   </block>' +
    '   <block type="turtle_turn_right">' +
    '     <value name="ANGLE">' +
    '       <shadow type="dropdown_turn_right">' +
    '         <field name="CHOICE">30</field>' +
    '       </shadow>' +
    '     </value>' +
    '   </block>' +
        '<block type="control_repeat">' +
        '<value name="TIMES">' +
        '<shadow type="math_whole_number">' +
        '<field name="NUM">4</field>' +
        '</shadow>' +
        '</value>' +
        '</block>' +
    '</xml>';
