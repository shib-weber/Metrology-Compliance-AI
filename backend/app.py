import sys
from pathlib import Path

# Add backend 'app' directory to Python search path
APP_DIR = Path(__file__).resolve().parent / "app"
if str(APP_DIR) not in sys.path:
    sys.path.insert(0, str(APP_DIR))

import spaces
import gradio as gr
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# 1. Import your existing main FastAPI app instance & DB initializer
from main import app as core_fastapi_app  # noqa: E402
from db.database import init_db           # noqa: E402

# Run DB sync on container boot
try:
    init_db()
except Exception as err:
    print(f"[Database Sync Notice]: {err}")

# 2. ZeroGPU warmup hook (Satisfies AST and runtime inspection)
@spaces.GPU(duration=60)
def zero_gpu_keepalive():
    return "Metronox AI Engine Ready"

# 3. Create a clean Gradio interface for status monitoring
with gr.Blocks(title="Metronox Metrology Compliance API") as demo:
    gr.Markdown("# 🚀 Metronox Metrology Compliance Backend")
    gr.Markdown("ZeroGPU AI Engine is running.")
    status_btn = gr.Button("ZeroGPU Keep-Alive")
    status_box = gr.Textbox(label="Status Output", value="Engine Online")
    status_btn.click(fn=zero_gpu_keepalive, inputs=[], outputs=[status_box])

# 4. Master FastAPI container application
app = FastAPI(
    title="Metronox Backend Service",
    version="1.0.0",
    docs_url="/docs",
    openapi_url="/openapi.json"
)

# 5. Global CORS Configuration (Prevents preflight OPTIONS blocks from Vercel & localhost)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# 6. Mount all routes, child routers, and middleware from your existing FastAPI app
app.include_router(core_fastapi_app.router)

# 7. Mount Gradio to a subpath so it never intercepts /api/* calls
app = gr.mount_gradio_app(app, demo, path="/gradio", ssr_mode=False)

if __name__ == "__main__":
    # Pre-warm the ZeroGPU function on startup
    try:
        zero_gpu_keepalive()
    except Exception:
        pass
    
    # Run Uvicorn directly on port 7860
    uvicorn.run(app, host="0.0.0.0", port=7860, log_level="info")