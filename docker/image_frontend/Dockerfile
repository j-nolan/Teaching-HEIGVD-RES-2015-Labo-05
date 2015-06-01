# Installe Apache sans PHP
# FROM httpd:2.4
# COPY ./public-html/ /usr/local/apache2/htdocs/

# Installe Apache avec PHP
FROM php:5.6-apache
COPY public-html/ /var/www/html/

# Copie du script de discovery
COPY heartbeat/ /var/www/heartbeat/
COPY startContainer.sh /var/www/startContainer.sh

# Installe node
RUN apt-get update
RUN apt-get --purge remove node  -y
RUN apt-get install nodejs -y
RUN ln -s /usr/bin/nodejs /usr/bin/node
RUN apt-get update --fix-missing
RUN apt-get install npm -y
RUN npm install -g pm2@0.12.9

CMD /var/www/startContainer.sh