import xarray as xr

# Abrir o arquivo .nc
dataset = xr.open_dataset(
    r"C:\Users\insta\Downloads\MERGE_CPTEC_spi_gamma_01.nc",
    engine="netcdf4"  # força usar o engine certo
)

# Coordenadas que você quer
lat_alvo = -22.1984722
lon_alvo = -42.1133056
data_alvo = "2025-05-01"

# Selecionar valor mais próximo da coordenada e data
valor_spi = dataset["spi_gamma_01"].sel(
    lat=lat_alvo,
    lon=lon_alvo,
    time=data_alvo,
    method="nearest"  # pega o ponto mais próximo
)

print(f"SPI em ({lat_alvo}, {lon_alvo}) na data {data_alvo}: {valor_spi.values}")

# Fechar o arquivo
dataset.close()
