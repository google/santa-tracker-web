extends Area2D
class_name LaneEnd

signal npc_freed()
signal present_freed()
signal game_over()

onready var lane = get_node("../../")

func _on_LaneEnd_body_entered(body):
	if body.is_in_group("Presents"):
		present_interact(body)


func _on_LaneEnd_area_shape_entered(area_rid, area, area_shape_index, local_shape_index):
	var body_parent = area.get_parent()
	
	if body_parent is NPC:
		npc_interact(body_parent)


func npc_interact(npc):
	var npc_tween = npc.tween
	var present = npc.attached_present
	
	if name == "LaneLeftEnd":
		var present_tween = present.tween
		npc_tween.remove_all()
		present_tween.remove_all()
		npc.advance(npc.laneRightPosition.x, 20)
		present.advance(present.laneRightPosition.x, 5)
		
	if name == "LaneRightEnd":
		npc.connect("tree_exited", self, "update_npc_count")
		npc_tween.remove_all()
		
		if npc.packs_remaining > 0:
			npc.queue_free()
			emit_signal("game_over")
			
		else:
			return


func update_npc_count():
	lane.lane_npcs -= 1


func present_interact(body):
	if name == "LaneRightEnd" and body.packed == true:
		body.queue_free()
		emit_signal("present_freed", -1)
		
	elif name == "LaneRightEnd" and body.packed == false:
		body.queue_free()
		
	elif name == "LaneLeftEnd":
		body.queue_free()
