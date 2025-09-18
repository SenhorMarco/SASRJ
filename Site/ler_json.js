import * as mi from "./mapa_interativo.js";

export var pagina_carregada = false;

export var transferencia = {
    coluna: 0,
    linha: 0,
    sucesso : false
}

var dados_pescados;
var dados_corrigidos = Array.from(Array(mi.COLUNAS_MATRIZ), () => new Array(mi.LINHAS_MATRIZ));

window.onload = () => {
    pagina_carregada = true;
}

let coluna_inicial = Math.round((mi.LONGITUDE_MIN - mi.LONGITUDE_MIN_DADOS)/mi.ARESTA);
let linha_inicial = Math.round((mi.LATITUDE_MIN - mi.LATITUDE_MIN_DADOS)/mi.ARESTA);
let coluna_final = Math.round((mi.LONGITUDE_MAX - mi.LONGITUDE_MIN_DADOS)/mi.ARESTA);
let linha_final = Math.round((mi.LATITUDE_MAX - mi.LATITUDE_MIN_DADOS)/mi.ARESTA);

export async function pescar_dados(mensagem){
    transferencia.sucesso = false;
    let spi = mensagem.substring(0,2);
    let ano = mensagem.substring(2,6);
    let mes = mensagem.substring(6,8);
    console.log(spi + " " + ano + " " +mes);

    let json_leitura = await fetch(`DadosJSON/spi_gamma_${spi}/spi_gamma_${spi}_${ano}-${mes}.json`);
    dados_pescados = JSON.parse(await json_leitura.text())[`spi_gamma_${spi}`];
    

    //HORRÍVEL mas ta dando certo então por mim tudo bem....
    //Se for mudar qualquer coisa isso aqui tem que mudar também :P
    
    dados_pescados.splice(0, linha_inicial-7); //7???
    dados_pescados.splice(mi.LINHAS_MATRIZ);
    dados_pescados.forEach((valor) => {
        valor.splice(0, coluna_inicial);
        valor.splice(mi.COLUNAS_MATRIZ);
    })
    
    for (let coluna = 0; coluna < mi.COLUNAS_MATRIZ; coluna++){
        for (let linha = 0; linha < mi.LINHAS_MATRIZ; linha++) {
            dados_corrigidos[coluna][linha] = dados_pescados[linha][coluna];
        }
    }

    return dados_corrigidos;
}