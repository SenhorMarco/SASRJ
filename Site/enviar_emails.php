<?php
$data_email_json = file_get_contents(("data_ultimo_email.json"));
$data_email = json_decode($data_email_json, true) or die("");
$data_email_proxima_json = file_get_contents(("data_ultimo_email.json"));
$data_email_proxima = json_decode($data_email_proxima_json, true) or die("");

$data_email_proxima["mes"] += 1;
if ($data_email_proxima["mes"] == 13) {
    $data_email_proxima["mes"] = 1;
    $data_email_proxima["ano"] += 1;
}

$data_email_proxima_json = json_encode($data_email_proxima, JSON_PRETTY_PRINT);
$atualizar_data = fopen("data_ultimo_email.json", "w");
fwrite($atualizar_data, $data_email_proxima_json);

$json_enviado = file_get_contents('php://input') or die('');
$data = json_decode($json_enviado, true) or die("");
$arquivo = fopen(sprintf("relatorio_%d_%02d.txt", $data_email_proxima["ano"], $data_email_proxima["mes"]), "w");

$estados_seca_extrema_spi1 = [];
$estados_seca_excepcional_spi1 = [];
$estados_chuva_extrema_spi1 = [];
$estados_chuva_excepcional_spi1 = [];

$estados_seca_extrema_spi12 = [];
$estados_seca_excepcional_spi12 = [];
$estados_chuva_extrema_spi12 = [];
$estados_chuva_excepcional_spi12 = [];

foreach ($data["spi1"]["seca"] as $x) {
    if ($x["spi_min"] < -2) {
        array_push($estados_seca_excepcional_spi1, $x["name"]);
    } else {
        array_push($estados_seca_extrema_spi1, $x["name"]);
    }
}

foreach ($data["spi1"]["chuva"] as $x) {
    if ($x["spi_min"] > 2) {
        array_push($estados_chuva_excepcional_spi1, $x["name"]);
    } else {
        array_push($estados_chuva_extrema_spi1, $x["name"]);
    }
}

foreach ($data["spi12"]["seca"] as $x) {
    if ($x["spi_min"] < -2) {
        array_push($estados_seca_excepcional_spi12, $x["name"]);
    } else {
        array_push($estados_seca_extrema_spi12, $x["name"]);
    }
}

foreach ($data["spi12"]["chuva"] as $x) {
    if ($x["spi_min"] > 2) {
        array_push($estados_chuva_excepcional_spi12, $x["name"]);
    } else {
        array_push($estados_chuva_extrema_spi12, $x["name"]);
    }
}

$mensagem_relatorio = sprintf("SAS-RJ: RELATÓRIO REFERENTE A %02d/%d", $data_email_proxima["mes"], $data_email_proxima["ano"]);
$mensagem_relatorio = $mensagem_relatorio . "\n---------------------------------------\n\n";
$mensagem_relatorio = $mensagem_relatorio . "NO PERÍODO REFERENTE A 1 MÊS (SPI-1):\n\n";
$mensagem_relatorio = $mensagem_relatorio . sprintf("Municípios em estado de seca extrema (%d): %s\n", count($estados_seca_extrema_spi1), implode(", ", $estados_seca_extrema_spi1));
$mensagem_relatorio = $mensagem_relatorio . sprintf("Municípios em estado de seca excepcional (%d): %s\n", count($estados_seca_excepcional_spi1), implode(", ", $estados_seca_excepcional_spi1));
$mensagem_relatorio = $mensagem_relatorio . sprintf("Municípios em estado de chuva extrema (%d): %s\n", count($estados_chuva_extrema_spi1), implode(", ", $estados_chuva_extrema_spi1));
$mensagem_relatorio = $mensagem_relatorio . sprintf("Municípios em estado de chuva excepcional (%d): %s\n", count($estados_chuva_excepcional_spi1), implode(", ", $estados_chuva_excepcional_spi1));

$mensagem_relatorio = $mensagem_relatorio . "\n\nNO PERÍODO REFERENTE A 12 MESES (SPI-12):\n\n";
$mensagem_relatorio = $mensagem_relatorio . sprintf("Municípios em estado de seca extrema (%d): %s\n", count($estados_seca_extrema_spi12), implode(", ", $estados_seca_extrema_spi12));
$mensagem_relatorio = $mensagem_relatorio . sprintf("Municípios em estado de seca excepcional (%d): %s\n", count($estados_seca_excepcional_spi12), implode(", ", $estados_seca_excepcional_spi12));
$mensagem_relatorio = $mensagem_relatorio . sprintf("Municípios em estado de chuva extrema (%d): %s\n", count($estados_chuva_extrema_spi12), implode(", ", $estados_chuva_extrema_spi12));
$mensagem_relatorio = $mensagem_relatorio . sprintf("Municípios em estado de chuva excepcional (%d): %s\n", count($estados_chuva_excepcional_spi12), implode(", ", $estados_chuva_excepcional_spi12));
fwrite($arquivo, $mensagem_relatorio);


$servername = getenv("USUARIOS_HOST");
$username = getenv("USUARIOS_USER");
$password = getenv("USUARIOS_PASS");
$dbname = getenv("USUARIOS_NAME");
$apiKey = getenv("API_BREVO_TOKEN");


$remetente_nome = 'SAS-RJ';
$remetente_email = 'relatorios@sasrj.com.br';
$assunto = sprintf("SAS-RJ: %02d/%d", $data_email_proxima["mes"], $data_email_proxima["ano"]);

try {
    $conexao = new PDO(("mysql:host=$servername;dbname=$dbname"), $username, $password);
    $conexao->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $ler = $conexao->prepare("SELECT email FROM emails");
    $ler->execute();
    $resultado_busca = $ler->fetchAll(PDO::FETCH_ASSOC);
    foreach ($resultado_busca as $resultado) {
        echo $resultado["email"];
        try {
            $json = '{
            "sender": {
                "name": "' . addslashes($remetente_nome) . '",
                "email": "' . addslashes($remetente_email) . '"
            },
            "to": [
                {"email": "' . addslashes($resultado["email"]) . '"}
            ],
            "subject": "' . addslashes($assunto) . '",
            "textContent": "' . addslashes($mensagem_relatorio) . '"
            }';
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, 'https://api.brevo.com/v3/smtp/email');
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'accept: application/json',
                'api-key: ' . $apiKey,
                'content-type: application/json'
            ]);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $json);

            $response = curl_exec($ch);
            curl_close($ch);
        } catch (PDOException $e) {
            echo '' . $e->getMessage() . '';
        }
    }
} catch (PDOException $e) {
    echo 'deu ruim!!' . $e->getMessage() . '';
}

$conexao = null;
echo "atualizei";


?>