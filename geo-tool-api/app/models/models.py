from pydantic import BaseModel


class SearchParams(BaseModel):
    query_string: str


class TaskParams(BaseModel):
    place: str
    start_date: str
    end_date: str
    product: str
    layer: str
