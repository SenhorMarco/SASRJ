import * as mi from "./mapa_interativo.js";
import * as lj from "./ler_json.js";
import * as ae from "./alerta_estados.js"

export var dados_recebidos
export const ALPHA_MAX = 0.8;

const SECA_FRACA = "#f1c329ff";
const SECA_MODERADA = "#d79846ff";
const SECA_GRAVE = "#e06a1b";
const SECA_EXTREMA = "#d61f06";
const SECA_EXCEPCIONAL = "#af0303ff";

const CHUVA_FRACA = "#61cdffff";
const CHUVA_MODERADA = "#34bdfcff";
const CHUVA_GRAVE = "#1b7cd6";
const CHUVA_EXTREMA = "#0635d6";
const CHUVA_EXCEPCIONAL = "#28198fff";

const LIMIAR_FRACA = 0.5;
const LIMIAR_MODERADA = 0.8;
const LIMIAR_GRAVE = 1.3;
const LIMIAR_EXTREMA = 1.6;
const LIMIAR_EXCEPCIONAL = 2;

let check_pagina_carregada = new Promise((resolve, reject) => {
    let check_intervalo = setInterval(() => {
        if (document.readyState === "complete") {
            resolve();
            clearInterval(check_intervalo);
        }
    }, 20);
});
await check_pagina_carregada;

var botao_gerar = document.getElementById("botao_gerar");
var input_data = document.getElementById("data");
var input_spi = document.getElementById("intervalo");

//legenda do mapa
var legenda = L.control({ position: 'bottomright' });
legenda.onAdd = () => {
    var div = L.DomUtil.create('div', 'legenda'),
        grades = [" Chuva excepcional", "Chuva extrema", "Chuva grave", "Chuva moderada", "Chuva fraca", "Seca fraca", "Seca moderada", "Seca grave", "Seca extrema", "Seca excepcional"],
        cores = [CHUVA_EXCEPCIONAL, CHUVA_EXTREMA, CHUVA_GRAVE, CHUVA_MODERADA, CHUVA_FRACA, SECA_FRACA, SECA_MODERADA, SECA_GRAVE, SECA_EXTREMA, SECA_EXCEPCIONAL];
    div.innerHTML += "Legenda SPI/SPEI:<br>"
    for (var i = 0; i < grades.length; i++) {
        div.innerHTML += '<i style="background:' + cores[i] + '"></i> ' + grades[i] + "<br>";
    }
    return div;
};
legenda.addTo(mi.mapa);

function escala_alpha(spi) {
    let spi_abs = Math.abs(spi);
    if (spi_abs < LIMIAR_FRACA) {
        return 0;
    }
    else if (spi_abs < LIMIAR_MODERADA) {
        return 0.2 * ALPHA_MAX;
    }
    else if (spi_abs < LIMIAR_GRAVE) {
        return 0.4 * ALPHA_MAX;
    }
    else if (spi_abs < LIMIAR_EXTREMA) {
        return 0.6 * ALPHA_MAX;
    }
    else if (spi_abs < LIMIAR_EXCEPCIONAL) {
        return 0.8 * ALPHA_MAX;
    }
    else {
        return ALPHA_MAX;
    }
}

function escala_cores(spi) {
    if (spi < 0) {
        if (spi > -LIMIAR_MODERADA) {
            return SECA_FRACA;
        }
        else if (spi > -LIMIAR_GRAVE) {
            return SECA_MODERADA;
        }
        else if (spi > -LIMIAR_EXTREMA) {
            return SECA_GRAVE;
        }
        else if (spi > -LIMIAR_EXCEPCIONAL) {
            return SECA_EXTREMA;
        }
        else {
            return SECA_EXCEPCIONAL;
        }
    }

    else {
        if (spi < LIMIAR_MODERADA) {
            return CHUVA_FRACA;
        }
        else if (spi < LIMIAR_GRAVE) {
            return CHUVA_MODERADA;
        }
        else if (spi < LIMIAR_EXTREMA) {
            return CHUVA_GRAVE;
        }
        else if (spi < LIMIAR_EXCEPCIONAL) {
            return CHUVA_EXTREMA;
        }
        else {
            return CHUVA_EXCEPCIONAL;
        }
    }
}

