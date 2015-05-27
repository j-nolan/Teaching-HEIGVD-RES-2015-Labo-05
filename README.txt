
===============================================================================================
UTILISATION
===============================================================================================

Proc�dure d'installation :
1. Se d�placer dans le dossier courant dans le terminal

2. Lancer la commande
   vagrant up
   
   Remarque : Cette commande installe tout ce qui est n�cessaire pour la machine et la lance.
   Elle lance aussi le "Docker UI", qui permet de g�rer les images et les containers via une
   interface web.
   
3. Acc�der au front end via le navigateur, � l'adresse :
   http://192.168.42.42:8080/
   
   Remarque : �a ne marche pas. C'est normal ! On a pas lanc� les serveurs sur la machine. Pour
   ce faire il faut...
   
3. Acc�der � Docker UI via le navigateur, � l'adresse :
   http://192.168.42.42:9000/
   
   L'interface affiche les containers en cours d'ex�cution (a priori, il n'y a que le container
   du Docker UI qui tourne) et les images disponibles.
   
   Dans l'onglet Images, on trouve l'image "php-frontend:latest" qui est notre front end.
   
   3.1 Lancer le front end, en cliquant sur l'image "php-frontend:latest", puis le bouton "CREATE"
   3.2 Dans "HostConfig options", bouton "Add Port Binding"
   3.3 Entrer 8080 dans "Host Port" et 80 dans "Container port" (laisser "Host IP address" vide)
   3.4 => Create
   
4. Ouvrir � nouveau le frontend, � l'adresse :
   http://192.168.42.42:8080/
   
   Remarque : �a fonctionne d�j� mieux ! Mais le bouton "Bouton !" ne fonctionne pas. C'est
   normal, il va cherche des informations aupr�s du backend qui n'est pas encore lanc�.
   Garder cette page ouverte, on va maintenant activer le backend...
   
5. Revenir � l'onglet d'administration, section "containers", cliquer sur le container du
   front end que l'on vient de cr�er. L'arr�ter en cliquant sur "Stop".
   
   Remarque : on a arr�t� le container du front end parce que le backend et le frontend
   sont en conflit sans reverse proxy.

6. Section "Images" de l'administration, trouver l'image "express-backend". Cr�er l'image
   comme pour le frontend d'avant, mais en sp�cifiant les ports 8080 et 3000 (au lieu de
   8080 et 80). Les deux services ont des ports diff�rents.
   
7. Revenir � l'onglet du site qu'on a ouvert en 4. Maintenant, le bouton devrait fonctionner !


===============================================================================================
A FAIRE
===============================================================================================
LOAD BALANCER
Dans la proc�dure ci-dessus, on doit manuellement fermer le container "frontend" et le container
"backend" pour pas qu'ils soient en conflit entre les requ�tes. Il nous faut donc le load balancer
qui puisse garder ces deux containers (et leurs �ventuelles multiples instances) actifs en m�me
temps, en leur distribuant les requ�tes intelligemment.

DYNAMIC DISCOVERY
Le Load Balancer ci-dessus ne saura pas exactement combien de containers de type "frontend" et
"backend" tourneront en m�me temps. Il faut donc faire un script qui va relancer le load balancer
avec la bonne configuration d�s qu'il aura d�tect� qu'un nouveau container frontend ou backend
sera en route. Ou alors que l'un d'entre eux sera kill�...
    => Il faudra donc faire deux scripts. L'un doit �tre plac� dans les containers "frontend" et
       "backend" (cf. /docker/image_frontend/ et /docker/image_backend/) et l'autre dans son
       propre container qui "�coutera" ces scripts