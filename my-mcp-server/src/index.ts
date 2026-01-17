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
    name: "align_shapes_to_reference_slide",
    description: `Copy the position of one or more shapes (title, subtitle, footnote) from a reference slide and apply to other slides.
  
  WHAT IT DOES:
  This tool takes a reference slide number and copies the exact positions (left, top, width, height coordinates) of specified shapes to multiple target slides. You can align multiple shape types in a single operation.
  
  WHEN TO USE:
  - User says: "Make all titles match slide 2" or "align titles to slide 2"
  - User says: "Make slide 5 match slide 1's layout" (copy multiple shapes)
  - User says: "Align titles and subtitles to slide 3"
  - User says: "Fix the footnotes on slides 4-7 to match slide 2"
  - User wants consistent positioning across slides
  - User wants to standardize layout using a reference slide
  
  HOW IT WORKS:
  1. Gets coordinates of specified shapes from reference slide
  2. Applies same coordinates to all target slides
  3. Returns success/failure for each slide and shape type
  
  SHAPE TYPES:
  - "title": Main title placeholder
  - "subtitle": Subtitle placeholder
  - "footnote": Text box in bottom 15% of slide (disclaimers, citations)
  
  PARAMETERS:
  - reference_slide_number: Which slide to copy FROM (e.g., 2 means "use slide 2 as template")
  - target_slide_numbers: Which slides to apply TO (e.g., [1,3,4,5] means "update these slides")
  - shapes_to_align: Array of shape types to copy (e.g., ["title", "subtitle"])
  
  EXAMPLES:
  Query: "Align all titles to match slide 2's position"
  → reference_slide_number: 2
  → target_slide_numbers: [1, 3, 4, 5, 6, 7, 8]
  → shapes_to_align: ["title"]
  
  Query: "Make slides 5-10 match slide 1's title and subtitle layout"  
  → reference_slide_number: 1
  → target_slide_numbers: [5, 6, 7, 8, 9, 10]
  → shapes_to_align: ["title", "subtitle"]
  
  Query: "Fix everything on slide 7 to match slide 4"
  → reference_slide_number: 4
  → target_slide_numbers: [7]
  → shapes_to_align: ["title", "subtitle", "footnote"]
  
  Query: "Standardize footnotes using slide 3 as reference"
  → reference_slide_number: 3
  → target_slide_numbers: [1, 2, 4, 5, 6]
  → shapes_to_align: ["footnote"]
  
  IMPORTANT: Use 1-based indexing (slide 1 = first slide, not 0).
  `,
    inputSchema: {
      type: "object",
      properties: {
        reference_slide_number: {
          type: "number",
          description: "Slide number to COPY shape positions FROM (1-based, e.g., 2 for second slide)"
        },
        target_slide_numbers: {
          type: "array",
          description: "Slide numbers to APPLY shape positions TO (1-based array, e.g., [1,3,4,5])",
          items: {
            type: "number"
          }
        },
        shapes_to_align: {
          type: "array",
          description: "Array of shape types to align. Valid values: 'title', 'subtitle', 'footnote'",
          items: {
            type: "string",
            enum: ["title", "subtitle", "footnote"]
          }
        }
      },
      required: ["reference_slide_number", "target_slide_numbers", "shapes_to_align"],
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
      case "align_shapes_to_reference_slide":
        result = await callAPI("/slides/align_shapes_to_reference", "POST", {
          reference_slide_number: args?.reference_slide_number,
          target_slide_numbers: args?.target_slide_numbers,
          shapes_to_align: args?.shapes_to_align,
        });
        break;
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