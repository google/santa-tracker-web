extends KinematicBody2D
class_name NPC

signal npc_freed()

onready var npcTimer = $NPCTimer
onready var tween = $Tween
onready var packsUI = $PacksUI
onready var interactionComponent = $InteractionComponent
onready var animationPlayer = $AnimationPlayer
onready var rng = RandomNumberGenerator.new()
onready var npcSpawn = get_parent()
onready var laneLeftPosition = get_node("../../../LaneLeft").global_position
onready var laneRightPosition = get_node("../../../LaneRight").global_position

enum {
	IDLE,
	PACKING
}

var packs_remaining = 2 setget set_packs_remaining
var attached_present : Node


func _ready():
	show_behind_parent = true
	interactionComponent.connect("on_present_collide", self, "present_interact")
	update_packs_UI(packs_remaining)


func advance(target_pos, speed, random = true):
	tween.remove_all()
	
	if random == true:
		var max_target_pos = target_pos + 30
		var rand_target_pos = randomize_distance(target_pos, max_target_pos)
		tween.interpolate_property(self, "global_position:x", global_position.x, rand_target_pos, speed)
		tween.start()
		
	elif random == false:
		tween.interpolate_property(self, "global_position:x", global_position.x, target_pos, speed)
		tween.start()


func randomize_distance(min_value, max_value):
	rng.randomize()
	var randomized_distance = rng.randi_range(min_value, max_value)
	return randomized_distance
	

func update_packs_UI(packs):
	packsUI.clear()
	packsUI.append_bbcode("[center]" + str(packs))


func set_packs_remaining(value):
	packs_remaining = value
	if value == 0:
		emit_signal("npc_freed")
		queue_free()


func npc_state(state):
	match state:
		IDLE:
			interactionComponent.collision_layer = 4
			interactionComponent.collision_mask = 56
		
		PACKING:
			interactionComponent.collision_layer = 128
			interactionComponent.collision_mask = 48


func present_interact(present, packed):
	attached_present = present
	npc_state(PACKING)
	
	if packed == false:
		present.packed = true
		tween.remove_all()
		var distance_to_spawn = global_position.x - npcSpawn.global_position.x
		
		if distance_to_spawn >= 150:
			var target_pos = global_position.x - 140
			var target_speed = .5
			var present_target_pos = present.global_position.x - 140
			present_pack(target_pos, target_speed, present_target_pos)

		elif distance_to_spawn <= 150:
			var target_pos = global_position.x - distance_to_spawn
			var target_speed = distance_to_spawn * .0033
			var present_target_pos = present.global_position.x - distance_to_spawn
			present_pack(target_pos, target_speed, present_target_pos)


func present_pack(target_pos, target_speed, present_target_pos):
	attached_present.npc_interact(present_target_pos, target_speed)
	present_send(target_pos, target_speed)


func present_send(target_pos, target_speed):
	npcTimer.stop()
	advance(target_pos, target_speed, false)
	yield(tween, "tween_all_completed")
	tween.remove_all()
	animationPlayer.play("pack")
	self.packs_remaining -= 1
	yield(animationPlayer, "animation_finished")
	update_packs_UI(packs_remaining)
	npcTimer.fixed_start()
	npc_state(IDLE)


func _on_NPCTimer_timeout():
	advance(global_position.x + 50, .5)
