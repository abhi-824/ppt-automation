"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyMCP = void 0;
var mcp_1 = require("agents/mcp");
var mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
var zod_1 = require("zod");
var pptxgenjs_1 = require("pptxgenjs");
var path_1 = require("path");
// Define our MCP agent with tools
var MyMCP = /** @class */ (function (_super) {
    __extends(MyMCP, _super);
    function MyMCP() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.server = new mcp_js_1.McpServer({
            name: "PowerPoint Automation",
            version: "1.0.0",
        });
        _this.prs = new pptxgenjs_1.default();
        return _this;
    }
    MyMCP.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                // Add a new slide with title and subtitle
                this.server.tool("add_title_slide", {
                    title: zod_1.z.string(),
                    subtitle: zod_1.z.string(),
                }, function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
                    var slide;
                    var title = _b.title, subtitle = _b.subtitle;
                    return __generator(this, function (_c) {
                        slide = this.prs.addSlide();
                        slide.addText(title, { x: 1, y: 1, w: 8, h: 1.5, fontSize: 44, align: "center" });
                        slide.addText(subtitle, { x: 1, y: 2.5, w: 8, h: 1, fontSize: 32, align: "center" });
                        return [2 /*return*/, { content: [{ type: "text", text: "Title slide added successfully" }] }];
                    });
                }); });
                // Add a bullet point slide
                this.server.tool("add_bullet_slide", {
                    title: zod_1.z.string(),
                    points: zod_1.z.array(zod_1.z.string()),
                }, function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
                    var slide, bulletPoints;
                    var title = _b.title, points = _b.points;
                    return __generator(this, function (_c) {
                        slide = this.prs.addSlide();
                        slide.addText(title, { x: 1, y: 1, w: 8, h: 1, fontSize: 36 });
                        bulletPoints = points.map(function (point, index) { return ({
                            text: point,
                            options: { x: 1, y: 2 + index * 0.5, w: 8, h: 0.5, bullet: true }
                        }); });
                        slide.addText(bulletPoints, { x: 1, y: 2, w: 8, h: points.length * 0.5 });
                        return [2 /*return*/, { content: [{ type: "text", text: "Bullet slide added successfully" }] }];
                    });
                }); });
                // Add a new slide with custom content
                this.server.tool("add_slide", {
                    title: zod_1.z.string(),
                    content: zod_1.z.string(),
                }, function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
                    var slide;
                    var title = _b.title, content = _b.content;
                    return __generator(this, function (_c) {
                        slide = this.prs.addSlide();
                        slide.addText(title, { x: 1, y: 1, w: 8, h: 1, fontSize: 36 });
                        slide.addText(content, { x: 1, y: 2, w: 8, h: 2 });
                        return [2 /*return*/, { content: [{ type: "text", text: "Slide added successfully" }] }];
                    });
                }); });
                // Save the presentation
                this.server.tool("save_presentation", {
                    filename: zod_1.z.string().default("presentation.pptx"),
                }, function (_a) { return __awaiter(_this, [_a], void 0, function (_b) {
                    var outputPath;
                    var filename = _b.filename;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                outputPath = path_1.default.join(process.cwd(), filename);
                                return [4 /*yield*/, this.prs.writeFile({ fileName: outputPath })];
                            case 1:
                                _c.sent();
                                return [2 /*return*/, { content: [{ type: "text", text: "Presentation saved as ".concat(outputPath) }] }];
                        }
                    });
                }); });
                return [2 /*return*/];
            });
        });
    };
    return MyMCP;
}(mcp_1.McpAgent));
exports.MyMCP = MyMCP;
exports.default = {
    fetch: function (request, env, ctx) {
        var url = new URL(request.url);
        if (url.pathname === "/sse" || url.pathname === "/sse/message") {
            // @ts-ignore
            return MyMCP.serveSSE("/sse").fetch(request, env, ctx);
        }
        if (url.pathname === "/mcp") {
            // @ts-ignore
            return MyMCP.serve("/mcp").fetch(request, env, ctx);
        }
        return new Response("Not found", { status: 404 });
    },
};
