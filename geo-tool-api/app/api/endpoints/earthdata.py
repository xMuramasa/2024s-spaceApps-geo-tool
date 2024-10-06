import json
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

def get_product_id(query_string):
    uri_1 = '{}product'.format(settings.earthdata_api_url)
    prods = r.get(uri_1).json()
    products_dataframe = pd.DataFrame(prods)

    filtered_products = products_dataframe[
    (products_dataframe['Description'] == query_string) & 
    (products_dataframe['TemporalExtentEnd'] == 'Present')
    ]
    
    oldest_date_product = filtered_products[
    filtered_products['TemporalExtentStart'] == filtered_products['TemporalExtentStart'].min()
    ]
    clean_dict = oldest_date_product[['ProductAndVersion','Platform']].to_dict('records')[0]
    
    return clean_dict

def get_platform(p):
    palforms = ['SRTM', 'ECOSTRESS', 'SSEBop ET', 'GPW', 'ASTER GDEM', 'NASADEM', 'MEaSUREs LSTE', 'EMIT']
    return p if p in palforms else None

# Define a route to get user info
@router.get("/product-descriptions")
def get_product_descriptions():
    uri = '{}product'.format(settings.earthdata_api_url)
    prods = r.get(uri).json()
    prods_df = pd.DataFrame(prods)
    return prods_df[['ProductAndVersion', 'Description']].to_dict('records')



@router.post("/search-products")
def search_products(search: SearchParams):
    uri = '{}product'.format(settings.earthdata_api_url)
    prods = r.get(uri).json()

    products_dataframe = pd.DataFrame(prods)

    result = products_dataframe[
        (products_dataframe['Available'] is True) & (products_dataframe['Deleted'] is False) &
        products_dataframe['Description'].str.contains(search.query_string)
    ]

    return list(result['ProductAndVersion'])


@router.get("/get-layers/")
def get_layers(productId: str):

    uri = '{}product/{}'.format(settings.earthdata_api_url, productId)
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

    return nps[['UNIT_CODE', 'UNIT_NAME']].to_dict('records')


@router.get('/projections')
def get_projections():
    uri = '{}spatial/proj'.format(settings.earthdata_api_url)
    projections_response = r.get(uri).json()

    projections_df = pd.DataFrame(projections_response)

    return projections_df.to_dict('records')


@router.post("/query-task")
def queue_new_task(task: TaskParams):

    src = './'

    os.chdir(src)

    static_dir = 'static'
    shape_files = 'shape_files'
    filename = 'nps_boundary.shp'

    file_dir = os.path.join(src, static_dir, shape_files, filename)

    data = gpd.read_file(file_dir)

    data['DATE_EDIT'] = data['DATE_EDIT'].dt.strftime('%Y-%m-%d')
    data = data[[
        'UNIT_CODE', 'UNIT_NAME', 'DATE_EDIT',
        'STATE', 'GNIS_ID', 'geometry'
    ]]

    # filter selcted place
    selected_unit = data[data['UNIT_NAME'].str.contains(task.place)]
    unit = json.loads(selected_unit.to_json())

    task_name = 'space-apps-geo-tool' + " " + \
        selected_unit['UNIT_NAME'].values[0]
    task_type = 'area'

    # projection
    proj = 'geographic'

    outFormat = 'geotiff'

    task = {
        'task_type': task_type,
        'task_name': task_name,
        'params': {
            'dates': [{'startDate': task.start_date, 'endDate': task.end_date}],
            'layers': [{'product': task.product, 'layer': task.layer}],
            'output': {
                'format': {'type': outFormat},
                'projection': proj
            },
            'geo': unit,
        }
    }

    return task
