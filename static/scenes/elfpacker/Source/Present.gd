extends KinematicBody2D

var packed = false

onready var tween = $Tween
onready var collisionShape = $CollisionShape2D
onready var laneLeftPosition = get_node("../../../LaneLeft").global_position
onready var laneRightPosition = get_node("../../../LaneRight").global_position


func _ready():
	advance(laneLeftPosition.x, 2)
	tween.start()


func npc_interact(target_pos, speed):
	tween.remove_all()
	advance(target_pos, speed)
	yield(tween, "tween_all_completed")
	tween.remove_all()
	advance(laneRightPosition.x, 5)


func advance(target_pos, speed):
	tween.interpolate_property(self, "global_position:x", global_position.x, target_pos, speed)
	tween.start()


func interaction_can_interact(interactionComponentParent : Node) -> bool:
	return interactionComponentParent is NPC


func interaction_interact(body):
	pass
