
===============================================================================================
UTILISATION
===============================================================================================

Procédure d'installation :
1. Se déplacer dans le dossier courant dans le terminal

2. Lancer la commande
   vagrant up
   
   Remarque : Cette commande installe tout ce qui est nécessaire pour la machine et la lance.
   Elle lance aussi le "Docker UI", qui permet de gérer les images et les containers via une
   interface web.
   
3. Accéder au front end via le navigateur, à l'adresse :
   http://192.168.42.42:8080/
   
   Remarque : ça ne marche pas. C'est normal ! On a pas lancé les serveurs sur la machine. Pour
   ce faire il faut...
   
3. Accéder à Docker UI via le navigateur, à l'adresse :
   http://192.168.42.42:9000/
   
   L'interface affiche les containers en cours d'exécution (a priori, il n'y a que le container
   du Docker UI qui tourne) et les images disponibles.
   
   Dans l'onglet Images, on trouve l'image "php-frontend:latest" qui est notre front end.
   
   3.1 Lancer le front end, en cliquant sur l'image "php-frontend:latest", puis le bouton "CREATE"
   3.2 Dans "HostConfig options", bouton "Add Port Binding"
   3.3 Entrer 8080 dans "Host Port" et 80 dans "Container port" (laisser "Host IP address" vide)
   3.4 => Create
   
4. Ouvrir à nouveau le frontend, à l'adresse :
   http://192.168.42.42:8080/
   
   Remarque : ça fonctionne déjà mieux ! Mais le bouton "Bouton !" ne fonctionne pas. C'est
   normal, il va cherche des informations auprès du backend qui n'est pas encore lancé.
   Garder cette page ouverte, on va maintenant activer le backend...
   
5. Revenir à l'onglet d'administration, section "containers", cliquer sur le container du
   front end que l'on vient de créer. L'arrêter en cliquant sur "Stop".
   
   Remarque : on a arrêté le container du front end parce que le backend et le frontend
   sont en conflit sans reverse proxy.

6. Section "Images" de l'administration, trouver l'image "express-backend". Créer l'image
   comme pour le frontend d'avant, mais en spécifiant les ports 8080 et 3000 (au lieu de
   8080 et 80). Les deux services ont des ports différents.
   
7. Revenir à l'onglet du site qu'on a ouvert en 4. Maintenant, le bouton devrait fonctionner !


===============================================================================================
A FAIRE
===============================================================================================
LOAD BALANCER
Dans la procédure ci-dessus, on doit manuellement fermer le container "frontend" et le container
"backend" pour pas qu'ils soient en conflit entre les requêtes. Il nous faut donc le load balancer
qui puisse garder ces deux containers (et leurs éventuelles multiples instances) actifs en même
temps, en leur distribuant les requêtes intelligemment.

DYNAMIC DISCOVERY
Le Load Balancer ci-dessus ne saura pas exactement combien de containers de type "frontend" et
"backend" tourneront en même temps. Il faut donc faire un script qui va relancer le load balancer
avec la bonne configuration dès qu'il aura détecté qu'un nouveau container frontend ou backend
sera en route. Ou alors que l'un d'entre eux sera killé...
    => Il faudra donc faire deux scripts. L'un doit être placé dans les containers "frontend" et
       "backend" (cf. /docker/image_frontend/ et /docker/image_backend/) et l'autre dans son
       propre container qui "écoutera" ces scripts