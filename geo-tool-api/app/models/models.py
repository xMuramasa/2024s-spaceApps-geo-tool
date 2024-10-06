from pydantic import BaseModel


class SearchParams(BaseModel):
    query_string: str


class ProductModel(BaseModel):
    id: str
    label: str


class TaskParams(BaseModel):
    place: str
    start_date: str
    end_date: str
    product: ProductModel
    layer: str
