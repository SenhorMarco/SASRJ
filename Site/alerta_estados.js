import * as mi from "./mapa_interativo.js";
import * as lj from "./ler_json.js";
import * as ms from "./mascara_spi.js";

let check_pagina_carregada = new Promise((resolve, reject) => {
    let check_intervalo = setInterval(() => {
        if (document.readyState === "complete") {
            resolve();
            clearInterval(check_intervalo);
        }
    }, 20);
});
await check_pagina_carregada;

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
let estados = JSON.parse(await fetch_estados.text())
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

estados.features.forEach(estado =>{
    console.log(estado.properties.name + ": " + estado.geometry.pontos_contidos);
})




