import uvicorn
from app.main import app

if __name__ == "__main__":
    # Hugging Face expects web traffic on port 7860
    uvicorn.run("app.main:app", host="0.0.0.0", port=7860)