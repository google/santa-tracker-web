
Blockly <-> Animator
====================

BlockRunner evaluates blocks. Checks for error conditions. Checks if the run is successful.

If invalid code is generated, an overlay will be displayed instantly with details about the error.
Never calls start or cause other changes to animations or music.

If moves are valid, then they are passed to Player

For level === ['leftArm', 'rightArm', 'jump', 'clap']
player.start([]); // Teacher dances, student watches.
player.start(['leftArm']); // Both start dancing, student is confused while teacher continues dancing. 
player.start(['leftArm', 'rightArm', 'jump', 'clap']); // Success: Both dance complete sequence, maybe a final move.

SUCCESS
- perfect
- could use loop

TOO_MANY_MOVES

NOT_ENOUGH_MOVES
NO_MOVES
- teacher does the dance

WRONG_MOVES

NO_ANIMATION
- blocks not attached
- multiple block groups
