# Serveur Apache et controleur 

## Introduction

Comme annoncé précédemment, nous avons regroupé le serveur apache, qui implémente la gestion du load-balancer ainsi que du proxy, avec notre controleur dans la même image Docker.
 
Ceci pour les raisons suivantes. 

Le contrôleur gère l’actualisation des serveurs (front/backends) actif. Or pour que le serveur apache puisse avoir connaissance de ces changements il faut avoir accès au fichier de configuration Apache gérant le proxy et le load-balancer afin de pouvoir les modifier en ajoutant, ou supprimant, les serveurs actifs, inactifs.

D’autre part, pour que nos modifications puissent être prisent en compte, il nous faut pouvoir agir sur le serveur Apache. A savoir, le stopper et le relancer afin que les modifications apportées au fichier de configuration soient prisent en compte. Ceci pouvait être fait soit en envoyant un message au serveur apache depuis le contrôleur avec un programme dans l'image du serveur Apache s'occupant de stopper et relancer Apache lorsqu'il reçoit un message. Soit directement depuis le contrôleur. Nous avons opté pour la dernière option.

Plus bas, nous allons décrire d’une manière un peu plus précise l’implémentation du serveur apache puis finalement du controleur.

## Dockerfile et Shell

Ces fichiers sont des fichiers de mise en route et de configuration pour notre image Docker. 

#### DockerFile
Le Dockerfile associé à l'image du serveur apache a plusieurs objectifs.

1. Copie les fichiers locaux à charger dans l'image. Dans notre cas, les fichiers de configuration Apache, le fichier .js du controleur, le script de lancement ainsi que le template utilisé par le controleur pour générer le fichier de configuration httpd-vhosts.conf.
2. Installe les pré-requis à l'exécution de l'image. Dans notre cas, on installe nodejs ainsi que pm2 afin de pouvoir exécuter le contrôleur.
3. Lance notre script shell lorsque l'on exécute l'image.

#### Shell
Le script shell startDiscovery.sh est appelé via notre Dockerfile. Il s'occupe de démarrer le serveur Apache ainsi que le controleur et utilise pm2 pour le monitoring des scripts nodejs (et principalement pour éviter que le container soit kill par Docker).

## Serveur Apache

Il nous était demandé d'implémenter un serveur Apache gérant le proxy et le load-balancer afin de rediriger toute requête html depuis un client vers les serveurs frontends, s'occupant de retourner les pages demandées par le client. Le contenu des pages html retournées pouvaient contenir des requêtes afin d'actualiser le contenu de ces dernières. Ces requêtes devaient, quant à elles, être traitées par des serveurs backends. 

De plus, un client devait toujours traiter avec le même serveur frontend tandis que les requêtes vers les backends d'un même client pouvaient être réparties entre les différents serveurs backends.

Pour ce faire nous avons utilisé une image Docker d'Apache déjà existante que nous avons modifiée pour nos besoins (https://registry.hub.docker.com/_/httpd/).

Nous avons utilisé que deux fichiers de cette image. 

1. Le fichier de configuration httpd.conf afin d'importer les modules nécessaires et activer les fonctionnalités souhaitées.
2. Le fichier de configuration httpd-vhosts.conf pour l'implémentation du proxy et du load-balancer.

Nous allons nous  attarder un peu plus sur ce dernier car c'est celui qui comporte notre implémentation.

Tout d'abord nous avions deux routages à effectuer. Soit vers les frontends, soit vers les backends. Nous avons donc créé deux groupe correspondant. Les règles de routages sont définis en fin de fichier par à l'aide de ProxyPass. Il ne fallait pas oublier de mettre le routage le plus spécialisé en premier pour éviter de le court-circuiter.

Deuxièmement, il fallait mettre en place le load-balancer pour les deux groupes. Pour ce faire nous utilisons les lbmethod. Il existe plusieurs algorithmes de balancing (by traffic, by request, heartbeat,...), nous avons optés pour le balancing bytraffic. 

Finalement, il fallait que les clients accèdent toujours au même frontend (tant que ce dernier était actif). Pour se faire nous avons utilisé le mécanisme des stickysession. A savoir, utiliser les cookies pour conserver une trace du client et du serveur frontend qui lui était associé. Cette association se fait à l'aide des routes liées aux serveurs.

## Controleur

Le controleur est un programme qui s'exécute en parallèle du serveur Apache sur l'image Docker. Il s'occupe de maintenir la liste des serveurs à jour. 

Pour ce faire le controleur exécute trois tâches :

1. Conserve, pour chaque serveurs actifs, un timeout. Si ce dernier dépasse trois secondes. Il supprime le serveur de sa liste de serveurs frontends ou bakcends.
2. Écoute les messages sur le canal broadcast. Si un nouveau serveur est détecté met à jour la liste des serveurs concernée. Si le serveur existe déjà, actualisé le champ "lastSeen" utilisé pour le timeout du point 1. 
3. Regarde, toutes les 500ms, si la liste utilisée par le serveur Apache doit être mise à jour. Si c'est le cas, le controleur réécrit le fichier httpd-vhosts.conf en utilisant les templates de début, milieu et de fin mit à disposition en y insérant la liste des serveurs à jour. Une fois la liste à jour, le controleur redémarre le serveur Apache.




