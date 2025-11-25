from fastapi import FastAPI, UploadFile, File
from pydantic import BaseModel
from typing import List, Dict, Optional, Any
from pptx import Presentation
from pptx.util import Inches
from pptx.enum.text import MSO_AUTO_SIZE, MSO_VERTICAL_ANCHOR
import uuid
import os
import re
import io
import base64
from pptx.util import Pt
from fastapi.middleware.cors import CORSMiddleware


from .themes.theme import Theme, THEMES
from .components.layouts import (
    HeaderWithImage, BulletWithTitle, TwoColumnText,
    ComparisonTable, IconList, QuoteBlock, Timeline, ProcessFlow, StatisticHighlight, CalloutBox, SectionDivider
)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
prs = Presentation()
slide_map: Dict[str, object] = {}
current_theme: Theme = THEMES["default"]

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

# Theme endpoints
@app.get("/themes")
def list_themes():
    return {"themes": list(THEMES.keys())}

@app.post("/theme")
def set_theme(req: ThemeRequest):
    global current_theme
    if req.theme_name not in THEMES:
        return {"error": "theme not found"}
    current_theme = THEMES[req.theme_name]
    return {"status": "ok"}

# Individual slide element endpoints - used by MCP server
@app.post("/slide/{slide_id}/title")
def add_title(slide_id: str, req: TextRequest):
    """Add title to a slide - used by MCP server"""
    if slide_id not in slide_map:
        return {"error": "slide not found"}
    
    slide = slide_map[slide_id]
    if not slide.shapes.title:
        # If no title placeholder, create a text box
        if req.left is not None and req.top is not None:
            text_box = slide.shapes.add_textbox(
                Inches(req.left), Inches(req.top),
                Inches(req.width or 8), Inches(req.height or 1.5)
            )
            configure_textbox_frame(text_box.text_frame)
            apply_markdown_to_text_frame(text_box.text_frame, req.text)
            if current_theme:
                current_theme.get_style("title").apply_to_text_frame(text_box.text_frame)
        else:
            return {"error": "position required when no title placeholder exists"}
    else:
        configure_textbox_frame(slide.shapes.title.text_frame)
        apply_markdown_to_text_frame(slide.shapes.title.text_frame, req.text)
        if current_theme:
            current_theme.get_style("title").apply_to_text_frame(slide.shapes.title.text_frame)
    return {"status": "ok"}

@app.post("/slide/{slide_id}/subtitle")
def add_subtitle(slide_id: str, req: TextRequest):
    """Add subtitle to a slide - used by MCP server"""
    if slide_id not in slide_map:
        return {"error": "slide not found"}
    
    slide = slide_map[slide_id]
    # Find subtitle placeholder (usually index 1)
    subtitle = None
    for shape in slide.shapes:
        if hasattr(shape, "placeholder_format"):
            if shape.placeholder_format.idx == 1:
                subtitle = shape
                break
    
    if not subtitle:
        # If no subtitle placeholder, create a text box
        if req.left is not None and req.top is not None:
            text_box = slide.shapes.add_textbox(
                Inches(req.left), Inches(req.top),
                Inches(req.width or 8), Inches(req.height or 1)
            )
            configure_textbox_frame(text_box.text_frame)
            apply_markdown_to_text_frame(text_box.text_frame, req.text)
            if current_theme:
                current_theme.get_style("subtitle").apply_to_text_frame(text_box.text_frame)
        else:
            return {"error": "position required when no subtitle placeholder exists"}
    else:
        configure_textbox_frame(subtitle.text_frame)
        apply_markdown_to_text_frame(subtitle.text_frame, req.text)
        if current_theme:
            current_theme.get_style("subtitle").apply_to_text_frame(subtitle.text_frame)
    return {"status": "ok"}

@app.post("/slide/{slide_id}/bullet_points")
def add_bullet_points(slide_id: str, req: BulletPointsRequest):
    """Add bullet points to a slide - used by MCP server"""
    if slide_id not in slide_map:
        return {"error": "slide not found"}
    
    slide = slide_map[slide_id]
    
    left = req.left if req.left is not None else 1
    top = req.top if req.top is not None else 2
    width = req.width if req.width is not None else 8
    height = req.height if req.height is not None else 4

    shape = slide.shapes.add_textbox(Inches(left), Inches(top), Inches(width), Inches(height))
    tf = shape.text_frame
    configure_textbox_frame(tf)
    
    markdown_text = "\n".join(req.points)  # Join bullet points as lines
    apply_markdown_to_text_frame(tf, markdown_text)  # ✅ Now it's correct

    if current_theme:
        current_theme.get_style("bullet").apply_to_text_frame(tf)

    return {"status": "ok"}

@app.post("/slide/{slide_id}/text_box")
def add_text_box(slide_id: str, req: TextBoxRequest):
    """Add a text box to a slide - used by MCP server"""
    if slide_id not in slide_map:
        return {"error": "slide not found"}
    
    slide = slide_map[slide_id]
    left = req.left if req.left is not None else 1
    top = req.top if req.top is not None else 1
    width = req.width if req.width is not None else 8
    height = req.height if req.height is not None else 1
    text_box = slide.shapes.add_textbox(Inches(left), Inches(top), Inches(width), Inches(height))
    configure_textbox_frame(text_box.text_frame)
    apply_markdown_to_text_frame(text_box.text_frame, req.text)
    if current_theme:
        current_theme.get_style("body").apply_to_text_frame(text_box.text_frame)
    return {"status": "ok"}

