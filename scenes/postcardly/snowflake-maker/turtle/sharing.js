goog.provide('Sharing');

goog.require('Blockly');
goog.require('Turtle');


Sharing.HEX_COLOR_REGEX = /^#([0-9a-f]{3}){1,2}$/i;

// Constants for loop start and end.
Sharing.LOOP_START = '(';
Sharing.LOOP_END = ')';

var blockToInitial = {
'turtle_colour': 'c',
'pentagon_stamp': 'p',
'square_stamp': 's',
'triangle_stamp': 't',
'turtle_move_forward': 'f',
'turtle_move_backward': 'b',
'turtle_turn_left': 'l',
'turtle_turn_right': 'r',
'control_repeat': Sharing.LOOP_START
};

var initialToBlock = {
'p': '<block type="pentagon_stamp"><value name="SIZE"><shadow type="dropdown_pentagon"><field name="CHOICE">[VALUE]</field></shadow></value></block>',
'c': '<block type="turtle_colour"><value name="COLOUR"><shadow type="dropdown_colour"><field name="CHOICE">[VALUE]</field></shadow></value></block>',
's': '<block type="square_stamp"><value name="SIZE"><shadow type="dropdown_square"><field name="CHOICE">[VALUE]</field></shadow></value></block>',
't': '<block type="triangle_stamp"><value name="SIZE"><shadow type="dropdown_triangle"><field name="CHOICE">[VALUE]</field></shadow></value></block>',
'f': '<block type="turtle_move_forward"><value name="VALUE"><shadow type="dropdown_move_forward"><field name="CHOICE">[VALUE]</field></shadow></value></block>',
'b': '<block type="turtle_move_backward"><value name="VALUE"><shadow type="dropdown_move_backward"><field name="CHOICE">[VALUE]</field></shadow></value></block>',
'l': '<block type="turtle_turn_left"><value name="ANGLE"><shadow type="dropdown_turn_left"><field name="CHOICE">[VALUE]</field></shadow></value></block>',
'r': '<block type="turtle_turn_right"><value name="ANGLE"><shadow type="dropdown_turn_right"><field name="CHOICE">[VALUE]</field></shadow></value></block>',
'empty-loop': '<block type="control_repeat"><value name="TIMES"><shadow type="math_whole_number"><field name="NUM">[VALUE]</field></shadow></value></block>',
};

Sharing.workspaceToUrl = function() {
  var text = Blockly.Xml.domToPrettyText(Blockly.Xml.workspaceToDom(Turtle.workspace));
  var textList = text.split("\n");
  textList = textList.slice(3, -1);
  var urlList = [];
  var regexes = {
    'block': /^\s*<block type="([A-z\_]+)" id=".+">$/,
    'value': /^\s*<value/,
    'field': /^\s*<field name="[A-z]+">(.+)<\/field>$/,
    'endLoop': /^\s*<\/statement>$/,
  };
  for (var i = 0; i < textList.length; i++) {
    var line = textList[i];
    if (regexes['block'].test(line)) {
      var match = regexes['block'].exec(line);
      urlList.push(blockToInitial[match[1]]);
    } else if (regexes['field'].test(line)) {
      urlList.push('['+regexes['field'].exec(line)[1]+']');
    } else if (regexes['endLoop'].test(line)) {
      urlList.push(Sharing.LOOP_END);
    }
  }
  return urlList.join("");
};

Sharing.urlToWorkspace = function(string) {
  //get the starterblock
  //for each symbol, add a block to the thing.
  var workspace = Turtle.workspace;
  var starterConnection = Turtle.getStarterBlock().nextConnection;
  if (starterConnection.targetBlock() != null) {
    starterConnection.targetBlock().dispose();
  }
  this.stringToBlocks(starterConnection, string);
};

Sharing.makeLoopBlock = function(string, times) {
  var starterBlock = this.makeBlockFromInitial('empty-loop', times);
  var connection = starterBlock.inputList[0].connection;
  this.stringToBlocks(connection, string);
  return starterBlock;
};

