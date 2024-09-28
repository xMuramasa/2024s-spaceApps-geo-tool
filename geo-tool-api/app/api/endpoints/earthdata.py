import requests as r
from fastapi import APIRouter, HTTPException

from app.core.config import settings

from app.models.models import SearchParams, TaskParams

import pandas as pd
import geopandas as gpd
import os

router = APIRouter()


def login():
    uri = '{}login'.format(settings.earthdata_api_url)
    token_response = r.post(uri, auth=(
        settings.earthdata_username, settings.earthdata_password))
    return token_response.json()


# Define a route to get user info
@router.get("/product-descriptions")
def get_product_descriptions():
    uri = '{}product'.format(settings.earthdata_api_url)
    prods = r.get(uri).json()
    desc_list = [p['Description'] for p in prods]
    return desc_list


@router.post("/search-products")
def search_products(search: SearchParams):
    uri = '{}product'.format(settings.earthdata_api_url)
    prods = r.get(uri).json()

    products_dataframe = pd.DataFrame(prods)

    result = products_dataframe[
        (products_dataframe['Available'] == True) &
        (products_dataframe['Deleted'] == False) &
        products_dataframe['Description'].str.contains(search.query_string)
    ]

    return list(result['ProductAndVersion'])


@router.post("/get-layers")
def get_layers(product: SearchParams):
    uri = '{}product/{}'.format(settings.earthdata_api_url,
                                product.query_string)
    layers_response = r.get(uri).json()

    layers = []

    for name, info_values in layers_response.items():
        layers.append({
            "id": name,
            "description": info_values['Description']
        })

    return layers


@router.get('/places')
def get_places():
    src = './'

    os.chdir(src)

    static_dir = 'static'
    shape_files = 'shape_files'
    filename = 'nps_boundary.shp'

    file_dir = os.path.join(src, static_dir, shape_files, filename)

    nps = gpd.read_file(file_dir)

    return list(nps['UNIT_NAME'])


@router.post("/query-task")
def queue_new_task(task: TaskParams):

    src = './'

    os.chdir(src)

    static_dir = 'static'
    shape_files = 'shape_files'
    filename = 'nps_boundary.shp'

    file_dir = os.path.join(src, static_dir, shape_files, filename)

    nps = gpd.read_file(file_dir)

    nps['DATE_EDIT'] = nps['DATE_EDIT'].dt.strftime('%Y-%m-%d')
    nps = nps[[
        'UNIT_CODE', 'UNIT_NAME', 'DATE_EDIT',
        'STATE', 'GNIS_ID', 'geometry'
    ]]
