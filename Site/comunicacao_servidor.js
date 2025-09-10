import * as mi from "./mapa_interativo.js";

export const ENDERECO = "localhost";
export const PORTA = "7177";
export var pagina_carregada = false;

export var transferencia = {
    coluna: 0,
    linha: 0,
    sucesso : false
}

var dados_pescados = Array.from(Array(mi.COLUNAS_MATRIZ), () => new Array(mi.LINHAS_MATRIZ));

window.onload = () => {
    pagina_carregada = true;
}


export async function pescar_dados(endereco,porta,mensagem){
    var ws = new WebSocket(`ws://${endereco}:${porta}`);
    var checar_open = new Promise((resolve,reject) => {
        var check = setInterval(() => {
            if(ws.readyState === ws.OPEN){
                clearInterval(check);
                resolve();
            }
        }, 15);
    });
    await checar_open;
    console.log("Abri uma WebSocket!");
    ws.onclose = () => {
        console.log("Fechei a WebSocket :(");
    }
    ws.send(mensagem);
    ws.onmessage = (e) => {
        if(e.data === "acabei"){
            console.log("Comunicação com o servidor acabou!");
            transferencia.sucesso = true;
        }

        else{
            dados_pescados[transferencia.coluna][transferencia.linha] = parseFloat(e.data);
            transferencia.linha++;
            if (transferencia.linha === mi.LINHAS_MATRIZ) {
                transferencia.coluna++;
                transferencia.linha = 0;
            }
            if (transferencia.coluna === mi.COLUNAS_MATRIZ) {
                transferencia.linha = 0;
                transferencia.coluna = 0;
            }
        }
    }
    var checar_recebimento = new Promise((resolve,reject) => {
        var check = setInterval(() => {
            if(transferencia.sucesso){
                clearInterval(check);
                resolve();
            }
        }, 15);
    });
    await checar_recebimento;
    return dados_pescados;
}