# app/main.py
from fastapi import FastAPI
from app.api.endpoints.earthdata import router as user_router

app = FastAPI()

# Register the version 1 routes
app.include_router(user_router, prefix="/earthdata")


@app.get("/")
async def root():
    return {"message": "Welcome to FastAPI!"}
