# Installe Apache sans PHP
# FROM httpd:2.4
# COPY ./public-html/ /usr/local/apache2/htdocs/

# Installe Apache avec PHP
FROM php:5.6-apache
COPY public-html/ /var/www/html/

# Installe node
#RUN curl -sL https://deb.nodesource.com/setup | bash -
#sudo apt-get install -y nodejs

# CMD /var/www/html/startContainer.sh