Sharing.stringToBlocks = function(starterConnection, string) {
  var validLetters = ['f', 'b', 'l', 'r', 's', 'p', 't', 'c'];
  var currentConnection = starterConnection;
  var nextBlock;
  for (var i=0; i < string.length; i++) {
    var char = string[i];
    if (validLetters.includes(char) && string[i+1] == '[') {
      var valueContent = Sharing.getFirstValue(string.substring(i + 1));
      nextBlock = this.makeBlockFromInitial(char, valueContent);
      this.setConnectingBlock(currentConnection, nextBlock.previousConnection);
    } else if (char == Sharing.LOOP_START) {
      if (string[i+1] == '[') {
        //if the string is <[x], it's an empty loop.
        var valueContent = Sharing.getFirstValue(string.substring(i + 1));
        nextBlock = this.makeBlockFromInitial('empty-loop', valueContent);
        this.setConnectingBlock(currentConnection, nextBlock.previousConnection);
      } else {
        var loop = Sharing.getOutermostLoop(string.substring(i));
        nextBlock = this.makeLoopBlock(loop[0], loop[1]);
        this.setConnectingBlock(currentConnection, nextBlock.previousConnection);
        i += loop[0].length - 1;
      }
    }
    if (nextBlock && nextBlock.nextConnection) {
      currentConnection = nextBlock.nextConnection;
    }
  }
};

Sharing.getOutermostLoop = function(string) {
  var loop = [];
  var numLoopsOpen = 1;
  var value;
  for (var i=1; i < string.length; i++) {
    if (string[i] == Sharing.LOOP_START && string[i+1] != '[') {
      numLoopsOpen += 1;
    } else if (string[i] == Sharing.LOOP_END) {
      numLoopsOpen -= 1;
    }
    loop.push(string[i]);
    if (numLoopsOpen == 0) {
      // Remove the last end loop.
      loop.pop(loop.length - 1);
      value = Sharing.getFirstValue(string.substring(i));
      return [loop.join(""), value];
    }
  }
};

Sharing.getFirstValue = function(string) {
  var bracesCharString = Sharing.LOOP_START + Sharing.LOOP_END + '[]';
  var value = [];
  for (var i=0; i < string.length; i++) {
    if (string[i] == ']') {
      return parseInt(value.join('')) || value.join('');
    } else if (!bracesCharString.includes(string[i])) {
      // We haven't reached the start or end of this block's values.
      value.push(string[i]);
    }
  }
}

Sharing.makeBlockFromInitial = function (initial, value) {
  var validatedValue = Sharing.validateBlockValue(initial, value);
  var xmlString = initialToBlock[initial].replace(/\[VALUE\]/, validatedValue);
  var xml = Blockly.Xml.textToDom(xmlString);
  return Blockly.Xml.domToBlock(xml, Turtle.workspace);
};

/**
 * Returns a sanitized block value based on the initial.  For example,
 * shape blocks can only have sizes between 20 and 200.  This allows values
 * that we cannot choose dropdown values for and relies on the block definition
 * to show a valid image/choice in dropdown menus even if it does not match.
 * @param {string} initial String representing which block type to validate a
 * value for. Each block has only one value input.
 * @param {string} value The input value to validate.
 * @return {string|number} A valid value for a block parameter. For color
 * blocks this will be a hex string or 'random'; for shape, turn, and repeat
 * blocks this will be a number in the valid range.
 */
Sharing.validateBlockValue = function(initial, value) {
  var validValue = null;
  switch(initial) {
    // Shape blocks. Dropdown values: 25, 45, 65, 85, 105, 125.
    case 'p':
    case 's':
    case 't':
      validValue = parseInt(value);
      if (!validValue || validValue < 25 || validValue > 125) {
        validValue = 125;
      }
      break;
    // Forward/backward blocks. Dropdown values 10, 20, 30.
    case 'f':
    case 'b':
      validValue = parseInt(value);
      if (!validValue || validValue < 10 || validValue > 30) {
        validValue = 20;
      }
      break;
    // The left right blocks. Dropdown values 30, 60, 90, 120, 150, 180.
    case 'l':
    case 'r':
      validValue = parseInt(value);
      if (!validValue || validValue < 30 || validValue > 180) {
        validValue = 30;
      }
      break;
    // Color block. Accept any hex color and set to random if not valid.
    case 'c':
      var match = Sharing.HEX_COLOR_REGEX.exec(value);
      if (match && match[0]) {
        validValue = match[0]; 
      } else {
        validValue = 'random';
      }
      break;
    // 'empty-loop' appears to be the initial for all loops.
    case 'empty-loop':
      validValue = parseInt(value);
      if (!validValue || validValue < 0 || validValue > 100) {
        validValue = 4; //set back to default.
      }
      break;
    default:
      // This should not happen...
      validValue = 0;
      break;
  }
  return validValue;
};

Sharing.setConnectingBlock = function(connection, nextConnection) {
  connection.connect(nextConnection);
};
