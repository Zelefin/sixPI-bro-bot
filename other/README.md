**nginx_conf** - is configuration file for nginx.

Main idea is just use reverse proxy, so requests to YOUR_SERVER_NAME aka domain (or ip) will be directed to specific port on machine. In this case 8080.

I recommend using certbot, so it will automatically request and add SSL certificate.

**sixPiBroBot.service** - is an alternative way to launch bot using systemctl.

It consumes same amount of RAM as docker, so I'd recommend using docker.
