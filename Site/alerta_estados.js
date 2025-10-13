import * as mi from "./mapa_interativo.js";

export const SPI_LIMIAR_AVISO = 1.6;
const RAIO_MARCADOR = 0.3;

const MARCADOR_TAMANHO = 30;

let check_pagina_carregada = new Promise((resolve, reject) => {
    let check_intervalo = setInterval(() => {
        if (document.readyState === "complete") {
            resolve();
            clearInterval(check_intervalo);
        }
    }, 20);
});
await check_pagina_carregada;

var alerta_chuva_extrema = L.icon({
    iconUrl:"img/marker_chuva_extrema.png",
    iconSize:[MARCADOR_TAMANHO,MARCADOR_TAMANHO]
});

var alerta_chuva_excepcional = L.icon({
    iconUrl:"img/marker_chuva_excepcional.png",
    iconSize:[MARCADOR_TAMANHO,MARCADOR_TAMANHO]
});

var alerta_seca_extrema = L.icon({
    iconUrl:"img/marker_seca_extrema.png",
    iconSize:[MARCADOR_TAMANHO,MARCADOR_TAMANHO]
});

var alerta_seca_excepcional = L.icon({
    iconUrl:"img/marker_seca_excepcional.png",
    iconSize:[MARCADOR_TAMANHO,MARCADOR_TAMANHO]
});

function distancia_pontos(lon1, lat1, lon2, lat2){
    return Math.sqrt(Math.pow(lon1-lon2,2) + Math.pow(lat1-lat2,2));
}

