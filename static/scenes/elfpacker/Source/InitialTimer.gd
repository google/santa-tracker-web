extends Timer


func _ready():
	if autostart:
		initial_start()

func initial_start(time = 1.0):
	start(time)
