import * as mi from "./mapa_interativo.js";

export var pagina_carregada = false;

window.onload = () => {
    pagina_carregada = true;
}

let coluna_inicial = Math.round((mi.LONGITUDE_MIN - mi.LONGITUDE_MIN_DADOS)/mi.ARESTA);
let linha_inicial = Math.round((mi.LATITUDE_MIN - mi.LATITUDE_MIN_DADOS)/mi.ARESTA);
let coluna_final = Math.round((mi.LONGITUDE_MAX - mi.LONGITUDE_MIN_DADOS)/mi.ARESTA);
let linha_final = Math.round((mi.LATITUDE_MAX - mi.LATITUDE_MIN_DADOS)/mi.ARESTA);

export async function pescar_dados(mensagem){
    let spi = mensagem.substring(0,2);
    let ano = mensagem.substring(2,6);
    let mes = mensagem.substring(6,8);


    let json_leitura = await fetch(`DadosJSON/spi_gamma_${spi}/spi_gamma_${spi}_${ano}-${mes}.json`);
    let dados_pescados = JSON.parse(await json_leitura.text())[`spi_gamma_${spi}`];
    var dados_corrigidos = Array.from(Array(mi.COLUNAS_MATRIZ), () => new Array(mi.LINHAS_MATRIZ));
    
    for (let coluna = 0; coluna < mi.COLUNAS_MATRIZ; coluna++){
        for (let linha = 0; linha < mi.LINHAS_MATRIZ; linha++) {
            dados_corrigidos[coluna][linha] = dados_pescados[linha][coluna];
        }
    }

    return dados_corrigidos;
}