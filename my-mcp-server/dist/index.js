#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
// Create server instance
const server = new Server({
    name: "ppt-automation",
    version: "1.0.0",
}, {
    capabilities: {
        tools: {},
    },
});
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
        name: "add_title_slide",
        description: "Add a title slide with title and subtitle",
        inputSchema: {
            type: "object",
            properties: {
                title: { type: "string", description: "Main title text" },
                subtitle: { type: "string", description: "Subtitle text" },
                title_left: { type: "number", description: "Title X position (optional)" },
                title_top: { type: "number", description: "Title Y position (optional)" },
                title_width: { type: "number", description: "Title width (optional)" },
                title_height: { type: "number", description: "Title height (optional)" },
                subtitle_left: { type: "number", description: "Subtitle X position (optional)" },
                subtitle_top: { type: "number", description: "Subtitle Y position (optional)" },
                subtitle_width: { type: "number", description: "Subtitle width (optional)" },
                subtitle_height: { type: "number", description: "Subtitle height (optional)" },
            },
            required: ["title", "subtitle"],
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
];
// Helper function to make API calls
async function callAPI(endpoint, method = "GET", body) {
    const baseURL = process.env.PPT_API_URL || "http://127.0.0.1:8000";
    const url = `${baseURL}${endpoint}`;
    const options = {
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
            case "add_title_slide": {
                const slideRes = await callAPI("/slide", "POST");
                const slideId = slideRes.slide_id;
                await callAPI(`/slide/${slideId}/title`, "POST", {
                    text: args?.title,
                    left: args?.title_left,
                    top: args?.title_top,
                    width: args?.title_width,
                    height: args?.title_height,
                });
                await callAPI(`/slide/${slideId}/subtitle`, "POST", {
                    text: args?.subtitle,
                    left: args?.subtitle_left,
                    top: args?.subtitle_top,
                    width: args?.subtitle_width,
                    height: args?.subtitle_height,
                });
                result = { message: "Title slide added successfully", slide_id: slideId };
                break;
            }
            case "delete_slide":
                result = await callAPI(`/slide/${args?.slide_id}`, "DELETE");
                break;
            case "create_blank_slide": {
                const slideRes = await callAPI("/slide/blank", "POST");
                result = { message: `Blank slide created with ID: ${slideRes.slide_id}`, slide_id: slideRes.slide_id };
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
            case "save_presentation":
                result = await callAPI("/save", "POST", {
                    filename: args?.filename || "output.pptx",
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
    }
    catch (error) {
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
