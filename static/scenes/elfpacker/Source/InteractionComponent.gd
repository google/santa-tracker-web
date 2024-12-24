extends Area2D

export var interaction_parent : NodePath

signal on_interactable_changed(newInteractable)
signal on_present_collide()

var interaction_target : Node

# Signal triggered when our collider collides with something on the interaction layer
func _on_InteractionComponent_body_entered(body):
	var canInteract := false
	
	if (body.has_method("interaction_can_interact")):
		# Interactables tell us whether we're allowed to interact with them.
		canInteract = body.interaction_can_interact(get_node(interaction_parent))
	
	if not canInteract:
		return
	
	# Store the thing we'll be interacting with, so we can trigger it from _process
	interaction_target = body
	emit_signal("on_interactable_changed", interaction_target)
	
	if (interaction_target != null):
		
		if (interaction_target.has_method("interaction_interact")):
			interaction_target.interaction_interact(self)
			
		if (interaction_target.is_in_group("Presents")):
			emit_signal("on_present_collide", interaction_target, interaction_target.packed)
			interaction_target.collision_layer = 64
			interaction_target.set_collision_mask_bit(2, false)


func _on_InteractionComponent_body_exited(body):
	if (body == interaction_target):
		interaction_target = null
		emit_signal("on_interactable_changed", null)


