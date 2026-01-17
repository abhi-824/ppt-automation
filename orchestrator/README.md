# Orchestrator Service

A Go-based orchestrator service that manages communication between the PowerPoint add-in frontend, Python PPT API, and MCP Host.

## Project Structure

```
orchestrator/
├── main.go              # Application entry point
├── config/              # Configuration management
│   └── config.go        # Environment variable loading
├── models/              # Data models
│   └── chat.go          # Request/response types
├── handlers/            # HTTP handlers
│   ├── chat.go          # SSE chat endpoint handler
│   ├── health.go        # Health check handler
│   └── preview.go       # PPT preview handler
├── middleware/          # HTTP middleware
│   └── cors.go          # CORS middleware
└── utils/               # Utility functions
    ├── http_client.go   # HTTP client for Python API
    └── sse.go           # Server-Sent Events utilities
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```bash
# Server Configuration
SERVER_PORT=8080
SERVER_ADDRESS=localhost

# Python API Configuration
PYTHON_API_URL=http://localhost:8000

# TLS Configuration
TLS_CERT_FILE=localhost+2.pem
TLS_KEY_FILE=localhost+2-key.pem

# MCP Host Configuration
MCP_CONFIG_FILE=/path/to/local.json
MCP_MODEL=ollama:qwen2.5
MCP_STREAMING=true
MCP_QUIET=true

# CORS Configuration
ALLOWED_ORIGINS=*
```

## Running the Service

1. Install dependencies:
   ```bash
   go mod download
   ```

2. Set environment variables (or use `.env` file with a loader like `godotenv`)

3. Run the service:
   ```bash
   go run main.go
   ```

The service will start on `https://localhost:8080` (or the configured port).

## Endpoints

- `POST /chat` - Server-Sent Events (SSE) endpoint for chat streaming
- `GET /ppt/preview` - Get PowerPoint presentation preview
- `GET /health` - Health check endpoint

## Architecture

The service is modularized into several packages:

- **config**: Centralized configuration management with environment variables
- **models**: Type definitions for requests and responses
- **handlers**: HTTP request handlers organized by feature
- **middleware**: Cross-cutting concerns like CORS
- **utils**: Reusable utilities for HTTP and SSE operations

