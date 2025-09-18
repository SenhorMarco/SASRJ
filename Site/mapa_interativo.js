//gera o mapa interativo em si
//não participa da geração da máscara de dados

export const LONGITUDE_INICIAL = -22;
export const LATITUDE_INICIAL = -42;
export const ZOOM_INICIAL = 8;
export const LONGITUDE_MIN = -46.05;
export const LONGITUDE_MAX = -40.05;
export const LATITUDE_MIN = -24.85;
export const LATITUDE_MAX = -20.85;
export const LONGITUDE_MIN_DADOS = -85.05;  //long min dos dados: -85.05
export const LONGITUDE_MAX_DADOS = -30.05; //long max dos dados: -30.05
export const LATITUDE_MIN_DADOS = -56.85; //lat max dos dados: -56.15
export const LATITUDE_MAX_DADOS = 12.85; //lat min dos dados: 12.85
export const ARESTA = 0.1; //realmente constante, determinada pela precisão dos dados
export const COLUNAS_MATRIZ = (LONGITUDE_MAX - LONGITUDE_MIN) / ARESTA;
export const LINHAS_MATRIZ = (LATITUDE_MAX - LATITUDE_MIN) / ARESTA;
export const ZOOM_MAX = 12;
export const ZOOM_MIN = 8;

export const OFM_ESTILO = "https://tiles.openfreemap.org/styles/liberty";
export const OFM_ATTRIBUTION = "OpenFreeMap © OpenMapTiles Data from OpenStreetMap";

export var mapa = L.map('mapa_interativo', {
  maxZoom: ZOOM_MAX,
  minZoom: ZOOM_MIN,
  maxBounds: [[[LATITUDE_MAX, LONGITUDE_MAX], [LATITUDE_MIN, LONGITUDE_MIN]]],
  maxBoundsViscosity: 1
}).setView([LONGITUDE_INICIAL, LATITUDE_INICIAL], ZOOM_INICIAL);

L.maplibreGL({
  style: OFM_ESTILO,
  attribution: OFM_ATTRIBUTION
}).addTo(mapa);

