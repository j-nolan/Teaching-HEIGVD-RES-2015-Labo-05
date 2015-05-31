#
# This image is based on another image
#
FROM httpd:2.4

#
# When we create the image, we copy files from the host into
# the image file system. This is NOT a shared folder!
#
COPY ./conf/ /usr/local/apache2/conf/

#
# With RUN, we can execute commands when we create the image. Here,
# we install node.js for the discovery.js file
#
# RUN apt-get update
# RUN apt-get --purge remove node  -y
# RUN apt-get install nodejs -y
# RUN ln -s /usr/bin/nodejs /usr/bin/node
# RUN apt-get update --fix-missing
# RUN apt-get install npm -y
# RUN npm install -g pm2@0.12.9

#
# Entry point we have to run the start shell to launch the discovery shell
#
# TODO
