# M8 Muse Project Mediacollege Amsterdam

## Raspberry Pi
This project runs on a Raspberry Pi.  
Make sure that a webserver is installed and that the home folder of the localhost is a symlink to the root of this Muse project.  


## Startup script:
Edit this file:
```bash
sudo nano /etc/xdg/lxsession/LXDE-pi/autostart
```

Add this line to the bottom:  
```bash
@chromium-browser --disable-session-crashed-bubble --start-fullscreen
```
