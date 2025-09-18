import * as cs from "./comunicacao_servidor.js";
import * as mi from "./mapa_interativo.js";
import * as lj from "./ler_json.js";

export var interpolacao = true;
export var dados_recebidos

export const ALPHA_MAX = 0.7;

const SECA_FRACA = "#f1c329ff";
const SECA_MODERADA = "#d79846ff";
const SECA_GRAVE = "#e06a1b";
const SECA_EXTREMA = "#d61f06";
const SECA_EXCEPCIONAL = "#af0303ff";

const CHUVA_FRACA = "#16ffe8ff";
const CHUVA_MODERADA = "#239271ff";
const CHUVA_GRAVE = "#1b7cd6";
const CHUVA_EXTREMA = "#0635d6";
const CHUVA_EXCEPCIONAL = "#28198fff";

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

/*
    estrutura da mensagem: "xxaaaammdd"
    xx = range do spi: 01,03,06...
    aaaa = ano
    mm = mes
    dd = dia
*/

let dados;
let dados_interpolacao = Array.from(Array(mi.COLUNAS_MATRIZ), () => Array.from(Array(mi.LINHAS_MATRIZ), () => new Array(4)));
let dados_interpolacao_teste = Array.from(Array(2 * mi.COLUNAS_MATRIZ), () => new Array(2 * mi.LINHAS_MATRIZ));

function escala_alpha(spi) {
    let spi_abs = Math.abs(spi);
    if (spi_abs < 0.5) {
        return 0;
    }
    else if (spi_abs < 0.8) {
        return 0.2 * ALPHA_MAX;
    }
    else if (spi_abs < 1.3) {
        return 0.4 * ALPHA_MAX;
    }
    else if (spi_abs < 1.6) {
        return 0.6 * ALPHA_MAX;
    }
    else if (spi_abs < 2) {
        return 0.8 * ALPHA_MAX;
    }
    else {
        return ALPHA_MAX;
    }
}

function escala_cores(spi) {
    if (spi < 0) {
        if (spi > -0.8) {
            return SECA_FRACA;
        }
        else if (spi > -1.3) {
            return SECA_MODERADA;
        }
        else if (spi > -1.6) {
            return SECA_GRAVE;
        }
        else if (spi > -2) {
            return SECA_EXTREMA;
        }
        else {
            return SECA_EXCEPCIONAL;
        }
    }

    else {
        if (spi < -0.8) {
            return CHUVA_FRACA;
        }
        else if (spi < -1.3) {
            return CHUVA_MODERADA;
        }
        else if (spi < -1.6) {
            return CHUVA_GRAVE;
        }
        else if (spi < -2) {
            return CHUVA_EXTREMA;
        }
        else {
            return CHUVA_EXCEPCIONAL;
        }
    }
}

async function interpolacao_inverso_distancia(dados) {
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
                //horrivel, morra: mas DEVE funcionar
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



async function gerar_quadrantes() {
    mi.mapa.eachLayer((layer) => {
        if (layer.toGeoJSON) {
            mi.mapa.removeLayer(layer);
        }
    });

    for (let longitude = mi.LONGITUDE_MIN; longitude < mi.LONGITUDE_MAX; longitude += mi.ARESTA) {
        let coluna_atual = Math.round((longitude - mi.LONGITUDE_MIN) / mi.ARESTA);
        console.log(coluna_atual);
        for (let latitude = mi.LATITUDE_MIN; latitude < mi.LATITUDE_MAX; latitude += mi.ARESTA) {
            let linha_atual = Math.round((latitude - mi.LATITUDE_MIN) / mi.ARESTA);
            let spi_quadrante = dados_interpolacao[coluna_atual][linha_atual];

            dados_interpolacao_teste[coluna_atual * 2][linha_atual * 2] = spi_quadrante[0];
            dados_interpolacao_teste[coluna_atual * 2 + 1][linha_atual * 2] = spi_quadrante[1];
            dados_interpolacao_teste[coluna_atual * 2][linha_atual * 2 + 1] = spi_quadrante[2];
            dados_interpolacao_teste[coluna_atual * 2 + 1][linha_atual * 2 + 1] = spi_quadrante[3];
        }
    }

    for (let longitude = mi.LONGITUDE_MIN; longitude < mi.LONGITUDE_MAX; longitude += (mi.ARESTA / 2)) {
        let coluna = Math.round((longitude - mi.LONGITUDE_MIN) / (mi.ARESTA / 2));
        for (let latitude = mi.LATITUDE_MIN; latitude < mi.LATITUDE_MAX; latitude += (mi.ARESTA / 2)) {
            let linha = Math.round((latitude - mi.LATITUDE_MIN) / (mi.ARESTA / 2));
            let spi_quadrante = dados_interpolacao_teste[coluna][linha];
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
            camada_quadrante.setStyle({
                weight: "0.1",
                smoothFactor: "3",
                fillOpacity: escala_alpha(spi_quadrante).toString(),
                opacity: escala_alpha(spi_quadrante).toString(),
                color: escala_cores(spi_quadrante),
                fillColor: escala_cores(spi_quadrante)
            });
        }
    }
    return 1;
}

botao_gerar.onclick = async () => {
    if(input_data.value === ""){
        return;
    }
    botao_gerar.disabled = true;
    dados = await lj.pescar_dados(input_spi.value.toString().padStart(2, '0') + input_data.value.substring(0, 4) + input_data.value.substring(5, 7) + input_data.value.substring(8));
    dados_interpolacao = await interpolacao_inverso_distancia(dados);
    gerar_quadrantes();
    botao_gerar.disabled = false;
}