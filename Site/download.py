import requests
import os
import datetime
import xarray as xr
import numpy as np
import json

# Esse script não roda durante a utilização do site:
# Ele é pra ser utilizado nos arquivos de dados disponibilizados para que possam ser adicionados à "base de dados"
# Ler diretamente dos arquivos .nc reduz a manutenção necessária mas é devagar demais 
# E complica o processo de despache do site
# SDIYBT

URL_DOWNLOAD = "https://ftp.cptec.inpe.br/modelos/tempo/MERGE/GPM/SPI/"
INTERVALOS_SPI = [1,3,6,9,12,24,48,60]

LONGITUDE_MIN = -46.05
LONGITUDE_MAX = -40.05
LATITUDE_MIN = -24.85
LATITUDE_MAX = -20.85

for intervalo in INTERVALOS_SPI:
    try:
        data_modificacao = os.path.getmtime(f"Dados/MERGE_CPTEC_spi_gamma_{intervalo:02d}.nc")
        string_data_modificacao = str(datetime.datetime.fromtimestamp(data_modificacao))
        string_data_atual = str(datetime.datetime.now())
        if(string_data_modificacao[5:7] == string_data_atual[5:7]):
            print("arquivo " + f"Dados/MERGE_CPTEC_spi_gamma_{intervalo:02d}.nc" + "já está atualizado!!")
            continue
    except:
        print("o arquivo " + f"Dados/MERGE_CPTEC_spi_gamma_{intervalo:02d}.nc" + "ainda nao esta presente")

    url = URL_DOWNLOAD + f"MERGE_CPTEC_spi_gamma_{intervalo:02d}.nc"
    with requests.get(url, stream=True) as r:
        r.raise_for_status()
        with open(f"Dados/MERGE_CPTEC_spi_gamma_{intervalo:02d}.nc", 'wb') as f:
            for chunk in r.iter_content(chunk_size=8192):
                f.write(chunk)
    print("terminei o download do arquivo " + str(intervalo))

print("downloads terminados!!")

for intervalo in INTERVALOS_SPI:
    arquivo_convertido = f"Dados/MERGE_CPTEC_spi_gamma_{intervalo:02d}.nc"
    variavel = f"spi_gamma_{intervalo:02d}"
    pasta = f"DadosJSON/{variavel}"
    os.makedirs(pasta, exist_ok=True)

    dataset = xr.open_dataset(
        arquivo_convertido,
        engine="netcdf4"
    )

    #ENGENHARIA 
    dataset_recortado = dataset.sel(lat=slice(LATITUDE_MIN, LATITUDE_MAX), lon=slice(LONGITUDE_MIN,LONGITUDE_MAX))

    for t in dataset_recortado.coords["time"].values:
        nome_arquivo = os.path.join(pasta+f"/{variavel}_{np.datetime_as_string(t)[0:7]}.json")
        if(os.path.exists(nome_arquivo)):
            print(f"particao {nome_arquivo} ja existe!")
        else:
            dados_t = dataset_recortado[variavel].sel(time=t).fillna(0).values.tolist()
            saida = {
                variavel: dados_t
            }
            with open(nome_arquivo, "w", encoding="utf-8") as f:
                json.dump(saida, f, indent=2)
    print(f"terminei a jsonificação do {intervalo}")

print("acabei tudo :)")