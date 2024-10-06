import json
import requests as r
from fastapi import APIRouter, HTTPException

from app.core.config import settings
from datetime import datetime

from app.models.models import SearchParams, TaskParams

import pandas as pd
import geopandas as gpd
import os

router = APIRouter()


@router.get("/product-descriptions")
def get_product_descriptions():
    uri = '{}product'.format(settings.earthdata_api_url)
    prods = r.get(uri).json()
    prods_df = pd.DataFrame(prods).drop_duplicates(subset=['Description'])
    return prods_df[['ProductAndVersion', 'Description']].to_dict('records')


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

    platforms = ['SRTM', 'ECOSTRESS', 'SSEBop ET', 'GPW',
                 'ASTER GDEM', 'NASADEM', 'MEaSUREs LSTE', 'EMIT']

    oldest_date_product['Platform'] = oldest_date_product['Platform'].apply(
        lambda p: p if p in platforms else None
    )

    clean_dict = oldest_date_product[['TemporalExtentStart',
                                      'ProductAndVersion',
                                      'Platform']].to_dict('records')

    return clean_dict[0] if len(clean_dict) > 0 else None


@router.post("/get-layers/")
def get_layers(s: SearchParams):

    found = get_product_id(s.query_string)
    print('found', found)

    if found:
        uri = '{}product/{}'.format(settings.earthdata_api_url,
                                    found['ProductAndVersion'])
        layers_response = r.get(uri).json()

        layers = []

        for name, info_values in layers_response.items():
            layers.append({
                "id": name,
                "description": info_values['Description'],
                "minDate": found['TemporalExtentStart']
            })

        return layers

    else:
        return None


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


@router.post("/queue-task")
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

    print(task.start_date, task.end_date, task.layer, task.product, task.place)

    # filter selcted place
    selected_unit = data[data['UNIT_CODE'] == (task.place)]
    unit = json.loads(selected_unit.to_json())

    task_name = ('space-apps-geo-tool'
                 + " "
                 + selected_unit['UNIT_NAME'].values[0]).replace(' ', '_')
    task_type = 'area'

    # projection
    proj = 'geographic'

    outFormat = 'geotiff'

    start_date_object = datetime.fromisoformat(
        task.start_date.rstrip("Z") + "+00:00")
    formatted_start_date = start_date_object.strftime("%m-%d-%Y")

    end_date_object = datetime.fromisoformat(
        task.end_date.rstrip("Z") + "+00:00")
    formatted_end_date = end_date_object.strftime("%m-%d-%Y")

    task = {
        'task_type': task_type,
        'task_name': task_name,
        'params': {
            'dates': [{
                'startDate': formatted_start_date,
                'endDate': formatted_end_date
            }],
            'layers': [{
                'product': task.product.id,
                'layer': task.layer
            }],
            'output': {
                'format': {
                    'type': outFormat
                },
                'projection': proj
            },
            'geo': unit,
        }
    }

    return task
