/* 
 * File: Controler.js
 * Purpose: Register a new node or deletes an other one if after an interval 
 * of time he does not answer any more
 * Autor: Michelle Meguep, David villa, James Nolan , Melanie Huck.
 */
 
// Ecouter les messages de type broadcast sur le port 4411
var PORT = 4411;
var HOST = '255.255.255.255';

// Variables réseau
var dgram = require('dgram');
var server = dgram.createSocket('udp4');
var fs = require('fs');
var os = require('os');
var containersUpdated = false;

// Variable contenant la liste des fronts et backs connus
var containers = [];

// Ecouter les nouvelles entrées
server.on('message', function (message, remote) {
    fs.writeFile('controler.js.log', remote.address + ':' + remote.port +' - ' + message + os.EOL);
    
    // Si ce message nous est destiné
    if (message == "frontend" || message == "backend") {
        
        // Si le container se trouve déjà dans la liste
        var inList = false;
        for (var i = 0; i < containers.length; ++i) {
            if (containers[i].address == remote.address) {
                // Flag indiquant qu'il est déjà dans la liste
                inList = true;
                
                // Mettre à jour sa date de "vu pour la dernière fois..."
                containers[i].lastSeen = new Date().getTime();
                
                // Sortir de la boucle
                break;
            }
        }
        
        // Si le serveur ne se trouvait pas dans la liste
        if (!inList) {
            // L'ajouter et mettre à jour le loadbalancer
            containers.push({address: remote.address, lastSeen: new Date().getTime(), type: message});
            containersUpdated = true;
        }  
    } else {
        // Ne rien faire, ce ne nous est pas destiné
    }
});

// "Nettoyer" régulièrement la liste des containers en cherchant ceux qui n'ont pas été vus depuis plus de X secondes
setInterval(function () {
    // Quelle heure est-il maintenant ?
    var now = new Date().getTime();
    
    // Nombre de containers dans la liste
    var nbContainers = containers.length;
    
    // Parcourir la liste
    for(var i = 0; i < containers.length; ++i) {
        // Si le container n'a pas été vu depuis plus de 3000ms (3 secondes)
        if (containers[i].lastSeen < now - 3000) {
            // On le retire de la liste
            containers.splice(i, 1);
            containersUpdated = true;
        }
    }
}, 1000);

// Vérifier régulièrement si un nouveau container a été découvert ou que l'un d'eux à disparu. Si c'est le cas,
// il faut mettre à jour le loadbalancer
setInterval(function() {
    
    // Si rien n'a été mis à jour, ne rien toucher
    if (!containersUpdated) {
        return;
    }
    
    // Sinon remettre à jour le loadbalancer
    containersUpdated = false;
    
    // Lire la première partie du fichier
    fs.readFile('/app/template/httpd-vhosts-debut.conf', 'utf8', function (err, dataDebut) {
        // Saut de ligne
        dataDebut += os.EOL;
        
        // Ecrire les lignes "frontend"
        for (var i = 0, j = 0; i < containers.length; ++i) {
            if (containers[i].type == 'frontend') {
                dataDebut += 'BalancerMember "http://' + containers[i].address + ':80" route=' + j++ + os.EOL;
            }
        }
        // Lire la deuxième partie du fichier
        fs.readFile('/app/template/httpd-vhosts-milieu.conf', function (err, dataMilieu) {
                // Ajouter cette partie au nouveau fichier
                dataDebut += dataMilieu + os.EOL;
                
            // Ecrire les lignes "backend"
            for (var i = 0; i < containers.length; ++i) {
                if (containers[i].type == 'backend') {
                    dataDebut += 'BalancerMember "http://' + containers[i].address + ':80/api/nourriture"' + os.EOL;
                }
            }
            
                
            // Lire la dernière partie du fichier
            fs.readFile('/app/template/httpd-vhosts-fin.conf', function (err, dataFin) {
                dataDebut += dataFin + os.EOL;
                fs.writeFile('controler.js.log', dataDebut);
                
                // Ecrire le résultat dans le fichier de configuration
                fs.writeFile('/usr/local/apache2/conf/extra/httpd-vhosts.conf', dataDebut, function(err) {
                    
                    // Relancer Apache
                    var sys = require('sys');
                    var exec = require('child_process').exec;
                    function puts(error, stdout, stderr) { sys.puts(stdout) };
                    exec("/usr/local/apache2/bin/apachectl restart", puts);
                });
            });
        });
    });
}, 500);

server.bind(PORT, HOST);