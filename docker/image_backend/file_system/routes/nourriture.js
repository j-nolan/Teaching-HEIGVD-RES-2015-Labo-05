var express = require('express');
var router = express.Router();

/* GET nourriture. */
router.get('/', function(req, res, next) {
  var payload = {
      "repas" : [
        {
            "nourriture" : "banane",
            "boisson"    : "thé"
        },
        {
            "nourriture" : "salade",
            "boisson"    : "café"
        },
        {
            "nourriture" : "crêpes",
            "boisson" : "Jus d'orange"
        }
      ]
  }
  res.send(payload);
});

module.exports = router;
