extends Position2D

signal spawned(spawnling)

onready var spawnTimer = $SpawnTimer
onready var lane = get_node("../../")
onready var total_waves_remaining = Globals.total_waves

export (PackedScene) var spawnling_scene

var spawnling_max = Globals.spawnling_max

func spawn():
	if total_waves_remaining > 0:
		var lane_npcs = lane.lane_npcs
		var wave_size = range(0, spawnling_max)

		if lane_npcs == 0:
			
			for i in wave_size:
				spawn_spawnling()
				spawnTimer.stop()
				yield(countdown(5.0), "completed")
				spawnTimer.fixed_start()
			total_waves_remaining -= 1

		elif lane_npcs > 0 and lane_npcs < spawnling_max:
			spawn_spawnling()
			
	else:
		
		return


func spawn_spawnling():
	var spawnling = spawnling_scene.instance()
	add_child(spawnling)
	spawnling.global_position = global_position - Vector2(0,10)
	emit_signal("spawned", 1, spawnling)
	print(lane.lane_npcs)


func countdown(time):
	yield(get_tree(), "idle_frame") # returns a GDScriptFunctionState object to _ready()
	yield(get_tree().create_timer(time), "timeout")



#signal spawned(spawnling)
#
#onready var lane = get_node("../../")
#
#export (PackedScene) var spawnling_scene
#
#var spawnling_max = Globals.spawnling_max
#
#func spawn():
#	var lane_npcs = lane.lane_npcs
#	var spawnlings = []
#	var spawnling_index = 0
#	var wave_size = range(0, spawnling_max)
#
#	if lane_npcs == 0:
#		for i in wave_size:
#			var spawnling = spawnling_scene.instance()
#			spawnlings.append(spawnling)
#			spawn_spawnling(spawnling)
#			yield(countdown(.75), "completed")
#
#		emit_signal("spawned", spawnlings)
#
#	elif lane_npcs > 0 and lane_npcs < spawnling_max:
#		var wave_remainder = spawnling_max - lane_npcs
#		var wave_remainder_size = range(0, wave_remainder)
#
#		for i in wave_remainder_size:
#			var spawnling = spawnling_scene.instance()
#			spawnlings.append(spawnling)
#			spawn_spawnling(spawnling)
#			yield(countdown(.75), "completed")
#
#		emit_signal("spawned", spawnlings)
#
#
#func spawn_spawnling(spawnling):
#	add_child(spawnling)
#	spawnling.set_as_toplevel(true)
#	spawnling.global_position = global_position
##	emit_signal("spawned", spawnling)
#
#
#func countdown(time):
#	yield(get_tree(), "idle_frame") # returns a GDScriptFunctionState object to _ready()
#	yield(get_tree().create_timer(time), "timeout")







#if lane_npcs < wave_max:
#		var spawnlings = []
#		var spawnling_index = 0
#		var wave_size = range(0, Globals.wave_size)
#
#		for i in wave_size:
#			var spawnling = spawnling_scene.instance()
#			spawnlings.append(spawnling)
#
#		for i in spawnlings:
#			if spawnling_index == 0:
#				add_child(i)
#				i.set_as_toplevel(true)
#				i.global_position = global_position
#				spawnling_index += 1
#				print("hello")
#			else:
#				var prev_spawnling_index = spawnling_index - 1
#				add_child(i)
#				i.set_as_toplevel(true)
#				i.global_position = spawnlings[prev_spawnling_index].global_position 
#				print("goodbye")
#
#		emit_signal("spawned")
