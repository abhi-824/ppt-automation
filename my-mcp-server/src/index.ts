#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

// Create server instance
const server = new Server(
  {
    name: "ppt-automation",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define all available tools
const tools = [
  {
    name: "list_themes",
    description: "List all available PowerPoint themes",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "set_theme",
    description: "Set the theme for the PowerPoint presentation",
    inputSchema: {
      type: "object",
      properties: {
        theme_name: { type: "string", description: "Name of the theme to apply" },
      },
      required: ["theme_name"],
    },
  },
  {
    name: "list_slides",
    description: "List all slides in the current presentation",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "delete_slide",
    description: "Delete a slide by ID",
    inputSchema: {
      type: "object",
      properties: {
        slide_id: { type: "string", description: "ID of the slide to delete" },
      },
      required: ["slide_id"],
    },
  },
  {
    name: "create_blank_slide",
    description: "Create a new blank slide",
    inputSchema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "add_bullet_points",
    description: "Add bullet points to a slide",
    inputSchema: {
      type: "object",
      properties: {
        slide_id: { type: "string", description: "ID of the slide" },
        points: { type: "array", items: { type: "string" }, description: "Array of bullet point texts" },
        left: { type: "number", description: "X position (optional)" },
        top: { type: "number", description: "Y position (optional)" },
        width: { type: "number", description: "Width (optional)" },
        height: { type: "number", description: "Height (optional)" },
      },
      required: ["slide_id", "points"],
    },
  },
  {
    name: "add_two_column_text",
    description: "Add two-column text layout to a slide",
    inputSchema: {
      type: "object",
      properties: {
        slide_id: { type: "string", description: "ID of the slide" },
        title: { type: "string", description: "Title text" },
        left_text: { type: "string", description: "Left column text" },
        right_text: { type: "string", description: "Right column text" },
      },
      required: ["slide_id", "title", "left_text", "right_text"],
    },
  },
  {
    name: "add_text_box",
    description: "Add a custom text box to a slide",
    inputSchema: {
      type: "object",
      properties: {
        slide_id: { type: "string", description: "ID of the slide" },
        text: { type: "string", description: "Text content" },
        left: { type: "number", description: "X position (optional)" },
        top: { type: "number", description: "Y position (optional)" },
        width: { type: "number", description: "Width (optional)" },
        height: { type: "number", description: "Height (optional)" },
      },
      required: ["slide_id", "text"],
    },
  },
  {
    name: "add_comparison_table",
    description: "Add a comparison table to a slide",
    inputSchema: {
      type: "object",
      properties: {
        slide_id: { type: "string", description: "ID of the slide" },
        data: { type: "array", items: { type: "array", items: { type: "string" } }, description: "2D array of table data" },
        left: { type: "number", description: "X position (optional)" },
        top: { type: "number", description: "Y position (optional)" },
        width: { type: "number", description: "Width (optional)" },
        height: { type: "number", description: "Height (optional)" },
      },
      required: ["slide_id", "data"],
    },
  },
  {
    name: "add_icon_list",
    description: "Add an icon list to a slide",
    inputSchema: {
      type: "object",
      properties: {
        slide_id: { type: "string", description: "ID of the slide" },
        items: { type: "array", items: { type: "string" }, description: "Array of list items" },
        left: { type: "number", description: "X position (optional)" },
        top: { type: "number", description: "Y position (optional)" },
        width: { type: "number", description: "Width (optional)" },
        height: { type: "number", description: "Height (optional)" },
      },
      required: ["slide_id", "items"],
    },
  },
  {
    name: "add_quote_block",
    description: "Add a quote block to a slide",
    inputSchema: {
      type: "object",
      properties: {
        slide_id: { type: "string", description: "ID of the slide" },
        quote: { type: "string", description: "Quote text" },
        author: { type: "string", description: "Author name (optional)" },
        left: { type: "number", description: "X position (optional)" },
        top: { type: "number", description: "Y position (optional)" },
        width: { type: "number", description: "Width (optional)" },
        height: { type: "number", description: "Height (optional)" },
      },
      required: ["slide_id", "quote"],
    },
  },
  {
    name: "add_timeline",
    description: "Add a timeline to a slide",
    inputSchema: {
      type: "object",
      properties: {
        slide_id: { type: "string", description: "ID of the slide" },
        milestones: { type: "array", items: { type: "string" }, description: "Array of milestone texts" },
        left: { type: "number", description: "X position (optional)" },
        top: { type: "number", description: "Y position (optional)" },
        width: { type: "number", description: "Width (optional)" },
        height: { type: "number", description: "Height (optional)" },
      },
      required: ["slide_id", "milestones"],
    },
  },
  {
    name: "add_process_flow",
    description: "Add a process flow diagram to a slide",
    inputSchema: {
      type: "object",
      properties: {
        slide_id: { type: "string", description: "ID of the slide" },
        steps: { type: "array", items: { type: "string" }, description: "Array of process steps" },
        left: { type: "number", description: "X position (optional)" },
        top: { type: "number", description: "Y position (optional)" },
        width: { type: "number", description: "Width (optional)" },
        height: { type: "number", description: "Height (optional)" },
      },
      required: ["slide_id", "steps"],
    },
  },
  {
    name: "add_statistic_highlight",
    description: "Add a statistic highlight to a slide",
    inputSchema: {
      type: "object",
      properties: {
        slide_id: { type: "string", description: "ID of the slide" },
        value: { type: "string", description: "Statistic value" },
        label: { type: "string", description: "Label text (optional)" },
        subtext: { type: "string", description: "Additional subtext (optional)" },
        left: { type: "number", description: "X position (optional)" },
        top: { type: "number", description: "Y position (optional)" },
        width: { type: "number", description: "Width (optional)" },
        height: { type: "number", description: "Height (optional)" },
      },
      required: ["slide_id", "value"],
    },
  },
  {
    name: "add_callout_box",
    description: "Add a callout box to a slide",
    inputSchema: {
      type: "object",
      properties: {
        slide_id: { type: "string", description: "ID of the slide" },
        message: { type: "string", description: "Callout message" },
        color: { type: "number", description: "Color code (optional)" },
        left: { type: "number", description: "X position (optional)" },
        top: { type: "number", description: "Y position (optional)" },
        width: { type: "number", description: "Width (optional)" },
        height: { type: "number", description: "Height (optional)" },
      },
      required: ["slide_id", "message"],
    },
  },
  {
    name: "add_section_divider",
    description: "Add a section divider slide",
    inputSchema: {
      type: "object",
      properties: {
        slide_id: { type: "string", description: "ID of the slide" },
        title: { type: "string", description: "Section title" },
        left: { type: "number", description: "X position (optional)" },
        top: { type: "number", description: "Y position (optional)" },
        width: { type: "number", description: "Width (optional)" },
        height: { type: "number", description: "Height (optional)" },
      },
      required: ["slide_id", "title"],
    },
  },
  {
    name: "save_presentation",
    description: "Save the PowerPoint presentation to a file",
    inputSchema: {
      type: "object",
      properties: {
        filename: { type: "string", description: "Output filename (optional, defaults to output.pptx)" },
      },
    },
  },
  //   {
  //     name: "get_slide_shapes",
  //     description: `Return a full list of shapes in the specified slide. 
  // This includes semantic metadata such as:
  // - shape_id (stable ID like "shape_0")
  // - shape_index (order on slide)
  // - shape_name (e.g., "Title 1", "Subtitle 2")
  // - shape_type ("title", "subtitle", "placeholder", "textbox", etc.)
  // - has_text and text_content
  // - position { left, top, width, height } in inches
  // - is_title and is_subtitle flags

  // Use this tool whenever you need to:
  // 1. Detect the title shape (is_title === true)
  // 2. Detect the subtitle shape
  // 3. Inspect or modify existing text on a slide
  // 4. Understand layout before inserting or replacing content
  // `,
  //     inputSchema: {
  //       type: "object",
  //       properties: {
  //         slide_id: {
  //           type: "string",
  //           description: "ID of the slide to get shapes from"
  //         },
  //       },
  //       required: ["slide_id"],
  //     },
  //   },
  //   {
  //     name: "set_title_position",
  //     description: `Set the position and size of the title shape on a slide.

  // This tool automatically finds the shape where is_title === true (the primary title placeholder)
  // and updates its layout to the specified left, top, width, and height values (in inches).

  // Use this tool when you want to:
  // - Move the title to a new position
  // - Resize the title area before adding text
  // - Align the title with other elements
  // - Fix poorly placed titles after creating a slide

  // If the slide has no title placeholder, the tool will return an error.
  // `,
  //     inputSchema: {
  //       type: "object",
  //       properties: {
  //         slide_id: {
  //           type: "string",
  //           description: "ID of the slide"
  //         },
  //         left: {
  //           type: "number",
  //           description: "X position in inches from left edge"
  //         },
  //         top: {
  //           type: "number",
  //           description: "Y position in inches from top edge"
  //         },
  //         width: {
  //           type: "number",
  //           description: "Width in inches"
  //         },
  //         height: {
  //           type: "number",
  //           description: "Height in inches"
  //         },
  //       },
  //       required: ["slide_id", "left", "top", "width", "height"],
  //     },
  //   },
  //   {
  //     name: "get_title_coordinates",
  //     description: `Get the position and dimensions of the title shape in a slide.

  // This tool returns only the title shape's coordinates and metadata:
  // - has_title (boolean indicating if a title exists)
  // - title_text (current text in the title)
  // - coordinates { left, top, width, height } in inches

  // Use this tool when you need to:
  // 1. Quickly check if a slide has a title and where it's positioned
  // 2. Get title dimensions before copying layout to other slides
  // 3. Verify title placement after modifications
  // 4. Extract title position for bulk operations

  // This is faster than get_slide_shapes when you only need title information.
  // `,
  //     inputSchema: {
  //       type: "object",
  //       properties: {
  //         slide_id: {
  //           type: "string",
  //           description: "ID of the slide to get title coordinates from"
  //         },
  //       },
  //       required: ["slide_id"],
  //     },
  //   },

  //   {
  //     name: "set_bulk_title_positions",
  //     description: `Set the same title position for multiple slides at once.

  // This tool accepts an array of slide numbers (1-based, e.g., [1, 2, 3]) and a single position configuration.
  // It applies the same position and size to all specified slides' title shapes.

  // Use this tool when you need to:
  // 1. Apply consistent title positioning across multiple slides
  // 2. Align titles to match a template or brand guidelines  
  // 3. Batch-update slide layouts efficiently with uniform positioning
  // 4. Standardize title placement across selected slides

  // The position can include all or some properties (left, top, width, height).
  // Omitted properties will remain unchanged for each slide.

  // Example: To move titles on slides 1, 3, and 5 to the same position:
  // - slide_numbers: [1, 3, 5]
  // - position: { left: 1.0, top: 0.5, width: 8.0, height: 1.0 }
  // `,
  //     inputSchema: {
  //       type: "object",
  //       properties: {
  //         slide_numbers: {
  //           type: "array",
  //           description: "Array of slide numbers (1-based indexing, e.g., [1, 2, 3])",
  //           items: {
  //             type: "number"
  //           }
  //         },
  //         position: {
  //           type: "object",
  //           description: "Position and size properties to apply to all slides (all values in inches)",
  //           properties: {
  //             left: {
  //               type: "number",
  //               description: "X position in inches from left edge (optional)"
  //             },
  //             top: {
  //               type: "number",
  //               description: "Y position in inches from top edge (optional)"
  //             },
  //             width: {
  //               type: "number",
  //               description: "Width in inches (optional)"
  //             },
  //             height: {
  //               type: "number",
  //               description: "Height in inches (optional)"
  //             },
  //           }
  //         }
  //       },
  //       required: ["slide_numbers", "position"],
  //     },
  //   },
  {
    name: "align_titles_to_reference_slide",
    description: `Copy the title position from one slide and apply it to other slides.

WHAT IT DOES:
This tool takes a reference slide number and copies its title's exact position (left, top, width, height coordinates) to multiple target slides.

WHEN TO USE:
- User says: "Make all titles match slide 2" or "align titles to slide 2"
- User says: "Use slide 1's title position for slides 3-7"
- User wants consistent title placement across slides
- User wants to fix misaligned titles by matching a good example

HOW IT WORKS:
1. Gets title coordinates from reference slide (must have a title)
2. Applies same coordinates to all target slides
3. Returns success/failure for each slide

PARAMETERS:
- reference_slide_number: Which slide to copy FROM (e.g., 2 means "use slide 2 as template")
- target_slide_numbers: Which slides to apply TO (e.g., [1,3,4,5] means "update these slides")

EXAMPLES:
Query: "Align all titles to match slide 2's position"
→ reference_slide_number: 2
→ target_slide_numbers: [1, 3, 4, 5, 6, 7, 8]

Query: "Make slides 5-10 use the same title position as slide 1"  
→ reference_slide_number: 1
→ target_slide_numbers: [5, 6, 7, 8, 9, 10]

Query: "Fix title on slide 7 to match slide 4"
→ reference_slide_number: 4
→ target_slide_numbers: [7]

IMPORTANT: Use 1-based indexing (slide 1 = first slide, not 0).
`,
    inputSchema: {
      type: "object",
      properties: {
        reference_slide_number: {
          type: "number",
          description: "Slide number to COPY title position FROM (1-based, e.g., 2 for second slide)"
        },
        target_slide_numbers: {
          type: "array",
          description: "Slide numbers to APPLY title position TO (1-based array, e.g., [1,3,4,5])",
          items: {
            type: "number"
          }
        }
      },
      required: ["reference_slide_number", "target_slide_numbers"],
    },
  },
  {
    name: "align_subtitles_to_reference_slide",
    description: `Copy the subtitle position from one slide and apply it to other slides.

WHAT IT DOES:
This tool takes a reference slide number and copies its subtitle's exact position (left, top, width, height coordinates) to multiple target slides.

WHEN TO USE:
- User says: "Make all subtitles match slide 2" or "align subtitles to slide 2"
- User says: "Use slide 1's subtitle position for slides 3-7"
- User wants consistent subtitle placement across slides
- User wants to fix misaligned subtitles by matching a good example

HOW IT WORKS:
1. Gets subtitle coordinates from reference slide (must have a subtitle)
2. Applies same coordinates to all target slides
3. Returns success/failure for each slide

PARAMETERS:
- reference_slide_number: Which slide to copy FROM (e.g., 2 means "use slide 2 as template")
- target_slide_numbers: Which slides to apply TO (e.g., [1,3,4,5] means "update these slides")

EXAMPLES:
Query: "Align all subtitles to match slide 2's position"
→ reference_slide_number: 2
→ target_slide_numbers: [1, 3, 4, 5, 6, 7, 8]

Query: "Make slides 5-10 use the same subtitle position as slide 1"  
→ reference_slide_number: 1
→ target_slide_numbers: [5, 6, 7, 8, 9, 10]

Query: "Fix subtitle on slide 7 to match slide 4"
→ reference_slide_number: 4
→ target_slide_numbers: [7]

IMPORTANT: Use 1-based indexing (slide 1 = first slide, not 0).
`,
    inputSchema: {
      type: "object",
      properties: {
        reference_slide_number: {
          type: "number",
          description: "Slide number to COPY subtitle position FROM (1-based, e.g., 2 for second slide)"
        },
        target_slide_numbers: {
          type: "array",
          description: "Slide numbers to APPLY subtitle position TO (1-based array, e.g., [1,3,4,5])",
          items: {
            type: "number"
          }
        }
      },
      required: ["reference_slide_number", "target_slide_numbers"],
    },
  },
  {
    name: "align_footnotes_to_reference_slide",
    description: `Copy the footnote position from one slide and apply it to other slides.

WHAT IT DOES:
This tool takes a reference slide number and copies its footnote's exact position (left, top, width, height coordinates) to multiple target slides. Footnotes are typically small text boxes at the bottom of slides containing references, disclaimers, or additional notes.

WHEN TO USE:
- User says: "Make all footnotes match slide 2" or "align footnotes to slide 2"
- User says: "Use slide 1's footnote position for slides 3-7"
- User wants consistent footnote placement across slides
- User wants to fix misaligned footnotes or disclaimers by matching a good example
- User needs to standardize small text at bottom of slides

HOW IT WORKS:
1. Gets footnote coordinates from reference slide (must have a footnote text box)
2. Applies same coordinates to all target slides
3. Returns success/failure for each slide

PARAMETERS:
- reference_slide_number: Which slide to copy FROM (e.g., 2 means "use slide 2 as template")
- target_slide_numbers: Which slides to apply TO (e.g., [1,3,4,5] means "update these slides")

EXAMPLES:
Query: "Align all footnotes to match slide 2's position"
→ reference_slide_number: 2
→ target_slide_numbers: [1, 3, 4, 5, 6, 7, 8]

Query: "Make slides 5-10 use the same footnote position as slide 1"  
→ reference_slide_number: 1
→ target_slide_numbers: [5, 6, 7, 8, 9, 10]

Query: "Fix footnote on slide 7 to match slide 4"
→ reference_slide_number: 4
→ target_slide_numbers: [7]

Query: "Standardize disclaimer text position using slide 3 as reference"
→ reference_slide_number: 3
→ target_slide_numbers: [1, 2, 4, 5, 6]

IMPORTANT: Use 1-based indexing (slide 1 = first slide, not 0).
`,
    inputSchema: {
      type: "object",
      properties: {
        reference_slide_number: {
          type: "number",
          description: "Slide number to COPY footnote position FROM (1-based, e.g., 2 for second slide)"
        },
        target_slide_numbers: {
          type: "array",
          description: "Slide numbers to APPLY footnote position TO (1-based array, e.g., [1,3,4,5])",
          items: {
            type: "number"
          }
        }
      },
      required: ["reference_slide_number", "target_slide_numbers"],
    },
  }
];

// Helper function to make API calls
async function callAPI(endpoint: string, method: string = "GET", body?: any) {
  const baseURL = process.env.PPT_API_URL || "http://127.0.0.1:8000";
  const url = `${baseURL}${endpoint}`;

  const options: RequestInit = {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(url, options);
  return await response.json();
}

// Handle list tools request
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;

    switch (name) {
      case "list_themes":
        result = await callAPI("/themes");
        break;

      case "set_theme":
        result = await callAPI("/theme", "POST", { theme_name: args?.theme_name });
        break;

      case "list_slides":
        result = await callAPI("/slides");
        break;

      case "delete_slide":
        result = await callAPI(`/slide/${args?.slide_id}`, "DELETE");
        break;

      case "create_blank_slide": {
        const slideRes = await callAPI("/slide/blank", "POST");
        result = { message: `Blank slide created with ID: ${(slideRes as any).slide_id}`, slide_id: (slideRes as any).slide_id };
        break;
      }

      case "add_bullet_points":
        result = await callAPI(`/slide/${args?.slide_id}/bullet_points`, "POST", {
          points: args?.points,
          left: args?.left,
          top: args?.top,
          width: args?.width,
          height: args?.height,
        });
        break;

      case "add_two_column_text":
        result = await callAPI(`/slide/${args?.slide_id}/component`, "POST", {
          component_type: "two_column_text",
          content: {
            title: args?.title,
            left_text: args?.left_text,
            right_text: args?.right_text,
          },
        });
        break;

      case "add_text_box":
        result = await callAPI(`/slide/${args?.slide_id}/text_box`, "POST", {
          text: args?.text,
          left: args?.left,
          top: args?.top,
          width: args?.width,
          height: args?.height,
        });
        break;

      case "add_comparison_table":
        result = await callAPI(`/slide/${args?.slide_id}/component`, "POST", {
          component_type: "comparison_table",
          content: {
            data: args?.data,
            left: args?.left,
            top: args?.top,
            width: args?.width,
            height: args?.height,
          },
        });
        break;

      case "add_icon_list":
        result = await callAPI(`/slide/${args?.slide_id}/component`, "POST", {
          component_type: "icon_list",
          content: {
            items: args?.items,
            left: args?.left,
            top: args?.top,
            width: args?.width,
            height: args?.height,
          },
        });
        break;

      case "add_quote_block":
        result = await callAPI(`/slide/${args?.slide_id}/component`, "POST", {
          component_type: "quote_block",
          content: {
            quote: args?.quote,
            author: args?.author,
            left: args?.left,
            top: args?.top,
            width: args?.width,
            height: args?.height,
          },
        });
        break;

      case "add_timeline":
        result = await callAPI(`/slide/${args?.slide_id}/component`, "POST", {
          component_type: "timeline",
          content: {
            milestones: args?.milestones,
            left: args?.left,
            top: args?.top,
            width: args?.width,
            height: args?.height,
          },
        });
        break;

      case "add_process_flow":
        result = await callAPI(`/slide/${args?.slide_id}/component`, "POST", {
          component_type: "process_flow",
          content: {
            steps: args?.steps,
            left: args?.left,
            top: args?.top,
            width: args?.width,
            height: args?.height,
          },
        });
        break;

      case "add_statistic_highlight":
        result = await callAPI(`/slide/${args?.slide_id}/component`, "POST", {
          component_type: "statistic_highlight",
          content: {
            value: args?.value,
            label: args?.label,
            subtext: args?.subtext,
            left: args?.left,
            top: args?.top,
            width: args?.width,
            height: args?.height,
          },
        });
        break;

      case "add_callout_box":
        result = await callAPI(`/slide/${args?.slide_id}/component`, "POST", {
          component_type: "callout_box",
          content: {
            message: args?.message,
            color: args?.color,
            left: args?.left,
            top: args?.top,
            width: args?.width,
            height: args?.height,
          },
        });
        break;

      case "add_section_divider":
        result = await callAPI(`/slide/${args?.slide_id}/component`, "POST", {
          component_type: "section_divider",
          content: {
            title: args?.title,
            left: args?.left,
            top: args?.top,
            width: args?.width,
            height: args?.height,
          },
        });
        break;

      // case "get_slide_shapes":
      //   result = await callAPI(`/slide/${args?.slide_id}/shapes`);
      //   break;

      // case "set_title_position":
      //   result = await callAPI(`/slide/${args?.slide_id}/title/position`, "POST", {
      //     left: args?.left,
      //     top: args?.top,
      //     width: args?.width,
      //     height: args?.height,
      //   });
      //   break;
      // case "set_title_position":
      //   result = await callAPI(`/slide/${args?.slide_id}/title/position`, "POST", {
      //     left: args?.left,
      //     top: args?.top,
      //     width: args?.width,
      //     height: args?.height,
      //   });
      //   break;
      case "align_titles_to_reference_slide":
        result = await callAPI("/slides/align_titles_to_reference", "POST", {
          reference_slide_number: args?.reference_slide_number,
          target_slide_numbers: args?.target_slide_numbers,
        });
        break;
      case "align_subtitles_to_reference_slide":
        result = await callAPI("/slides/align_subtitles_to_reference", "POST", {
          reference_slide_number: args?.reference_slide_number,
          target_slide_numbers: args?.target_slide_numbers,
        });
        break;

      case "align_footnotes_to_reference_slide":
        result = await callAPI("/slides/align_footnotes_to_reference", "POST", {
          reference_slide_number: args?.reference_slide_number,
          target_slide_numbers: args?.target_slide_numbers,
        });
        break;
      case "save_presentation":
        result = await callAPI("/save", "POST", {
          filename: args?.filename || "output.pptx",
        });
        break;
      // case "get_title_coordinates":
      //   result = await callAPI(`/slide/${args?.slide_id}/title/coordinates`);
      //   break;

      // case "set_bulk_title_positions":
      //   result = await callAPI(`/slides/bulk/title/position`, "POST", {
      //     slide_numbers: args?.slide_numbers,
      //     position: args?.position,
      //   });
      //   break;
      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ error: error?.message }),
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("PowerPoint Automation MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error in main():", error);
  process.exit(1);
});