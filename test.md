# Serveur Apache et controleur 

## Introduction

Comme annoncé précédemment, nous avons regroupé le serveur apache, qui implémente la gestion du load-balancer ainsi que du proxy, avec notre controleur dans la même image Docker. 
Ceci pour les raisons évidentes suivantes. 
Le contrôleur gère l’actualisation des serveurs (front/backends) actif. Or pour que le serveur apache puisse avoir connaissance de ces changements il faut avoir accès au fichier de configuration Apache gérant le proxy et le load-balancer afin de pouvoir les modifier en ajoutant, ou supprimant, les serveurs actifs, inactifs.
D’autre part, pour que nos modifications puissent être prisent en compte, il nous faut pouvoir agir sur le serveur Apache. A savoir, le stopper et le relancer afin que les modifications apportées au fichier de configuration soient prisent en compte. Ceci pouvait être fait soit en envoyant un message au serveur apache depuis le contrôleur. Soit directement depuis le contrôleur. Nous avons opté pour la dernière option.
Plus bas, nous allons décrire d’une manière un peu plus précise l’implémentation du serveur apache puis finalement du controleur.

