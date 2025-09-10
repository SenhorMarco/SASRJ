import xarray as xr
import numpy as np
from websockets.sync.server import serve

LONGITUDE_MIN = -46.05
LONGITUDE_MAX = -40.05
LATITUDE_MAX = -20.85
LATITUDE_MIN = -24.85
ARESTA = 0.1
COLUNAS_MATRIZ = (LONGITUDE_MAX - LONGITUDE_MIN)/ARESTA
LINHAS_MATRIZ = (LATITUDE_MAX - LATITUDE_MIN)/ARESTA
HOST = "localhost"
PORT = 7177


def enviar_dados(websocket):
    #estrutura da mensagem: "xxaaaammdd"
    #xx = range do spi: 01,03,06...
    #aaaa = ano
    #mm = mes
    #dd = dia

    mensagem = websocket.recv()
    alcance_spi = mensagem[0:2]
    ano = mensagem[2:6]
    mes = mensagem[6:8]
    dia = mensagem[8:10]
    
    dataset = xr.open_dataset(
        r"Site/Dados/MERGE_CPTEC_spi_gamma_{alcance}.nc".format(alcance=alcance_spi),
        engine="netcdf4"
    )

    data_alvo = "{ano}-{mes}-{dia}".format(ano=ano, mes=mes, dia=dia)
    for longitude in np.linspace(LONGITUDE_MIN,LONGITUDE_MAX, round(COLUNAS_MATRIZ)): 
        for latitude in np.linspace(LATITUDE_MIN, LATITUDE_MAX, round(LINHAS_MATRIZ)): 
            valor_spi = dataset["spi_gamma_{alcance}".format(alcance=alcance_spi)].sel(
                lat=latitude,
                lon=longitude,
                time=data_alvo,
                method="nearest"
            )
            websocket.send(str(valor_spi.values))
    websocket.send("acabei")
    dataset.close()
    

with serve(enviar_dados, HOST, PORT) as server:
    server.serve_forever()
