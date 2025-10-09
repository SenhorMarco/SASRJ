let check_pagina_carregada = new Promise((resolve, reject) => {
    let check_intervalo = setInterval(() => {
        if (document.readyState === "complete") {
            resolve();
            clearInterval(check_intervalo);
        }
    }, 20);
});
await check_pagina_carregada;

var botao_puxar = document.getElementById("botao_puxar");
var input_data = document.getElementById("data");
var input_spi = document.getElementById("intervalo");
var mapa_inmet = document.getElementById("mapa_inmet");

export async function puxar_mapa_inmet(mensagem){
  let spi = mensagem.substring(0,2);
  let ano = mensagem.substring(2,6);
  let mes = mensagem.substring(6,8);
  
  let sequencia;
  switch(spi){
    case "01":
      sequencia = 0;
      break;
    case "03":
      sequencia = 1;
      break;
    case "06":
      sequencia = 2;
      break;
    case "12":
      sequencia = 3;
      break;
    case "24":
      sequencia = 4;
      break;
  }

  let json_mapa_inmet = await fetch(`https://apiclima.inmet.gov.br/prec/${ano}/spi/${mes}`);
  let base64 = JSON.parse(await json_mapa_inmet.text())[sequencia]["base64"];
  mapa_inmet.setAttribute("src", base64);
}

botao_puxar.onclick = async () => {
  await puxar_mapa_inmet(input_spi.value.toString().padStart(2, '0') + input_data.value.substring(0, 4) + input_data.value.substring(5, 7) + input_data.value.substring(8));
}



/*const xhr = new XMLHttpRequest();
let imagem = document.getElementById("oi");
xhr.open('GET', 'https://apiclima.inmet.gov.br/prec/2024/spi/11');
xhr.onload = function() {
  if (xhr.status === 200) {
    let link = JSON.parse(xhr.responseText)[0].base64;
    imagem.setAttribute("src", link);
  } else {
    console.error('XHR error:', xhr.statusText);
  }
};
xhr.onerror = function() {
    console.error('XHR request failed');
};
xhr.send();*/