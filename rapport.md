
# RES: Web Infrastructure Lab

## Auteurs et rôles
* **David Villa**
 Concevoir une image Docker gérant un Reverse Proxy statique sur un serveur Apache2 afin de distribuer la charge entre plusieurs containers de types "frontend" et "backend".
* **James Nolan**
 Concevoir une image "Backend" Node.js à l'aide du framework Express.js pour servir des données au format JSON aux clients.
* **Mélanie Huck**
 Concevoir une image "Frontend" en PHP pour servir des données a HTML aux clients. Le document est mis en forme en CSS à l'aide de la librairie Bootstrap, et remplit dynamiquement en JavaScript à l'aide de la librairie jQuery. Les données sont récupérées grâce à l'API gérée par les containers backend.
* **Michelle Meguep**
Concevoir un script Node.js qui écoute les paquets UDP envoyés sur le réseau par les containers de type Frontend et Backend, afin de connaître les containers actuellement disponibles. Ce script met à jour la configuration du serveur Apache2 afin qu'il tienne compte de ces containers dans la répartition des charges.

# ATTENTION, REMARQUE

Nous avons pu constater que lorsque l'on push notre projet sur github, la syntaxe des retours lignes est parfois changée. Assurez-vous que les retours lignes soient bien des retours lignes UNIX sans quoi l'exécution du projet peut être compromise ! Merci.

# Frontends, backends

## Introduction
L'utilisateur final doit pouvoir interroger l'API sans même s'en rendre compte. Son navigateur demande :
1. La structure générale de la page au serveur, décrite en HTML et mise en forme en CSS,
2. puis, lorsque l'utilisateur clique sur un bouton, son navigateur demande le contenu de la page, décrit en JSON.

Le premier type de requête est traité par un serveur Apache2 + PHP. Le deuxième type de requête est traité par un serveur Node.js. Ces serveurs sont configurés dans deux images Docker, respectivement appelées "php-frontend" et "express-backend".

## Frontend
L'image frontend est basée sur une image PHP 5.6. Cette image permet de rendre des fichiers HTML pré-traités. Dans notre cas, nous nous sommes servi de PHP pour indiquer l'ID du container qui a servi la page. En plus de ça, nous avons installé Node.js dans cette image pour permettre aux containers de broadcaster leur présence sur le réseau.

## Backend
L'image backend est basée sur une image Node.js. Grâce au framework Express.js, nous avons pu coder un script qui renvoyait des données au format JSON. En l'occurrence, ce script renvoyait une liste aléatoire de 3 suggestions de repas.

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

# Mécanismes de test

Afin de tester si les mécanisme de proxy et load-balancing étaient fonctionnels, nous avons intégré à l'affichage de la page html reçue l'id du container ayant traité la requête. Que ce soit un serveur frontend ou backend. 

L'emplacement de ces ids permettent de différentier s'il s'agit d'un serveur frontend ou backend (cf images).

Dans notre phase de test, nous avons établit une connexion à l'aide de deux navigateurs différents. Chaque navigateur symbolisant un client. Puis nous avons effectué une série de requêtes vers les serveurs backends à l'aide du lien 'bouton!'. Nous avons observé que 3 serveurs backends différents on été sollicité.

Nous avons ensuite réactualisé la page plusieurs fois afin de nous assurer que l'id du serveur frontend ne changeait pas. Comportement qui a été constaté. 

Notre implémentation semble donc correcte et fonctionnelle.

**Précisions :**
Voici la manipulation effectuée pour avoir notre projet fonctionnel :

1. Lancer la provision de la machine à l'aide de la commande `vagrant up`
2. Redémarrer la machine pour que tous les containers de base se lancent à l'aide de la commande `vagrant reload` 

 ![Test avec navigateur chrome](https://github.com/j-nolan/Teaching-HEIGVD-RES-2015-Labo-05/blob/master/RES-Chrome.png)
 






