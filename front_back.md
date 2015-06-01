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