async function interpolacao_inverso_distancia(dados) {
    let dados_interpolacao = Array.from(Array(mi.COLUNAS_MATRIZ), () => Array.from(Array(mi.LINHAS_MATRIZ), () => new Array(4)));

    for (let coluna = 0; coluna < mi.COLUNAS_MATRIZ; coluna++) {
        for (let linha = 0; linha < mi.LINHAS_MATRIZ; linha++) {
            if (coluna === 0 && linha === 0) {
                dados_interpolacao[coluna][linha][0] = dados_interpolacao[coluna][linha][1] = dados_interpolacao[coluna][linha][2] = dados_interpolacao[coluna][linha][3] = dados[coluna][linha];
                //canto superior esquerdo
            }

            else if (coluna === mi.COLUNAS_MATRIZ - 1 && linha === 0) {
                //canto superior direito
                dados_interpolacao[coluna][linha][0] = dados_interpolacao[coluna][linha][1] = dados_interpolacao[coluna][linha][2] = dados_interpolacao[coluna][linha][3] = dados[coluna][linha];
            }

            else if (coluna === 0 && linha === mi.LINHAS_MATRIZ - 1) {
                //canto inferior esquerdo
                dados_interpolacao[coluna][linha][0] = dados_interpolacao[coluna][linha][1] = dados_interpolacao[coluna][linha][2] = dados_interpolacao[coluna][linha][3] = dados[coluna][linha];
            }

            else if (coluna === mi.COLUNAS_MATRIZ - 1 && linha === mi.LINHAS_MATRIZ - 1) {
                //canto inferior direito
                dados_interpolacao[coluna][linha][0] = dados_interpolacao[coluna][linha][1] = dados_interpolacao[coluna][linha][2] = dados_interpolacao[coluna][linha][3] = dados[coluna][linha];
            }

            else if (linha === 0) {
                //topo
                dados_interpolacao[coluna][linha][0] = dados_interpolacao[coluna][linha][1] = dados_interpolacao[coluna][linha][2] = dados_interpolacao[coluna][linha][3] = dados[coluna][linha];
            }

            else if (linha === mi.LINHAS_MATRIZ - 1) {
                //base
                dados_interpolacao[coluna][linha][0] = dados_interpolacao[coluna][linha][1] = dados_interpolacao[coluna][linha][2] = dados_interpolacao[coluna][linha][3] = dados[coluna][linha];
            }

            else if (coluna === 0) {
                //esquerda
                dados_interpolacao[coluna][linha][0] = dados_interpolacao[coluna][linha][1] = dados_interpolacao[coluna][linha][2] = dados_interpolacao[coluna][linha][3] = dados[coluna][linha];
            }

            else if (coluna === mi.COLUNAS_MATRIZ - 1) {
                //direita
                dados_interpolacao[coluna][linha][0] = dados_interpolacao[coluna][linha][1] = dados_interpolacao[coluna][linha][2] = dados_interpolacao[coluna][linha][3] = dados[coluna][linha];
            }

            else {
                //resto
                //horrivel, mas funciona
                dados_interpolacao[coluna][linha][0] = 0.267 * dados[coluna][linha] + 0.169 * dados[coluna][linha - 1] + 0.169 * dados[coluna - 1][linha]
                    + 0.089 * dados[coluna - 1][linha - 1] + 0.064 * dados[coluna + 1][linha - 1] + 0.064 * dados[coluna - 1][linha + 1] +
                    0.074 * dados[coluna][linha + 1] + 0.074 * dados[coluna + 1][linha] + 0.053 * dados[coluna + 1][linha + 1];

                dados_interpolacao[coluna][linha][1] = 0.267 * dados[coluna][linha] + 0.169 * dados[coluna][linha - 1] + 0.169 * dados[coluna + 1][linha]
                    + 0.089 * dados[coluna + 1][linha - 1] + 0.064 * dados[coluna + 1][linha + 1] + 0.064 * dados[coluna - 1][linha - 1] +
                    0.074 * dados[coluna][linha + 1] + 0.074 * dados[coluna - 1][linha] + 0.053 * dados[coluna - 1][linha + 1];

                dados_interpolacao[coluna][linha][2] = 0.267 * dados[coluna][linha] + 0.169 * dados[coluna - 1][linha] + 0.169 * dados[coluna][linha + 1]
                    + 0.089 * dados[coluna - 1][linha + 1] + 0.064 * dados[coluna + 1][linha + 1] + 0.064 * dados[coluna - 1][linha - 1] +
                    0.074 * dados[coluna][linha - 1] + 0.074 * dados[coluna + 1][linha] + 0.053 * dados[coluna + 1][linha - 1];

                dados_interpolacao[coluna][linha][3] = 0.267 * dados[coluna][linha] + 0.169 * dados[coluna + 1][linha] + 0.169 * dados[coluna][linha + 1]
                    + 0.089 * dados[coluna + 1][linha + 1] + 0.064 * dados[coluna - 1][linha + 1] + 0.064 * dados[coluna + 1][linha - 1] +
                    0.074 * dados[coluna - 1][linha] + 0.074 * dados[coluna][linha - 1] + 0.053 * dados[coluna - 1][linha - 1];
            }
        }
    }
    return dados_interpolacao;
}


