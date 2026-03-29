from fastapi import FastAPI
from app.api.endpoints import router

app = FastAPI(title="Social AI Service")

app.include_router(router)

@app.get("/")
def read_root():
    return {"status": "AI Service is running"}