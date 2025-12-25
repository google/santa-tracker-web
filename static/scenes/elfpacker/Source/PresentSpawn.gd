extends Position2D

signal spawned(spawnling)

export (PackedScene) var spawnling_scene

onready var lane = get_node("../../")

var spawnling_max = Globals.spawnling_max

var present_tracker = 0

func spawn():
	var lane_npcs = lane.lane_npcs
	if lane_npcs > 0 and lane_npcs <= spawnling_max:
		
		if present_tracker < lane_npcs:
			spawn_spawnling()
			present_tracker += 1
		
	else:
		return


func spawn_spawnling():
	var spawnling = spawnling_scene.instance()
	add_child(spawnling)
	spawnling.set_as_toplevel(true)
	spawnling.global_position = global_position
	emit_signal("spawned", spawnling)
	return spawnling
		
