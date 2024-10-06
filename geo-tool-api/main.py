# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.endpoints.earthdata import router as user_router
from app.api.endpoints.llm import router as llm_router

from app.core.config import settings


app = FastAPI()

origins = [
    "*",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Register the version 1 routes
app.include_router(user_router, prefix="/earthdata")
app.include_router(llm_router, prefix="/llm_router")


@app.get("/")
async def root():
    return {"message": "Welcome to FastAPI!"}
