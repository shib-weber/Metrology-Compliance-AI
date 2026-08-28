from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from db.database import init_db
from api import auth, scan, reports


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize DB safely in the background on startup
    init_db()
    yield


app = FastAPI(
    title="Metronox Metrology Compliance API",
    version="1.0.0",
    lifespan=lifespan
)

# Explicit origin list + wildcard regex
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://metronox.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=r"https://.*\.vercel\.app|https://.*\.onrender\.com|http://localhost:\d+",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(scan.router, prefix="/api")
app.include_router(reports.router, prefix="/api")


@app.get("/")
def health_check():
    return {"status": "healthy", "service": "Metronox Compliance Backend"}