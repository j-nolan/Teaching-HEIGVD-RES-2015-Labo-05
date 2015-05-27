// Sending a message to all nodes on the local network

var dgram = require('dgram');
var s = dgram.createSocket('udp4');

s.bind(0, '', function() {
    s.setBroadcast(true);   
});

var payload = "FRONTEND";
message = new Buffer(payload);  

setInterval(function () {
    s.send(message, 0, message.length, 4411, "255.255.255.255", function(err, bytes) {
      console.log("Sending ad: " + payload + " via port " + s.address().port);
    });
}, 1000);