function ponto_interno(lon, lat, poligono) {
    var interno = false;
    var x = lon, y = lat;
    var coordenadas_poligono = poligono.geometry.coordinates[0];

    for (var i = 0, j = coordenadas_poligono.length - 1; i < coordenadas_poligono.length; j = i++) {
        var xi = coordenadas_poligono[i][0], yi = coordenadas_poligono[i][1];
        var xj = coordenadas_poligono[j][0], yj = coordenadas_poligono[j][1];

        var intercepta = ((yi > y) != (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intercepta){
          interno = !interno;
        }
    }
    return interno;
}

let fetch_estados = await fetch('geojs-33-mun.json');
export let estados = JSON.parse(await fetch_estados.text())
delete estados.type;
estados.features.forEach(estado => {
    estado.geometry.pontos_contidos = [];
    delete estado.type;
});

for (let longitude = mi.LONGITUDE_MIN; longitude < mi.LONGITUDE_MAX; longitude += (mi.ARESTA / 2)) {
    let coluna = Math.round((longitude - mi.LONGITUDE_MIN) / (mi.ARESTA / 2));
    for (let latitude = mi.LATITUDE_MIN; latitude < mi.LATITUDE_MAX; latitude += (mi.ARESTA / 2)) {
        let linha = Math.round((latitude - mi.LATITUDE_MIN) / (mi.ARESTA / 2));
        estados.features.forEach(estado => {
            if(ponto_interno(longitude,latitude, estado)){
                estado.geometry.pontos_contidos.push([coluna, linha]);
            }
        });
    }
}

export function analisar_estados(dados){
    let estados_alerta = {
        seca: [],
        chuva: []
    }

    estados.features.forEach(estado => {
        estado.spi_max = 0;
        estado.spi_min = 0;
        estado.geometry.pontos_contidos.forEach(ponto => {

            if(dados[ponto[0]][ponto[1]] > estado.spi_max){
                estado.spi_max = dados[ponto[0]][ponto[1]];
            }
            else if(dados[ponto[0]][ponto[1]] < estado.spi_min){
                estado.spi_min = dados[ponto[0]][ponto[1]];
            }

            if(estado.spi_max > SPI_LIMIAR_AVISO && !estados_alerta.chuva.includes(estado)){
                estados_alerta.chuva.push(estado);
                estado.geometry.ponto_maximo = [ponto[0],ponto[1]];
            }
            else if(estado.spi_min < -SPI_LIMIAR_AVISO && !estados_alerta.seca.includes(estado)){
                estados_alerta.seca.push(estado);
                estado.geometry.ponto_minimo = [ponto[0],ponto[1]];
            }
        });
    });
    console.log(estados_alerta);
    return estados_alerta;
}

function click_alerta() {
    console.log("Oi");
    let area_texto = document.getElementById("info_alerta");
    area_texto.innerHTML += "oi";
}
//fiquei sem saco
export function adicionar_sinais(estados){
    let marcadores_seca = [];
    let marcadores_chuva = [];
    //marcadores para seca
    estados.seca.forEach(estado => {
        let lon = mi.LONGITUDE_MIN + (mi.ARESTA/2)*estado.geometry.ponto_minimo[0];
        let lat = mi.LATITUDE_MIN + (mi.ARESTA/2)*estado.geometry.ponto_minimo[1];
        let isolado = true;
        let removido = false;
        marcadores_seca.forEach(marcador =>{
            if(distancia_pontos(lon, lat, marcador.getLatLng().lng, marcador.getLatLng().lat) < RAIO_MARCADOR && !removido){
                isolado = false;
                removido = true;
                marcador.estados.push(estado.properties.name);
            }

        })
        if(isolado){
            if(estado.spi_min > -2){
                let marcador_atual = L.marker([lat, lon], {icon: alerta_seca_extrema}).addTo(mi.mapa);
                marcador_atual.estados = [];
                marcador_atual.estados.push(estado.properties.name);
                marcador_atual.on("click", () => {
                    let area_texto = document.getElementById("info_alerta");
                    area_texto.innerHTML = `
                    <img src="img/marker_seca_extrema.png" width="100px" height="100px" style="
                    display: block;
                    margin-left: auto;
                    margin-right: auto;"></img><br>
                    Coordenadas: Latitude ${lat.toFixed(2)}° Longitude ${lon.toFixed(2)}° <br>
                    Situação: Seca extrema<br>
                    SPI na região: ${estado.spi_min.toFixed(2)}<br>
                    Municípios afetados: ${marcador_atual.estados}
                    `;
                });
                marcador_atual.bindTooltip("Seca extrema");
                marcadores_seca.push(marcador_atual);
            }
            else{
                let marcador_atual = L.marker([lat, lon], {icon: alerta_seca_excepcional}).addTo(mi.mapa);
                marcador_atual.estados = [];
                marcador_atual.estados.push(estado.properties.name);
                marcador_atual.bindTooltip("Seca excepcional");
                marcador_atual.on("click", () => {
                    let area_texto = document.getElementById("info_alerta");
                    area_texto.innerHTML = `
                    <img src="img/marker_seca_excepcional.png" width="100px" height="100px" style="
                    display: block;
                    margin-left: auto;
                    margin-right: auto;"></img><br>
                    Coordenadas: Latitude ${lat.toFixed(2)}° Longitude ${lon.toFixed(2)}° <br>
                    Situação: Seca excepcional<br>
                    SPI na região: ${estado.spi_min.toFixed(2)}<br>
                    Municípios afetados: ${marcador_atual.estados}
                    `;
                });
                marcadores_seca.push(marcador_atual);
            }
        }
    });

    //marcadores para chuva
    estados.chuva.forEach(estado => {
        let lon = mi.LONGITUDE_MIN + (mi.ARESTA/2)*estado.geometry.ponto_maximo[0];
        let lat = mi.LATITUDE_MIN + (mi.ARESTA/2)*estado.geometry.ponto_maximo[1];
        let isolado = true;
        let removido = false;
        marcadores_chuva.forEach(marcador =>{
            marcador.marcadores_removidos = [];
            if(distancia_pontos(lon, lat, marcador.getLatLng().lng, marcador.getLatLng().lat) < RAIO_MARCADOR && !removido){
                isolado = false;
                removido = true;
                marcador.estados.push(estado.properties.name);

            }
        })
        if(isolado){
            if(estado.spi_max < 2){
                let marcador_atual = L.marker([lat, lon], {icon: alerta_chuva_extrema}).addTo(mi.mapa);
                marcador_atual.estados = [];
                marcador_atual.estados.push(estado.properties.name);
                marcador_atual.bindTooltip("Chuva extrema");
                marcador_atual.on("click", () => {
                    let area_texto = document.getElementById("info_alerta");
                    area_texto.innerHTML = `
                    <img src="img/marker_chuva_extrema.png" width="100px" height="100px" style="
                    display: block;
                    margin-left: auto;
                    margin-right: auto;"></img><br>
                    Coordenadas: Latitude ${lat.toFixed(2)}° Longitude ${lon.toFixed(2)}° <br>
                    Situação: Chuva extrema<br>
                    SPI na região: ${estado.spi_max.toFixed(2)}<br>
                    Municípios afetados: ${marcador_atual.estados}
                    `;
                });
                marcadores_chuva.push(marcador_atual);
            }
            else{
                let marcador_atual = L.marker([lat, lon], {icon: alerta_chuva_excepcional}).addTo(mi.mapa);
                marcador_atual.estados = [];
                marcador_atual.estados.push(estado.properties.name);
                marcador_atual.bindTooltip("Chuva excepcional");
                marcador_atual.on("click", () => {
                    let area_texto = document.getElementById("info_alerta");
                    area_texto.innerHTML = `
                    <img src="img/marker_chuva_excepcional.png" width="100px" height="100px" style="
                    display: block;
                    margin-left: auto;
                    margin-right: auto;"></img><br>
                    Coordenadas: Latitude ${lat.toFixed(2)}° Longitude ${lon.toFixed(2)}° <br>
                    Situação: Chuva excepcional<br>
                    SPI na região: ${estado.spi_max.toFixed(2)}<br>
                    Municípios afetados: ${marcador_atual.estados}
                    `;
                });
                marcadores_chuva.push(marcador_atual);
            }
        }
    });
}



