"""
Pydantic models for API requests and responses.
"""
from pydantic import BaseModel
from typing import Dict, List, Optional, Any

# Models
class ComponentContent(BaseModel):
    component_type: str
    content: Dict[str, Any]

class ThemeRequest(BaseModel):
    theme_name: str

class TextRequest(BaseModel):
    text: str
    left: Optional[float] = None
    top: Optional[float] = None
    width: Optional[float] = None
    height: Optional[float] = None

class BulletPointsRequest(BaseModel):
    points: List[str]
    left: Optional[float] = None
    top: Optional[float] = None
    width: Optional[float] = None
    height: Optional[float] = None

class TextBoxRequest(BaseModel):
    text: str
    left: float = 1.0
    top: float = 1.0
    width: float = 4.0
    height: float = 1.0

class SlideContentRequest(BaseModel):
    title: str
    content: str

class HeaderWithImageContent(BaseModel):
    title: str
    image_path: str
    left: Optional[float] = 1.0
    top: Optional[float] = 2.0
    width: Optional[float] = 8.0
    height: Optional[float] = 4.0

class TwoColumnTextContent(BaseModel):
    title: str
    left_text: str
    right_text: str
    left: Optional[float] = 1.0
    top: Optional[float] = 1.0
    width: Optional[float] = 4.0
    height: Optional[float] = 4.0
    column_gap: Optional[float] = 0.5

class SlideBase64Request(BaseModel):
    slideBase64: str