"""
API v2 routes - Current active endpoints
"""
from fastapi import APIRouter
from typing import Dict
from ...utils.shape_alignment import (
    align_titles_to_reference,
    align_subtitles_to_reference,
    align_footnotes_to_reference
)

router = APIRouter(prefix="/api/v2", tags=["v2"])

# Backward compatibility router (no prefix) for the non-deprecated endpoint
backward_compat_router = APIRouter()


def get_state():
    """Get global state from main.py"""
    import sys
    import app.main as main_module
    return main_module.slide_map


@router.post("/slides/align_shapes_to_reference")
def align_shapes_to_reference(request: Dict):
    """
    Align multiple shape types (title, subtitle, footnote) to match a reference slide
    
    Expected body format:
    {
        "reference_slide_number": 2,
        "target_slide_numbers": [1, 3, 4, 5],
        "shapes_to_align": ["title", "subtitle", "footnote"]
    }
    """
    slide_map = get_state()
    
    if "reference_slide_number" not in request or "target_slide_numbers" not in request or "shapes_to_align" not in request:
        return {"error": "Missing required fields: 'reference_slide_number', 'target_slide_numbers', or 'shapes_to_align'"}
    
    reference_slide_num = request["reference_slide_number"]
    target_slide_numbers = request["target_slide_numbers"]
    shapes_to_align = request["shapes_to_align"]
    
    # Validate inputs
    if not isinstance(target_slide_numbers, list) or len(target_slide_numbers) == 0:
        return {"error": "target_slide_numbers must be a non-empty array"}
    
    if not isinstance(shapes_to_align, list) or len(shapes_to_align) == 0:
        return {"error": "shapes_to_align must be a non-empty array"}
    
    valid_shapes = ["title", "subtitle", "footnote"]
    for shape in shapes_to_align:
        if shape not in valid_shapes:
            return {"error": f"Invalid shape type '{shape}'. Valid types: {valid_shapes}"}
    
    # Dispatch to individual alignment functions
    results = {}
    
    if "title" in shapes_to_align:
        title_result = align_titles_to_reference(
            slide_map,
            reference_slide_num,
            target_slide_numbers
        )
        results["title"] = title_result
    
    if "subtitle" in shapes_to_align:
        subtitle_result = align_subtitles_to_reference(
            slide_map,
            reference_slide_num,
            target_slide_numbers
        )
        results["subtitle"] = subtitle_result
    
    if "footnote" in shapes_to_align:
        footnote_result = align_footnotes_to_reference(
            slide_map,
            reference_slide_num,
            target_slide_numbers
        )
        results["footnote"] = footnote_result
    
    return {
        "reference_slide": reference_slide_num,
        "target_slides": target_slide_numbers,
        "shapes_aligned": shapes_to_align,
        "results": results
    }


# Backward compatibility: also expose at the old path (without /api/v2 prefix)
@backward_compat_router.post("/slides/align_shapes_to_reference")
def align_shapes_to_reference_backward_compat(request: Dict):
    """
    Backward compatibility wrapper - same as /api/v2/slides/align_shapes_to_reference
    """
    return align_shapes_to_reference(request)

