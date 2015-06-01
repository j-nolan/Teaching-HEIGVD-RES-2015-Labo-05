# Frontends, backends

## Introduction
L'utilisateur final doit pouvoir interroger l'API sans m�me s'en rendre compte. Son navigateur demande :
1. La structure g�n�rale de la page au serveur, d�crite en HTML et mise en forme en CSS,
2. puis, lorsque l'utilisateur clique sur un bouton, son navigateur demande le contenu de la page, d�crit en JSON.

Le premier type de requ�te est trait� par un serveur Apache2 + PHP. Le deuxi�me type de requ�te est trait� par un serveur Node.js. Ces serveurs sont configur�s dans deux images Docker, respectivement appel�es "php-frontend" et "express-backend".

## Frontend
L'image frontend est bas�e sur une image PHP 5.6. Cette image permet de rendre des fichiers HTML pr�-trait�s. Dans notre cas, nous nous sommes servi de PHP pour indiquer l'ID du container qui a servi la page. En plus de �a, nous avons install� Node.js dans cette image pour permettre aux containers de broadcaster leur pr�sence sur le r�seau.

## Backend
L'image backend est bas�e sur une image Node.js. Gr�ce au framework Express.js, nous avons pu coder un script qui renvoyait des donn�es au format JSON. En l'occurrence, ce script renvoyait une liste al�atoire de 3 suggestions de repas.