function dados_interpolacao_quadrante_para_2d(dados_interpolacao){
    let dados_interpolacao_2d = Array.from(Array(2 * mi.COLUNAS_MATRIZ), () => new Array(2 * mi.LINHAS_MATRIZ));

    for (let longitude = mi.LONGITUDE_MIN; longitude < mi.LONGITUDE_MAX; longitude += mi.ARESTA) {
        let coluna_atual = Math.round((longitude - mi.LONGITUDE_MIN) / mi.ARESTA);
        for (let latitude = mi.LATITUDE_MIN; latitude < mi.LATITUDE_MAX; latitude += mi.ARESTA) {
            let linha_atual = Math.round((latitude - mi.LATITUDE_MIN) / mi.ARESTA);
            let spi_quadrante = dados_interpolacao[coluna_atual][linha_atual];
            dados_interpolacao_2d[coluna_atual * 2][linha_atual * 2] = spi_quadrante[0];
            dados_interpolacao_2d[coluna_atual * 2 + 1][linha_atual * 2] = spi_quadrante[1];
            dados_interpolacao_2d[coluna_atual * 2][linha_atual * 2 + 1] = spi_quadrante[2];
            dados_interpolacao_2d[coluna_atual * 2 + 1][linha_atual * 2 + 1] = spi_quadrante[3];
        }
    }
    return dados_interpolacao_2d;
}

async function gerar_quadrantes(dados_interpolacao_2d) {
    mi.mapa.eachLayer((layer) => {
        if (layer.toGeoJSON) {
            mi.mapa.removeLayer(layer);
        }
    });

    for (let longitude = mi.LONGITUDE_MIN; longitude < mi.LONGITUDE_MAX - (mi.ARESTA/2); longitude += (mi.ARESTA / 2)) {
        let coluna = Math.round((longitude - mi.LONGITUDE_MIN) / (mi.ARESTA / 2));
        for (let latitude = mi.LATITUDE_MIN; latitude < mi.LATITUDE_MAX; latitude += (mi.ARESTA / 2)) {
            let linha = Math.round((latitude - mi.LATITUDE_MIN) / (mi.ARESTA / 2));
            let spi_quadrante = dados_interpolacao_2d[coluna][linha];
            let quadrante = {
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[longitude - mi.ARESTA / 4, latitude + mi.ARESTA / 4],
                    [longitude + mi.ARESTA / 4, latitude + mi.ARESTA / 4],
                    [longitude + mi.ARESTA / 4, latitude - mi.ARESTA / 4],
                    [longitude - mi.ARESTA / 4, latitude - mi.ARESTA / 4]]]
                }
            }
            let camada_quadrante = L.geoJSON(quadrante).addTo(mi.mapa);
            camada_quadrante.bindPopup(`Latitude:${latitude.toFixed(2)}<br>Longitude:${longitude.toFixed(2)}<br>SPI:${spi_quadrante.toFixed(2)}`);
            camada_quadrante.setStyle({
                weight: "0.2",
                smoothFactor: "3",
                fillOpacity: escala_alpha(spi_quadrante).toString(),
                opacity: escala_alpha(spi_quadrante).toString(),
                color: escala_cores(spi_quadrante),
                fillColor: escala_cores(spi_quadrante)
            });
        }
    }
}

