<?php
    // Lancer la session
    session_start();
?>
<!DOCTYPE html>
<html>
    <head>
        <title>Suggestion de repas</title>
        <!-- jQuery -->
        <script type="text/javascript" src="http://code.jquery.com/jquery-1.11.3.min.js"></script>
        
        <!-- Latest compiled and minified CSS -->
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap.min.css">

        <!-- Optional theme -->
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/css/bootstrap-theme.min.css">

        <!-- Latest compiled and minified JavaScript -->
        <script src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.4/js/bootstrap.min.js"></script>
        
        <script type="text/javascript">
            $(document).ready(function () {
                // Lorsque l'utilisateur clique sur le bouton
                $('#bouton').click(function () {
                
                    // Récupérer une liste de repas via AJAX
                    $.get("/api/nourriture", function (data) {
                        
                        // Lorsque la liste est récupérée, on vide le tableau, on parcourt la liste et on remplit le tableau HTML avec ces données
                        $('#repas tbody').html('');
                        for (var i = 0; i < data.repas.length; ++i) {
                            $('#repas tbody').append('<tr><td>' + i + '</td><td>' + data.repas[i].boisson + '</td><td>' + data.repas[i].nourriture + '</td></tr>');
                        }
                    });
                });
            });
            
        </script>
    </head>
    <body>
        <h1>Suggestions de repas !</h1>
        <p>
            Vous êtes servi par <code><?php echo $_SERVER['SERVER_NAME']; ?></code>
        </p>
        <p>
            Cliquez ici pour une liste de repas : <a href="#" id="bouton">Bouton !</a>
        </p>
        
        <table class="table" id="repas">
            <thead>
                <tr>
                    <th>Numéro</th>
                    <th>Boisson</th>
                    <th>Nourriture</th>
                </tr>
            </thead>
            <tbody>
                <!-- Dynamically generated, see script -->
            </tbody>
        </table>
    </body>
</html>