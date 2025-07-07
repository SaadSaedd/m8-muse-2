; Run the game website

Run, "C:\Users\GA Mini 2\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Simple Web Server.lnk"
; Wait for server to start
Sleep, 3000

; Open the localhost
Run, http://localhost

; Wait for browser to open (adjust timing if needed)
Sleep, 7000

; Press F11 to enter fullscreen in browser
Send, {F11}
