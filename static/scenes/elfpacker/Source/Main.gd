extends Node2D

onready var player = $Player
onready var initialTimer = $InitialTimer
onready var gameOverMenu = $GameOver/Control
onready var laneEndsGroup = get_tree().get_nodes_in_group("LaneEnds")
onready var laneGroup = get_tree().get_nodes_in_group("Lanes")
onready var Present = preload("res://Present.tscn")


func _ready():
	for i in laneEndsGroup:
		i.connect("game_over", self, "game_over")


func _unhandled_input(event):
	if event.is_action_pressed("send_present"):
		var current_lane = player.lane_tracker
		laneGroup[current_lane].get_node("LaneRight/PresentSpawn").spawn()


func initial_spawn():
	for i in laneGroup:
		i.get_node("LaneLeft/NPCSpawn").spawn()


func game_over():
	gameOverMenu.is_paused = true

