import logging
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routers.api import router as api_router
from dependencies import load_all_models

# Load environment variables
load_dotenv()

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Validate ML models at startup
    logger.info("Loading ML models during startup...")
    try:
        load_all_models()
        logger.info("ML models loaded successfully.")
    except Exception as e:
        logger.error(f"Failed to load ML models at startup: {e}")
        raise
    yield
    logger.info("Application shutdown.")

app = FastAPI(title="Cloud Cost Guardrail API", lifespan=lifespan)

# Secure CORS config
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")
