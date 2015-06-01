#!/bin/bash

# Add a repo to grap Oracle JDK 8
sudo apt-get install software-properties-common -y
sudo add-apt-repository ppa:webupd8team/java -y

# Update the package index
echo "************************  apt-get update  ************************"
sudo apt-get update

# Install util packages
echo "************************  install git  ************************"
sudo apt-get install git -y

# Install node.js (also remove the "Amateur Packet Radio Node Program" conflicting package)
echo "************************  install node.js  ************************"
sudo apt-get --purge remove node  -y
sudo apt-get install nodejs -y
sudo ln -s /usr/bin/nodejs /usr/bin/node
sudo apt-get install npm -y

# Install Docker
echo "************************  install docker  ************************"
wget -qO- https://get.docker.com/ | sh
sudo usermod -aG docker vagrant

# Build frontend image
echo "***********************  Build Frontend  ************************"
sudo docker build -t php-frontend -f /vagrant/docker/image_frontend/Dockerfile /vagrant/docker/image_frontend/

# Build backend image
echo "***********************  Build Backend  *************************"
sudo docker build -t express-backend -f /vagrant/docker/image_backend/Dockerfile /vagrant/docker/image_backend/

# Build load balancer image
echo "***********************  Build Load Balancer**********************"
sudo docker build -t loadbalancer-proxy -f /vagrant/docker/image_apache_server/Dockerfile /vagrant/docker/image_apache_server/

# Launch the Docker UI when machine starts
echo "********************  Launch Dockers on start *****************"
sudo sh -c 'sed "/exit/d" /etc/rc.local > /etc/rc.local' # supprimer la ligne "exit 0" du fichier rc.local
sudo sh -c '
echo "sudo docker run -d -p 9000:9000 --privileged -v /var/run/docker.sock:/var/run/docker.sock dockerui/dockerui" >> /etc/rc.local
echo "sudo docker run -d -p 80:80 loadbalancer-proxy" >> /etc/rc.local
echo "sudo docker run -d php-frontend" >> /etc/rc.local
echo "sudo docker run -d  express-backend" >> /etc/rc.local
echo "exit 0" >> /etc/rc.local'