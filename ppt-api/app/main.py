"""
Main application file - wires routers together and maintains global state.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pptx import Presentation
from typing import Dict

from .themes.theme import Theme, THEMES
from .api.v1.routes import router as v1_router
from .api.v2.routes import router as v2_router, backward_compat_router

# Create FastAPI app
app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state - shared across all routers
prs = Presentation()
slide_map: Dict[str, object] = {}
current_theme: Theme = THEMES["default"]

# Wire routers together
app.include_router(v1_router)
app.include_router(v2_router)
app.include_router(backward_compat_router)  # Backward compatibility for old paths
