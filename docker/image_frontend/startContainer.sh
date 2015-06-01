#pm2 start /var/www/heartbeat/heartbeat.js
#/etc/init.d/apache2 start
#node /var/www/heartbeat/heartbeat.js
/etc/init.d/apache2 start
pm2 start -x /var/www/heartbeat/heartbeat.js --no-daemon