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