botao_gerar.onclick = async () => {
    if (input_data.value === "") {
        return;
    }

    document.getElementById("info_alerta").innerHTML = "";

    //gerar coloração no mapa
    botao_gerar.disabled = true;
    let dados = await lj.pescar_dados(input_spi.value.toString().padStart(2, '0') + input_data.value.substring(0, 4) + input_data.value.substring(5, 7));
    let dados_interpolacao = await interpolacao_inverso_distancia(dados);
    let dados_interpolacao_2d = dados_interpolacao_quadrante_para_2d(dados_interpolacao);
    gerar_quadrantes(dados_interpolacao_2d);
    botao_gerar.disabled = false;

    //gerar relatório
    let estados_alerta = ae.analisar_estados(dados_interpolacao_2d);
    ae.adicionar_sinais(estados_alerta);
}

window.onload = enviar_dados_relatorio();

async function enviar_dados_relatorio(){
    let json_relatorio = {
        ano: "",
        mes: "",
        spi1:{
            seca:[],
            chuva:[]
        },
        spi12: {
            seca:[],
            chuva:[]
        }
    }

    let data_ultimo_email_json = await fetch("data_ultimo_email.json");
    let data_ultimo_email = JSON.parse(await data_ultimo_email_json.text());
    let proximo_mes = data_ultimo_email["mes"] + 1;
    let proximo_ano = data_ultimo_email["ano"];
    if(proximo_mes === 13){
        proximo_mes = 1;
        proximo_ano += 1
    }

    json_relatorio.ano = String(proximo_ano);
    json_relatorio.mes = String(proximo_mes).padStart(2,0);
    try{
        let dados_spi1 = await lj.pescar_dados("01" + String(proximo_ano) + String(proximo_mes).padStart(2,0));
        let dados_interpolados_spi1 = await interpolacao_inverso_distancia(dados_spi1);
        let dados_interpolados_2d_spi1 = dados_interpolacao_quadrante_para_2d(dados_interpolados_spi1);
        let estados_alerta_spi1 = ae.analisar_estados(dados_interpolados_2d_spi1);
        let dados_spi12 = await lj.pescar_dados("12" + String(proximo_ano) + String(proximo_mes).padStart(2,0));
        let dados_interpolados_spi12 = await interpolacao_inverso_distancia(dados_spi12);
        let dados_interpolados_2d_spi12 = dados_interpolacao_quadrante_para_2d(dados_interpolados_spi12);
        let estados_alerta_spi12 = ae.analisar_estados(dados_interpolados_2d_spi12);

        //não quero guardar no relatório a geometria de cada municipio

        estados_alerta_spi1.seca.forEach(estado => {
            json_relatorio.spi1.seca.push(estado.properties)
        })

        estados_alerta_spi1.chuva.forEach(estado => {
            json_relatorio.spi1.chuva.push(estado.properties)
        })

        estados_alerta_spi12.seca.forEach(estado => {
            json_relatorio.spi12.seca.push(estado.properties)
        })

        estados_alerta_spi12.chuva.forEach(estado => {
            json_relatorio.spi12.chuva.push(estado.properties)
        })

        await fetch("enviar_emails.php", {
            method: "POST",
            headers: {
            'Content-Type': 'application/json' 
            },
            body: JSON.stringify(json_relatorio)
        }).
        then(resposta => resposta.text()).
        then(mensagem => console.log(mensagem));

    }
    catch(e){
        console.log("ja esta atualizado: + e");
    }
}

