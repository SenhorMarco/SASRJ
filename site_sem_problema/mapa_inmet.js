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


let wrapper = document.querySelector('.mapa-wrapper');
if (!wrapper) {
  wrapper = document.createElement('div');
  wrapper.className = 'mapa-wrapper';

  let parent = mapa_inmet.parentNode;
  parent.insertBefore(wrapper, mapa_inmet);
  wrapper.appendChild(mapa_inmet);
}

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
    default:
      sequencia = 0;
  }

  let json_mapa_inmet = await fetch(`https://apiclima.inmet.gov.br/prec/${ano}/spi/${mes}`);
  let base64 = JSON.parse(await json_mapa_inmet.text())[sequencia]["base64"];
  mapa_inmet.setAttribute("src", base64);
}

botao_puxar.onclick = async () => {

  wrapper.style.transition = 'none';
  wrapper.style.height = '0px';
  void wrapper.offsetWidth;

  const imgLoadPromise = new Promise((resolve) => {
    // remove handlers anteriores para evitar múltiplos.calls
    mapa_inmet.onload = () => resolve(true);
    mapa_inmet.onerror = () => resolve(false);
  });


  await puxar_mapa_inmet(
    input_spi.value.toString().padStart(2, '0') +
    input_data.value.substring(0, 4) +
    input_data.value.substring(5, 7) +
    input_data.value.substring(8)
  );


  const ok = await imgLoadPromise;


  wrapper.style.transition = 'height 800ms ease';

  setTimeout(() => {
    const targetHeight = mapa_inmet.getBoundingClientRect().height;
    wrapper.style.height = `${targetHeight}px`;
  }, 20);

  const onTransitionEnd = (e) => {
    if (e.propertyName === 'height') {
      // remove listener e define auto
      wrapper.removeEventListener('transitionend', onTransitionEnd);
      wrapper.style.height = 'auto';
    }
  };
  wrapper.addEventListener('transitionend', onTransitionEnd);
};
