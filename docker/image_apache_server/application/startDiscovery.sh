#!/bin/bash
/usr/sbin/setsebool httpd_can_network_connect 1
/usr/local/apache2/bin/apachectl start
pm2 start /app/controler.js
pm2 monit