<div align="center">

# <img src="assets/logo.png" width="200" style="vertical-align: middle;" /> Beets


**Cursor-like AI for PowerPoint** | Transform your presentations with natural language

[Website](#) | [Demo Video](#) | [Documentation](#)

<!-- Screenshot placeholder - Replace with actual screenshots -->
<!-- ![Beets in Action](assets/screenshot-main.png) -->

</div>

---

## 🎯 Overview

**Beets** is an intelligent PowerPoint add-in that brings Cursor-like AI capabilities to presentation creation. Chat with AI to build, edit, and enhance your slides using natural language. With component-wise change tracking and memory of previous modifications, Beets makes presentation design as easy as having a conversation.

### 📚 Technical Deep Dives

For comprehensive technical details, architecture decisions, and implementation insights, check out our Medium blog series:

- **[Cursor for PowerPoint: The Existential Crisis](https://medium.com/@thenarcissistcoder/cursor-for-powerpoint-the-existential-crisis-d504d2139f52)** - Initial concept and challenges
- **[Cursor for PPT - Part Two](https://medium.com/@thenarcissistcoder/cursor-for-ppt-part-two-4a029ababf7c)** - Implementation details and solutions
- **[Cursor for PPT - MCP Server](https://medium.com/@thenarcissistcoder/cursor-for-ppt-mcp-server-7013e6df92f6)** - MCP server architecture and tool integration

## ✨ Key Features

### 💬 **Natural Language Interface**
Transform your ideas into slides instantly. Simply describe what you want, and Beets creates it for you.

### 🔄 **Component-Wise Change Management**
- **Accept/Reject Changes**: Review and approve modifications component by component
- **Change Memory**: Previous changes are preserved, allowing you to iterate and refine
- **Non-destructive Editing**: Every change is tracked and reversible

### 📁 **Cross-File References**
Reference data from other files directly in your prompts:
```
"From @analysis.xlsx get the data and convert it into chart data and add it as a pie chart."
```

Beets can access:
- Excel files (`@filename.xlsx`)
- Other PowerPoint files (`@presentation.pptx`)
- Text files and more

### 🤖 **AI-Powered Features**
- **Smart Slide Generation**: Create slides from scratch or modify existing ones
- **Content Enhancement**: Improve text, formatting, and layouts with AI suggestions
- **Shape Alignment**: Automatically align shapes across multiple slides
- **Theme Management**: Apply and customize presentation themes
- **Component Library**: Use pre-built components (tables, timelines, quotes, etc.)

## 🎬 Demo

<!-- Demo video placeholder - Replace with YouTube embed -->
<!-- [![Watch the Demo](https://img.youtube.com/vi/YOUR_VIDEO_ID/0.jpg)](https://www.youtube.com/watch?v=YOUR_VIDEO_ID) -->

[Watch Full Demo on YouTube](#)

<!-- Additional screenshots -->
<!-- ![Feature Screenshot 1](assets/screenshot-features.png) -->
<!-- ![Feature Screenshot 2](assets/screenshot-components.png) -->

## 🏗️ Architecture

Beets consists of three main components:

```
┌─────────────────────────────────────────────────────────────┐
│                    PowerPoint Add-in (Frontend)              │
│                      React + Office.js API                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ HTTP/SSE
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Orchestrator Service (Go)                  │
│              Manages communication & MCP Host                │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌──────────────┐          ┌──────────────┐
│  Python API  │          │  MCP Server  │
│  (FastAPI)   │          │  (TypeScript)│
│  PPT Logic   │          │   Tools      │
└──────────────┘          └──────────────┘
```

### Components

1. **Frontend (chitragupt/)**: React-based PowerPoint add-in UI
   - Chat interface with streaming responses
   - Component-wise change preview
   - Real-time collaboration features

2. **Orchestrator (orchestrator/)**: Go service that coordinates between services
   - Manages MCP Host instances
   - Handles Server-Sent Events (SSE) for streaming
   - Routes requests to appropriate services

3. **Python API (ppt-api/)**: FastAPI service for PowerPoint operations
   - Slide creation and manipulation
   - Shape alignment utilities
   - Theme and component management
   - API v2 for active endpoints

4. **MCP Server (my-mcp-server/)**: TypeScript server providing tools
   - PowerPoint-specific operations
   - File access and processing
   - Data transformation tools

## 🚀 Getting Started

### Prerequisites

- **PowerPoint** (Office 365 or PowerPoint for Windows/Mac)
- **Node.js** (v18 or higher)
- **Python** (v3.8 or higher)
- **Go** (v1.21 or higher)
- **Ollama** (for local AI models) or compatible MCP provider

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/powerpoint-chat-addin.git
   cd powerpoint-chat-addin
   ```

2. **Start MCP Host**
   ```bash
   mcphost -m ollama:qwen2.5 --config local.json
   ```

3. **Start Orchestrator Service**
   ```bash
   cd orchestrator
   go run main.go
   ```

4. **Start Python API**
   ```bash
   cd ppt-api
   python run.py
   ```

5. **Start Frontend Development Server**
   ```bash
   cd chitragupt
   npm run start
   ```

6. **Load the Add-in in PowerPoint**
   - Follow Office Add-in development setup instructions
   - Or sideload the manifest.xml file

### Configuration

Create `.env` files in respective directories:

**orchestrator/.env**:
```env
SERVER_PORT=8080
PYTHON_API_URL=http://localhost:8000
MCP_CONFIG_FILE=/path/to/local.json
MCP_MODEL=ollama:qwen2.5
```

See individual component READMEs for detailed configuration options.

## 📖 Usage Examples

### Basic Slide Creation
```
"Create a slide with title 'Project Overview' and add three bullet points about our goals"
```

### Component-Wise Changes
Beets shows you each change component:
- ✅ **Accept** - Apply the change
- ❌ **Reject** - Keep the original
- 🔄 **Modify** - Edit before accepting

### Cross-File References
```
"From @sales_data.xlsx, extract the Q4 numbers and create a bar chart on slide 3"
```

```
"Use the logo from @brand_assets.pptx and add it to all slides as a header"
```

### Advanced Operations
```
"Align all title shapes on slides 2-10 to match the position from slide 1"
```

```
"Apply the 'Modern Blue' theme and update all text colors accordingly"
```

## 🛠️ Development

### Project Structure

```
powerpoint-chat-addin/
├── chitragupt/          # PowerPoint add-in frontend
│   └── src/
│       └── taskpane/
│           └── components/  # React components
├── orchestrator/        # Go orchestrator service
│   ├── handlers/        # HTTP handlers
│   ├── middleware/      # CORS, etc.
│   ├── utils/          # Utilities
│   └── config/         # Configuration
├── ppt-api/            # Python FastAPI service
│   └── app/
│       ├── api/        # API routes (v1, v2)
│       ├── utils/      # Shape alignment, formatting
│       └── models/     # Data models
└── my-mcp-server/      # MCP tools server
    └── src/            # TypeScript source
```

### Running in Development

All services support hot-reloading. Run each in a separate terminal:

```bash
# Terminal 1: MCP Host
mcphost -m ollama:qwen2.5 --config local.json

# Terminal 2: Orchestrator
cd orchestrator && go run main.go

# Terminal 3: Python API
cd ppt-api && python run.py

# Terminal 4: Frontend
cd chitragupt && npm run start
```

### API Documentation

- **Python API v2**: Active endpoints at `/api/v2/`
- **Python API v1**: Deprecated endpoints at `/api/v1/`
- **Orchestrator**: See `orchestrator/README.md`
- **MCP Server**: See `my-mcp-server/README.md`

## 🎨 Features in Detail

### Change Memory System

Beets maintains a history of all changes, allowing you to:
- Review what changed at any point
- Revert to previous states
- Combine changes from multiple interactions
- Apply changes selectively

### Component Library

Built-in components ready to use:
- Header with image
- Bullet points with title
- Two-column text layouts
- Comparison tables
- Icon lists
- Quote blocks
- Timelines
- Process flows
- Statistics highlights
- Callout boxes
- Section dividers

### Shape Alignment

Intelligent shape alignment utilities:
- Align titles across slides
- Align subtitles to match reference slide
- Align footnotes consistently
- Bulk shape positioning

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines (coming soon).

## 📄 License

[Your License Here]

## 🔗 Links

- **Website**: [https://beets.ai](#) <!-- Replace with actual website -->
- **Documentation**: [https://docs.beets.ai](#) <!-- Replace with actual docs -->
- **Demo Video**: [YouTube](#) <!-- Replace with actual video -->
- **Issue Tracker**: [GitHub Issues](#)
- **Discussions**: [GitHub Discussions](#)

## 🙏 Acknowledgments

Built with:
- [Office.js](https://docs.microsoft.com/en-us/office/dev/add-ins/)
- [React](https://reactjs.org/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [MCP Host](https://github.com/mark3labs/mcphost)
- [python-pptx](https://python-pptx.readthedocs.io/)

---

<div align="center">

**Made with ❤️ for PowerPoint users**

[⭐ Star us on GitHub](#) | [🐛 Report Bug](#) | [💡 Request Feature](#)

</div>
