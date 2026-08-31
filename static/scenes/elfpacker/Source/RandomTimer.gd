extends Timer


#export var min_wait_time = 2.0
#export var max_wait_time = 5.0

func _ready():
	if autostart:
		fixed_start()
		
func fixed_start():
	start(5.0)

#func random_start(time = rand_range(min_wait_time, max_wait_time)):
#	start(time)


func _on_SpawnTimer_timeout():
	if not one_shot:
		fixed_start()
