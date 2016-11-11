goog.provide('Sharing');

goog.require('Blockly');
goog.require('Turtle');

var blockToInitial = {
'turtle_colour': 'c',
'pentagon_stamp': 'p',
'square_stamp': 's',
'triangle_stamp': 't',
'turtle_move_forward': 'f',
'turtle_move_backward': 'b',
'turtle_turn_left': 'l',
'turtle_turn_right': 'r',
'control_repeat': '<'
};

var initialToBlock = {
'p': '<block type="pentagon_stamp"><value name="SIZE"><shadow type="dropdown_pentagon"><field name="CHOICE">[VALUE]</field></shadow></value></block>',
'c': '<block type="turtle_colour"><value name="COLOUR"><shadow type="colour_picker"><field name="COLOUR">[VALUE]</field></shadow></value></block>',
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
			if(urlList[urlList.length - 1] == '>' || urlList[urlList.length - 1] == '<') {
				urlList.push('['+regexes['field'].exec(line)[1]+']');
			} else {
				urlList.push('['+regexes['field'].exec(line)[1]+']');
			}
		} else if (regexes['endLoop'].test(line)) {
			urlList.push('>');
		}
	}
	return urlList.join("");
};

Sharing.urlToWorkspace = function(string) {
	//get the starterblock
	//for each symbol, add a block to the thing.
	var workspace = Turtle.workspace;
	var starterConnection = this.getStarterBlock(workspace.getTopBlocks()).nextConnection;
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
	var letter = /[A-z]/;
	var value = /^\[([#?A-Za-z\d]+)\]/g;
	var outermostLoop = /^<(.+)>\[(\d+)\]/g;
	var currentConnection = starterConnection;
	var nextBlock;
	for (var i=0; i < string.length; i++) {
		var char = string[i];
		if (letter.test(char) && value.test(string.substring(i+1))) {
			var valueList = value.exec(string.substring(i+1));
			if (!valueList) {
				valueList = value.exec(string.substring(i+1));
			}
			var valueContent = valueList[1];
			nextBlock = this.makeBlockFromInitial(char, valueContent);
			this.setConnectingBlock(currentConnection, nextBlock.previousConnection);
			//i += value.length + 2;
		} else if (char == '<') {
			if (string[i+1] == '[') {
				//if the string is <[x], it's an empty loop.
				var valueList = value.exec(string.substring(i+1));
				if (!valueList) {
					valueList = value.exec(string.substring(i+1));
				}
				var valueContent = valueList[1];
				nextBlock = this.makeBlockFromInitial('empty-loop', valueContent);
				this.setConnectingBlock(currentConnection, nextBlock.previousConnection);
			} else {
				var loop = outermostLoop.exec(string.substring(i));
				nextBlock = this.makeLoopBlock(loop[1], loop[2]);
				this.setConnectingBlock(currentConnection, nextBlock.previousConnection);
				i += loop[0].length - 1;
			}
		}
		if (nextBlock && nextBlock.nextConnection) {
			currentConnection = nextBlock.nextConnection;
		}
	}
};

Sharing.makeBlockFromInitial = function (initial, value) {
	var xmlString = initialToBlock[initial].replace(/\[VALUE\]/, value);
	var xml = Blockly.Xml.textToDom(xmlString);
	return Blockly.Xml.domToBlock(xml, Turtle.workspace);
};

Sharing.setConnectingBlock = function(connection, nextConnection) {
	connection.connect(nextConnection);
};

Sharing.getStarterBlock = function(topBlocksList) {
	for (var i = 0; i < topBlocksList.length; i++) {
		if (topBlocksList[i]. type == "snowflake_start") {
			return topBlocksList[i];
		}
	}
};