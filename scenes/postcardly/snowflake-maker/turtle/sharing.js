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
'empty-loop': '<block type="control_repeat"></block><value name="TIMES"><shadow type="math_whole_number"><field name="NUM">[VALUE]</field></shadow></value>',
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
	this.stringToBlocks(starterConnection, string);
};

Sharing.makeLoopBlock = function(string, times) {
	var starterBlock = this.makeBlockFromInitial('empty-loop', times);
	this.stringToBlocks(starterBlock, string)
	return starterBlock;
};

Sharing.stringToBlocks = function(starterConnection, string) {
	var letter = /[A-z]/;
	var value = /^\[([#?A-Za-z\d]+)\]/g;
	var outermostLoop = /^<.+>\[(\d+)\]/g;
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
				nextBlock = this.makeLoopBlock(loop[0], loop[1]);
				this.setConnectingBlock(currentConnection, nextBlock.previousConnection);
				i += loop[0].length;
			}
		}
		if (nextBlock && nextBlock.nextConnection) {
			currentConnection = nextBlock.nextConnection;
		}
	}
};

// https://regex101.com/delete/G3UUWvVPrBGUqikscv6KP1Jm
// https://regex101.com/r/S2lk09/1

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
/**
c[#d32ee0]*p[125]*<s[125]*t[125]*f[20]*<[4]*>[4]*l[30]*b[20]*r[30]*
*/

/**

"<xml xmlns="http://www.w3.org/1999/xhtml">
  <block type="snowflake_start" id=",K=6oHbO8^`8}8LMX8Ta" deletable="false" movable="false" x="0" y="234">
    <next>
      <block type="turtle_colour" id="2|U+hJDZHNjC)Vpe~lDE">
        <value name="COLOUR">
          <shadow type="colour_picker" id="qhJS{7.}oay^010eba.M">
            <field name="COLOUR">#d32ee0</field>
          </shadow>
        </value>
        <next>
          <block type="pentagon_stamp" id="O-^8vf(Tf.|PQD21P}tH">
            <value name="SIZE">
              <shadow type="dropdown_pentagon" id="r(x:wFmG;Bsq`.Njhiv8">
                <field name="CHOICE">125</field>
              </shadow>
            </value>
            <next>
              <block type="control_repeat" id="`;B_}d0ap7PNn8G6/PlR">
                <statement name="SUBSTACK">
                  <block type="square_stamp" id="=jYWQi=;:a,v8WfSgP8C">
                    <value name="SIZE">
                      <shadow type="dropdown_square" id="Fc1ID;r%n,R8pCQqKhGj">
                        <field name="CHOICE">125</field>
                      </shadow>
                    </value>
                    <next>
                      <block type="triangle_stamp" id="[*SAei:Ec4VebE7Eo;p.">
                        <value name="SIZE">
                          <shadow type="dropdown_triangle" id="}#Btj%JX!lrq#9lJT:CQ">
                            <field name="CHOICE">125</field>
                          </shadow>
                        </value>
                        <next>
                          <block type="turtle_move_forward" id=")?|)UKKv52A]mX9q!`)T">
                            <value name="VALUE">
                              <shadow type="dropdown_move_forward" id="6i-9OZ%K!^I1-zSIOgn=">
                                <field name="CHOICE">20</field>
                              </shadow>
                            </value>
                            <next>
                              <block type="control_repeat" id=";r`|Zl(+]g2x*9u;lw@K">
                                <value name="TIMES">
                                  <shadow type="math_whole_number" id="OH{7z,a*Y)F@{8_|U~bw">
                                    <field name="NUM">4</field>
                                  </shadow>
                                </value>
                              </block>
                            </next>
                          </block>
                        </next>
                      </block>
                    </next>
                  </block>
                </statement>
                <value name="TIMES">
                  <shadow type="math_whole_number" id="_1XECXYKjWCSrjN8?@/M">
                    <field name="NUM">4</field>
                  </shadow>
                </value>
                <next>
                  <block type="turtle_turn_left" id="/LnJP]8Nlv!W0=zA!?FP">
                    <value name="ANGLE">
                      <shadow type="dropdown_turn_left" id="{yR739Y,g!biu#_lq.HM">
                        <field name="CHOICE">30</field>
                      </shadow>
                    </value>
                    <next>
                      <block type="turtle_move_backward" id="w*Y%;oxG_.wBryKgmqJy">
                        <value name="VALUE">
                          <shadow type="dropdown_move_backward" id="sV17jdRy*]2(yxfW@o/t">
                            <field name="CHOICE">20</field>
                          </shadow>
                        </value>
                        <next>
                          <block type="turtle_turn_right" id="J%;~^dety%nOz,hmDb%g">
                            <value name="ANGLE">
                              <shadow type="dropdown_turn_right" id="y#[~^jCvx:.i@K8L|1y%">
                                <field name="CHOICE">30</field>
                              </shadow>
                            </value>
                          </block>
                        </next>
                      </block>
                    </next>
                  </block>
                </next>
              </block>
            </next>
          </block>
        </next>
      </block>
    </next>
  </block>
</xml>"

*/