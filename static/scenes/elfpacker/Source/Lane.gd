extends Node2D


var lane_npcs
onready var npcSpawn = $LaneLeft/NPCSpawn
onready var laneRightEnd = $LaneRight/LaneRightEnd
onready var presentSpawn = $LaneRight/PresentSpawn


func _ready():
	lane_npcs = 0
	npcSpawn.connect("spawned", self, "lane_npc_initialize")
	laneRightEnd.connect("present_freed", self, "lane_update_present_tracker")
	laneRightEnd.connect("game_over", self, "game_over")


func lane_npc_initialize(value, npc):
	lane_npcs += value
	npc.connect("npc_freed", self, "lane_npc_freed")


func lane_npc_freed():
	lane_npcs -= 1


func lane_update_present_tracker(value):
	presentSpawn.present_tracker += value

