; Run VS Code and open test7.html from GA Mini 2 user account
Sleep, 10000

Run, "C:\Users\GA Mini 2\AppData\Local\Programs\Microsoft VS Code\Code.exe" "C:\Users\GA Mini 2\Documents\new\m8-muse-2\"
Sleep, 7000

Run, "C:\Users\GA Mini 2\AppData\Local\Programs\Microsoft VS Code\Code.exe" "C:\Users\GA Mini 2\Documents\new\m8-muse-2\test7.html"

; Wait for VS Code to start
Sleep, 7000

; Focus VS Code and start Live Server
WinActivate, ahk_exe Code.exe
Send, ^!l  ; Ctrl+Alt+L (Live Server shortcut)

; Wait for browser to open (adjust timing if needed)
Sleep, 7000

; Press F11 to enter fullscreen in browser
Send, {F11}
