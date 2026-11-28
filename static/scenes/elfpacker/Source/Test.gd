extends Node2D

onready var rayCast = $RayCast2D

func _ready():
	rayCast.enabled = true
	var collider = rayCast.get_collider()
	print(rayCast.is_colliding())
	
func _physics_process(delta):
	print(rayCast.get_collider())
