<!DOCTYPE html>
<html lang="pt-br">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SAS/RJ Contatos</title>
    <link rel="icon" href="img/SAS-RJ_logo.png">
    <link rel="stylesheet" href="style.css">
</head>


<header class="home">
    <div class="off-screen-menu">
        <div class="home_div" style="align-items: center;"><a href="index.html">Home</a></div>
        <div class="inmet_div"><a href="inmet.html">INMET</a></div>
        <div class="sobre_div"><a href="sobre.html">Sobre</a></div>
        <div class="contatos_div"><a href="contatos.html">Contatos</a></div>
        <div class="inscrever_div"><a href="inscrever.php"
                style="text-decoration: underline; color: rgba(255, 255, 3, 0.729);">Inscreva&#8209se</a></div>
    </div>





    <div class="container">
        <div style="display: flex; flex-direction: row; gap: 10px; align-items: center;">
            <div style="display: flex; flex-direction: column;"><img src="img/SAS-RJ_logo.png" alt="SAS/RJ"
                    style="width: 30px;"></div>
            <div class="logo">Sistema de Alertas de Seca RJ - SAS/RJ</div>
        </div>
        <div class="menu">
            <nav>
                <div class="naveg">
                    <div class="home_div"><a href="index.html">Home</a></div>
                    <div class="inmet_div"><a href="inmet.html">INMET</a></div>
                    <div class="sobre_div"><a href="sobre.html">Sobre</a></div>
                    <div class="contatos_div"><a href="contatos.html">Contatos</a></div>
                    <div class="inscrever_div"><a href="inscrever.php" class="inscrever"
                            style="text-decoration: underline;">Inscreva&#8209se</a></div>
                </div>
            </nav>
        </div>

        <nav class="menu-ham">
            <div class="ham-menu">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </nav>
    </div>
</header>


<body>

    <main class="contatos_main">
        Olá eu sou um texto temporário e o davi braga/brasil vai escrever um texto bem legal aqui ainda
        <br>
        <form action="inscrever.php" method="POST">
            <label for="input_email">Insira seu e-mail: </label>
            <input type="email" id="input_email" name="email" required/>
            <input id="registrar" type="submit" value="Registrar e-mail">
        </form>
        
        <?php
        $servername = getenv("USUARIOS_HOST");
        $username = getenv("USUARIOS_USER");
        $password = getenv("USUARIOS_PASS");
        $dbname = getenv("USUARIOS_NAME");
        $email = "";

        if (isset($_POST['email'])) {
            $email = $_POST['email'];
        }

        try{
            $conexao = new PDO(("mysql:host=$servername;dbname=$dbname"), $username, $password);
            $conexao->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

            $ler = $conexao->prepare("SELECT email FROM emails");
            $ler->execute();

            $buscar_duplicata = $conexao->prepare("SELECT 1 FROM emails WHERE email = ?");
            $buscar_duplicata->execute([$email]);
            $contagem = $buscar_duplicata->fetchColumn();
            if($contagem > 0){
                throw new Exception("email duplicado, tente novamente");
            }
            $resultado_busca = $ler->fetchAll(PDO::FETCH_ASSOC);

            $registrar = $conexao->prepare("INSERT INTO emails (email) VALUES (:email)");
            $registrar->bindParam(":email", $email);
            if($email != null){
                $registrar->execute();
                echo "E-mail registrado com sucesso!";
            }
        }
        catch(PDOException $e) {
            echo "E-mail j� registrado!";
        }
        $conexao = null;
        ?>
    </main>

    <footer class="footer">
        <div class="container_footer">

            <!-- <div class="navegação_footer">
    <p style="margin: auto;">Mapa do site</p>
    <a href="index.html" class="footer_nav">Home</a>
    <a href="sobre.html" class="footer_nav">Sobre</a>
    <a href="contatos.html" class="footer_nav">Contatos</a>
    <a href="inmet.html" class="footer_nav">INMET</a>
</div> -->


            <div class="apoio_footer">

                <p style="text-decoration: solid; text-decoration: underline; text-align: center;">Apoio:</p>
                <div style="display: flex; flex-direction: row;">
                    <div><img src="img/ime_logo.png" alt="Logo do IME" style="width: 50px;"></div>
                    <div style="margin: auto; color: black;">Instituto Militar de Engenharia</div>
                </div>


                <p style="text-decoration: solid; text-decoration: underline; margin-bottom: 10px; text-align: center;">
                    Créditos:</p>
                <div style="display: flex; flex-direction: row; gap: 15px;">
                    <div><img src="img/inmet_logo.png" alt="Logo do Inmet" style="width: 40px; border-radius: 8px;">
                    </div>
                    <div style="margin: auto; color: black;">Instituto Nacional de Metereologia</div>
                </div>

            </div>

        </div>

        <br>
        <hr> <br>

        Todos os direitos reservados.

    </footer>

</body>

<script src="menu-hamburguer.js"></script>




</html>