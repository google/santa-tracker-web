extends Control


var is_paused = false setget set_is_paused


func set_is_paused(value):
	is_paused = value
	get_tree().paused = is_paused
	visible = is_paused
	

func _on_ResumeBtn_pressed():
	self.is_paused = false
	SceneChanger.change_scene("res://Node2D.tscn")


func _on_QuitBtn_pressed():
	get_tree().quit()
