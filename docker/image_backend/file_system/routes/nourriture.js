var express = require('express');
var router = express.Router();

/* GET nourriture. */
router.get('/', function(req, res, next) {
    function shuffle(o){
        for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
        return o;
    }
  var repas= ["Banane", "Hamburger", "Carbonara", "Chocolat", "Salade", "Pain d'épices"];
  var boissons = ["Lait", "Eau", "Coca", "Jus d'abricot"];
  shuffle(repas);
  shuffle(boissons);
  var payload = {
      "repas" : [
        {
            "nourriture" : repas[0],
            "boisson"    : boissons[0]
        },
        {
            "nourriture" : repas[1],
            "boisson"    : boissons[1]
        },
        {
            "nourriture" : repas[2],
            "boisson" : boissons[2]
        }
      ]
  }
  res.send(payload);
});

module.exports = router;
