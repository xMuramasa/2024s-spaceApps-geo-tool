from openai import OpenAI
import os
import requests
from fastapi import APIRouter, File, UploadFile
from transformers import VisionEncoderDecoderModel, ViTImageProcessor, AutoTokenizer
import torch
from PIL import Image
import io
from prophet import Prophet
from fastapi.responses import Response

from prophet.serialize import model_from_json

from app.core.config import settings
from app.models.models import ProductModel

# Load model and processor
model = VisionEncoderDecoderModel.from_pretrained(
    "nlpconnect/vit-gpt2-image-captioning")
feature_extractor = ViTImageProcessor.from_pretrained(
    "nlpconnect/vit-gpt2-image-captioning")
tokenizer = AutoTokenizer.from_pretrained(
    "nlpconnect/vit-gpt2-image-captioning")

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)

max_length = 16
num_beams = 4
gen_kwargs = {"max_length": max_length, "num_beams": num_beams}


router = APIRouter()

client = OpenAI(api_key=settings.open_api_key)


@router.post('/analyze/')
def query(info: ProductModel):
    GENERAL_GEO_ANALYSIS_TEMPLATE = """
    You are a geographic data analysis assistant and have to extract relevant context to answer a question based on geographic data and an image,
    please provide a simple caption of the selected area within the image and relevant questions related to the data. The core part of this task
    is to help farmers face a deluge of water-related challenges due to unpredictable weather, pests, and diseases.

    These factors can significantly impact crop health, farmers’ profits, and food security.
    Depending upon the geography, many farmers may face droughts or floods—sometimes both of these extreme events occur within the same season.

    Please consider the needs of farmers, agronomists, soil scientists, laborers, and others in the agricultural community.

    Think what can the farmer do to improve their selection of crops. Your task is to elaborate a short and concise answer with descriptions of each crop
    the farmer can grow within the area described next:

    - {area_name}
    - this area was studied with various NASA probes, one of them is: {area_study}, please elaborate a short description.

    Also, consider this geographical data of the prevoius description

    - It is place with extremely harsh conditions to delelop or practice agriculture. Please suggest .

    The final answer to the task should be provided in spanish please.[STOP]
    """

    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": GENERAL_GEO_ANALYSIS_TEMPLATE.format(
                area_name=info.label, area_study=info.id)},
            {
                "role": "user",
                "content": "Which techniques, crop and recyclation methods can they implement in those harsh conditions?"
            }
        ]
    )

    if completion:
        return completion.choices[0].message
    else:
        return None


@router.post("/generate_caption")
async def generate_caption(file: UploadFile = File(...)):
    contents = await file.read()
    image = Image.open(io.BytesIO(contents))

    if image.mode != "RGB":
        image = image.convert(mode="RGB")

    pixel_values = feature_extractor(
        images=[image], return_tensors="pt").pixel_values
    pixel_values = pixel_values.to(device)

    output_ids = model.generate(pixel_values, **gen_kwargs)

    preds = tokenizer.batch_decode(output_ids, skip_special_tokens=True)
    preds = [pred.strip() for pred in preds]

    return {"caption": preds[0]}


@router.get('/predict/')
def get_product_prediction():

    src = './'

    os.chdir(src)

    model_name = 'NDVI_serialized_model.json'
    statict_fs = 'static'
    model_fs = 'models'

    model_path = os.path.join(statict_fs, model_fs, model_name)

    with open(model_path, 'r') as fin:
        model = model_from_json(fin.read())

    # predecir a 1 ano de aqui
    future = model.make_future_dataframe(periods=365)
    # forecast = model.predict(future)
    # forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail()  # dataframe

    # # predecir y plotear a 5 anios
    # future = model.make_future_dataframe(periods=1825)  # 5 anios
    fcst = model.predict(future)
    return fcst

    # tendencia
    # fig1 = model.plot(forecast)
    # fig2 = model.plot_components(forecast)
