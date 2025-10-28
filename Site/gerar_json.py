import xarray as xr
import numpy as np
import os
import json

#Descartado, refereir a download.py
# Esse script não roda durante a utilização do site:
# Ele é pra ser utilizado nos arquivos de dados disponibilizados para que possam ser adicionados à "base de dados"
# Ler diretamente dos arquivos .nc reduz a manutenção necessária mas é devagar demais 
# E complica o processo de despache do site
# SDIYBT

arquivo_convertido = "Dados/MERGE_CPTEC_spi_gamma_60.nc"
variavel = "spi_gamma_60" # Mudar o número dependendo do arquivo
pasta = f"DadosJSON/{variavel}"

os.makedirs(pasta, exist_ok=True)

dataset = xr.open_dataset(
        arquivo_convertido,
        engine="netcdf4"
)

for t in dataset.coords["time"].values:
    dados_t = dataset[variavel].sel(time=t).fillna(0).values.tolist()
    saida = {
            variavel: dados_t
        }
    nome_arquivo = os.path.join(pasta+f"/{variavel}_{np.datetime_as_string(t)[0:7]}.json")
    with open(nome_arquivo, "w", encoding="utf-8") as f:
        json.dump(saida, f, indent=2)

print("acabei :)")