# mponentmponent endpoints
@app.post("/slide/{slide_id}/component")
def add_component(slide_id: str, req: ComponentContent):
    if slide_id not in slide_map:
        return {"error": "slide not found"}
    
    slide = slide_map[slide_id]
    component_map = {
        "header_with_image": HeaderWithImage,
        "bullet_with_title": BulletWithTitle,
        "two_column_text": TwoColumnText,
        "comparison_table": ComparisonTable,
        "icon_list": IconList,
        "quote_block": QuoteBlock,
        "timeline": Timeline,
        "process_flow": ProcessFlow,
        "statistic_highlight": StatisticHighlight,
        "callout_box": CalloutBox,
        "section_divider": SectionDivider
    }
    
    if req.component_type not in component_map:
        return {"error": "invalid component type"}
    
    component_class = component_map[req.component_type]
    component = component_class(theme=current_theme)
    component.render(slide, req.content)
    
    return {"status": "ok"}

# Basic slide management
@app.post("/slide")
def create_slide(layout: int = 0):
    """Create a new blank slide - used by MCP server"""
    slide = prs.slides.add_slide(prs.slide_layouts[layout])
    slide_id = str(uuid.uuid4())
    slide_map[slide_id] = slide
    
    # Apply current theme to new slide
    current_theme.apply_to_slide(slide)
    
    return {"slide_id": slide_id}

@app.post("/slide/blank")
def create_blank_slide():
    """Create a new blank slide without any placeholders"""
    slide = prs.slides.add_slide(prs.slide_layouts[6])  # Layout 6 is blank
    slide_id = str(uuid.uuid4())
    slide_map[slide_id] = slide
    
    # Apply current theme to new slide
    current_theme.apply_to_slide(slide)
    
    return {"slide_id": slide_id}

@app.delete("/slide/{slide_id}")
def delete_slide(slide_id: str):
    """Delete a slide - used by MCP server"""
    if slide_id in slide_map:
        slide = slide_map.pop(slide_id)
        # Find the slide in the presentation and remove it
        for idx, sld in enumerate(prs.slides):
            if sld == slide:
                xml_slides = prs.slides._sldIdLst
                xml_slides.remove(xml_slides[idx])
                return {"status": "deleted"}
        return {"error": "slide not found in presentation"}
    return {"error": "slide not found"}

@app.get("/slides")
def list_slides():
    """List all slides - used by MCP server"""
    return {"slide_ids": list(slide_map.keys())}

@app.post("/save")
def save_presentation(filename: str = "output.pptx"):
    """Save the presentation - used by MCP server"""
    prs.save(filename)
    return {"status": "saved", "filename": filename}

# Add this endpoint to your FastAPI app
@app.get("/presentation/base64")
def get_presentation_base64():
    """
    Export the current presentation as base64 string
    Returns: {"base64": "...", "filename": "presentation.pptx"}
    """
    try:
        # Save presentation to BytesIO buffer
        buffer = io.BytesIO()
        prs.save(buffer)
        buffer.seek(0)
        
        # Convert to base64
        base64_data = base64.b64encode(buffer.read()).decode('utf-8')
        
        return {
            "status": "ok",
            "base64": base64_data,
            "filename": "presentation.pptx",
            "slide_count": len(prs.slides)
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

@app.get("/presentation/preview")
def get_presentation_preview():
    """
    Get presentation metadata and base64 for preview
    """
    try:
        buffer = io.BytesIO()
        prs.save(buffer)
        buffer.seek(0)
        
        base64_data = base64.b64encode(buffer.read()).decode('utf-8')
        
        return {
            "status": "ok",
            "base64": base64_data,
            "slide_count": len(prs.slides),
            "slide_ids": list(slide_map.keys()),
            "current_theme": current_theme.name if hasattr(current_theme, 'name') else "default"
        }
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": str(e)}
        )

@app.post("/presentation/reset")
def reset_presentation():
    """Reset the presentation to start fresh"""
    global prs, slide_map
    prs = Presentation()
    slide_map = {}
    return {"status": "ok", "message": "Presentation reset"}


def apply_markdown_to_text_frame(text_frame, text: str):
    """
    Parses simple markdown syntax and applies formatting:
    - # Heading 1
    - ## Heading 2
    - **bold**
    - *italic*
    """
    import re
    text_frame.clear()

    for line in text.split('\n'):
        line = line.strip()
        if not line:
            continue

        p = text_frame.add_paragraph()

        # Headings
        if line.startswith('## '):
            run = p.add_run()
            run.text = line[3:]
            run.font.size = Pt(28)
            run.font.bold = True
        elif line.startswith('# '):
            run = p.add_run()
            run.text = line[2:]
            run.font.size = Pt(36)
            run.font.bold = True
        else:
            # Bold/Italic inline formatting
            cursor = 0
            for match in re.finditer(r'(\*\*.*?\*\*|\*.*?\*)', line):
                start, end = match.span()
                if start > cursor:
                    run = p.add_run()
                    run.text = line[cursor:start]

                md = match.group()
                run = p.add_run()
                if md.startswith('**'):
                    run.text = md[2:-2]
                    run.font.bold = True
                elif md.startswith('*'):
                    run.text = md[1:-1]
                    run.font.italic = True
                cursor = end

            if cursor < len(line):
                run = p.add_run()
                run.text = line[cursor:]

def configure_textbox_frame(text_frame):
    text_frame.word_wrap = True
    text_frame.auto_size = MSO_AUTO_SIZE.NONE
    text_frame.vertical_anchor = MSO_VERTICAL_ANCHOR.TOP
    text_frame.margin_top = Inches(0.05)
    text_frame.margin_bottom = Inches(0.05)
    text_frame.margin_left = Inches(0.05)
    text_frame.margin_right = Inches(0.05)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True) 