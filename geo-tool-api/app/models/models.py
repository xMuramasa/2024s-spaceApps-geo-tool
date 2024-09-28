from pydantic import BaseModel


class SearchParams(BaseModel):
    query_string: str


class TaskParams(BaseModel):
    place: str
