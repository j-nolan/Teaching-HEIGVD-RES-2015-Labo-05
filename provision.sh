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

# Install JDK 8 (uncomment if needed)
#echo "************************  install oracle jdk 8 & maven  ************************"
#echo oracle-java8-installer shared/accepted-oracle-license-v1-1 select true | sudo /usr/bin/debconf-set-selections
#sudo apt-get install oracle-java8-set-default -y
#sudo apt-get install maven -y

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

# Launch the Docker UI
echo "***********************  Launch Docker UI  ***********************"
sudo docker run -d -p 9000:9000 --privileged -v /var/run/docker.sock:/var/run/docker.sock dockerui/dockerui