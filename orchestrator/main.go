package main

import (
	"context"
	"fmt"
	"log"
	"net/http"

	"github.com/mark3labs/mcphost/sdk"

	"orchestrator/config"
	"orchestrator/handlers"
	"orchestrator/middleware"
	"orchestrator/utils"
)

func main() {
	cfg := config.Load()

	// Create MCPHost instance
	ctx := context.Background()
	host, err := sdk.New(ctx, &sdk.Options{
		Streaming:  cfg.MCPStreaming,
		Quiet:      cfg.MCPQuiet,
		ConfigFile: cfg.MCPConfigFile,
		Model:      cfg.MCPModel,
	})
	if err != nil {
		log.Fatalf("Failed to start MCPHost: %v", err)
	}
	defer host.Close()

	// Create HTTP client for Python API
	httpClient := utils.NewHTTPClient(cfg.PythonAPIURL)

	// Initialize handlers
	chatHandler := handlers.NewChatHandler(host, httpClient)
	previewHandler := handlers.NewPreviewHandler(httpClient)

	// Setup routes
	http.HandleFunc("/chat", middleware.CORSMiddleware(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		chatHandler.Handle(w, r)
	}))

	http.HandleFunc("/ppt/preview", middleware.CORSMiddleware(previewHandler.Handle))

	http.HandleFunc("/health", middleware.CORSMiddleware(handlers.HealthHandler))

	// Start server
	serverAddr := fmt.Sprintf(":%s", cfg.ServerPort)
	fmt.Printf("🚀 Orchestrator running at https://%s%s\n", cfg.ServerAddress, serverAddr)
	fmt.Println("📡 SSE endpoint: POST /chat")
	fmt.Println("📊 Preview endpoint: GET /ppt/preview")
	fmt.Println("❤️  Health check: GET /health")

	log.Fatal(http.ListenAndServeTLS(serverAddr, cfg.TLSCertFile, cfg.TLSKeyFile, nil))
}
