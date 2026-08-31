extends KinematicBody2D
class_name Player

onready var laneGroup = get_tree().get_nodes_in_group("Lanes")

var lane_tracker = 0


func _ready():
	update_pos()


func update_pos():
	global_position = laneGroup[lane_tracker].get_node("LaneRight").global_position
	

func _unhandled_input(event):
	
	if event.is_action_pressed("ui_down"):
		if lane_tracker < 3:
			lane_tracker += 1
			update_pos()
		else:
			lane_tracker = 3
			update_pos()
	if event.is_action_pressed("ui_up"):
		if lane_tracker > 0:
			lane_tracker -= 1
			update_pos()
		else:
			lane_tracker = 0
			update_pos()
	
		
		
