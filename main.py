import sys
import os
sys.path.append(os.path.abspath("."))

import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router
from fastapi.responses import FileResponse, Response
from fastapi.staticfiles import StaticFiles

app = FastAPI(title="SocraticMind", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
app.mount("/ui", StaticFiles(directory="ui"), name="ui")


@app.get("/")
async def root():
    return FileResponse("ui/index.html")


@app.get("/favicon.ico")
async def favicon():
    if os.path.exists("favicon.ico"):
        return FileResponse("favicon.ico")
    return Response(status_code=204)