import * as cs from "./comunicacao_servidor.js";
import * as mi from "./mapa_interativo.js";

export var interpolacao = true;
export var dados_recebidos

export const ALPHA_MAX = 0.6;

const SECA_FRACA = "#ffc400";
const SECA_MODERADA = "#cf903e";
const SECA_GRAVE = "#e06a1b";
const SECA_EXTREMA = "#d61f06";
const SECA_EXCEPCIONAL = "#471407";

const CHUVA_FRACA = "#40e0d0";       // turquesa claro
const CHUVA_MODERADA = "#2ba580";    // verde-azulado médio
const CHUVA_GRAVE = "#1b7cd6";       // azul forte
const CHUVA_EXTREMA = "#0635d6";     // azul profundo
const CHUVA_EXCEPCIONAL = "#2e1ca4ff"; // azul-marinho quase preto




class Quadrante {
    constructor(longitude, latitude, spi) {
        this.longitude = longitude;
        this.latitude = latitude;
        this.spi = spi;

    }

}

/*
    estrutura da mensagem: "xxaaaammdd"
    xx = range do spi: 01,03,06...
    aaaa = ano
    mm = mes
    dd = dia
*/
var dados = await cs.pescar_dados(cs.ENDERECO, cs.PORTA, "0620250607");

var dados_interpolacao = Array.from(Array(mi.COLUNAS_MATRIZ), () => Array.from(Array(mi.LINHAS_MATRIZ), () => new Array(4)));
var dados_interpolacao_teste = Array.from(Array(2 * mi.COLUNAS_MATRIZ), () => new Array(2 * mi.LINHAS_MATRIZ));



function escala_alpha(spi) {
    var spi_abs = Math.abs(spi);
    if(spi_abs < 0.5){
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
        if (spi < -0.8) {
            return SECA_FRACA;
        }
        else if (spi < -1.3) {
            return SECA_MODERADA;
        }
        else if (spi < -1.6) {
            return SECA_GRAVE;
        }
        else if (spi < -2) {
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
    for (var coluna = 0; coluna < mi.COLUNAS_MATRIZ; coluna++) {
        for (var linha = 0; linha < mi.LINHAS_MATRIZ; linha++) {
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
    for (var longitude = mi.LONGITUDE_MIN; longitude <= mi.LONGITUDE_MAX; longitude += mi.ARESTA) {
        var coluna_atual = Math.round((longitude - mi.LONGITUDE_MIN) / mi.ARESTA);
        for (var latitude = mi.LATITUDE_MIN; latitude <= mi.LATITUDE_MAX; latitude += mi.ARESTA) {
            var linha_atual = Math.round((latitude - mi.LATITUDE_MIN) / mi.ARESTA);
            var spi_quadrante = dados_interpolacao[coluna_atual][linha_atual];

            dados_interpolacao_teste[coluna_atual * 2][linha_atual * 2] = spi_quadrante[0];
            dados_interpolacao_teste[coluna_atual * 2 + 1][linha_atual * 2] = spi_quadrante[1];
            dados_interpolacao_teste[coluna_atual * 2][linha_atual * 2 + 1] = spi_quadrante[2];
            dados_interpolacao_teste[coluna_atual * 2 + 1][linha_atual * 2 + 1] = spi_quadrante[3];
        }
    }

    for (var longitude = mi.LONGITUDE_MIN; longitude <= mi.LONGITUDE_MAX; longitude += mi.ARESTA / 2) {
        var coluna = Math.round((longitude - mi.LONGITUDE_MIN) / (mi.ARESTA / 2));
        for (var latitude = mi.LATITUDE_MIN; latitude <= mi.LATITUDE_MAX; latitude += mi.ARESTA / 2) {
            var linha = Math.round((latitude - mi.LATITUDE_MIN) / (mi.ARESTA / 2));
            var spi_quadrante = dados_interpolacao_teste[coluna][linha];
            var quadrante = {
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [[[longitude - mi.ARESTA / 4, latitude + mi.ARESTA / 4],
                    [longitude + mi.ARESTA / 4, latitude + mi.ARESTA / 4],
                    [longitude + mi.ARESTA / 4, latitude - mi.ARESTA / 4],
                    [longitude - mi.ARESTA / 4, latitude - mi.ARESTA / 4]]]
                }
            }
            var camada_quadrante = L.geoJSON(quadrante).addTo(mi.mapa);
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
}
dados_interpolacao = await interpolacao_inverso_distancia(dados);
console.log(dados_interpolacao);
console.log(dados_interpolacao_teste);
gerar_quadrantes();