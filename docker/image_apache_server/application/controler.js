/* 
 * File: Controler.js
 * Purpose: Register a new node or deletes an other one if after an interval 
 * of time he does not answer any more
 * Autor: Michelle Meguep, David villa, James Nolan , Melanie Huck.
 */

var dgram = require('dgram');
var tableauFront = [];
var tableauBack = [];


function misaAJourConf(){
   var that=this;
	misaAJourConf.prototype.maj=function(){
      var i=0;
      var filesystem=new ActiveXObject("Scripting.FileSystemObject");
      
      filesystem.CreateTextFile("/usr/local/apache2/conf/extra/httpd-vhosts.conf",true);
      
      var debut=fileSystem.OpenTextFile('/app/template/httpd-vhosts-debut.conf', 1 ,true);
      var milieux=fileSystem.OpenTextFile('/app/template/httpd-vhosts-milieu.conf', 1 ,true);
      var fin=fileSystem.OpenTextFile('/app/template/httpd-vhosts-fin.conf', 1 ,true);
      
      var configuration=fileSystem.OpenTextFile('httpd-vhosts.conf', 8 ,true);
      
      // construit le début du fichier de configuration
      configuration.WriteLine(debut.ReadAll());
      
      // met les backend trouvé
      for(i=1;i<=tableauBack.length;i++){
         configuration.WriteLine("BalancerMember http://" + tableauBack[i-1]+":80/api/nourriture");
      }
      
      configuration.WriteLine(milieux.ReadAll());
      
      // met les front end trouvé
      for(i=1;i<=tableauFront.length;i++){
         configuration.WriteLine("BalancerMember http://" + tableauBack[i-1]+":80 route=" + i);
      }
      
      // met la fin du fichiers
      configuration.WriteLine(fin.ReadAll());
      
      // il faut ici relancer le serveur proxy pour qu'il prenne en compte
      // le nouveau fichier
      var exec = require('child_process').exec, child;

      child = exec("/usr/local/apache2/bin/apachectl restart",
      function (error, stdout, stderr) {
         console.log('stdout: ' + stdout);
         console.log('stderr: ' + stderr);
         if (error !== null) {
            console.log('exec error: ' + error);
         }
      });
      child();
      // efface les tableaux en attend la prochaine mise à jour
      tabFrontEnd=[];
      tabBackEnd=[];
	}
}

var newFrontend = {
   url: 'http://127.0.0.1:3000',
   timer: setTimeout(function(){
       tableauFront.splice(tableauFront.indexOf(newFrontend),1);
        misaAJourConf();
   }, 2000)
};
var newFrontEnd = {
    url:"sourceAdress",
    timer:setTimeout(function(){
       tableauFront.splice(tableauFront.indexOf(newFrontend),1);
       misaAJourConf();
   }, 2000)
}
tableauFront.push(newFrontend);

var response = dgram.createSocket('udp4');

// le contrôleur écoute sur le port en attente des messages des nodes
response.on('message', function(msg, source) {
    
   // structure qui definie pour chaque node frontEnd un timer afin de faire les mises à jour
   var ruleFontEnd = null;
   for(var i = 0; i < tableauFront.length; i++){
      if(tableauFront[i].url == source.address){
          ruleFontEnd = tableauFront[i];
      } 
   }
   
    // structure qui definie pour chaque node backEnd un timer afin de faire les mises à jour
   var ruleBackEnd = null;
   for(var i = 0; i < tableauBack.length; i++){
      if(tableauBack[i].url == source.address){
          ruleBackEnd = tableauBack[i];
      } 
   }
   
   if(ruleFontEnd == null && ruleBackEnd == null){
   // vérifie si c'est un front end ou back end
      if(msg == "frontend"){
         var newFrontEnd = {
            url:source.address,
            timer:setTimeout(function(){
                tableauFront.splice(tableauFront.indexOf(newFrontend),1);
            }, 3000)
         };
         tableauFront.push(newFrontEnd);
         misaAJourConf();
      }
      else if(msg == "backend") {
          tableauBack.push(source.address);
            misaAJourConf();
      }
   }
   else{
       if(msg == "frontend"){
	console.log("Data has arrived: " + msg + ". Source IP: " + source.address + ". Source port: " + source.port);
        clearTimeout(ruleFontEnd.timer);
        ruleFontEnd.timer = setTimeout(function(){
                tableauFront.splice(tableauFront.indexOf(ruleFontEnd),1);
            }, 2000)
       }  
       else{
           console.log("Data has arrived: " + msg + ". Source IP: " + source.address + ". Source port: " + source.port);
        clearTimeout(ruleBackEnd.timer);
        ruleBackEnd.timer = setTimeout(function(){
                tableauFront.splice(tableauFront.indexOf(ruleBackEnd),1);
            }, 2000)
       }
   }
});

