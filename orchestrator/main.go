package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"io"
	"bytes"

	"github.com/mark3labs/mcphost/sdk"
)

type ChatRequest struct {
	Prompt string `json:"prompt"`
}
func callPython(path string, method string, body interface{}) ([]byte, error) {
    url := "http://localhost:8000" + path

    var reqBody io.Reader = nil
    if body != nil {
        b, _ := json.Marshal(body)
        reqBody = bytes.NewBuffer(b)
    }

    req, err := http.NewRequest(method, url, reqBody)
    if err != nil {
        return nil, err
    }
    req.Header.Set("Content-Type", "application/json")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        return nil, err
    }
    defer resp.Body.Close()

    return io.ReadAll(resp.Body)
}

func main() {
	ctx := context.Background()

	// Create MCPHost instance with Ollama configuration
	host, err := sdk.New(ctx, &sdk.Options{
		Streaming:  true,
		Quiet:      true,
		ConfigFile: "/Users/the.narcissist.coder/karm/local.json",
		Model:      "ollama:qwen2.5",
	})
	if err != nil {
		log.Fatalf("Failed to start MCPHost: %v", err)
	}
	defer host.Close()

	// Expose /chat SSE endpoint
	http.HandleFunc("/chat", corsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}
		handleChat(w, r, host)
	}))
	http.HandleFunc("/ppt/preview", corsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		result, err := callPython("/presentation/preview", http.MethodGet, nil)
		if err != nil {
			http.Error(w, err.Error(), 500)
			return
		}
	
		w.Header().Set("Content-Type", "application/json")
		w.Write(result)
	}))
	

	// Health check endpoint
	http.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		json.NewEncoder(w).Encode(map[string]string{"status": "ok"})
	})

	fmt.Println("🚀 Orchestrator running at http://localhost:8080")
	fmt.Println("📡 SSE endpoint: POST /chat")
	fmt.Println("❤️  Health check: GET /health")
	log.Fatal(http.ListenAndServeTLS(":8080", "localhost+2.pem", "localhost+2-key.pem", nil))
}

func corsMiddleware(next http.HandlerFunc) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		// CORS headers for Office add-ins
		origin := r.Header.Get("Origin")
		if origin == "" {
			origin = "*"
		}

		w.Header().Set("Access-Control-Allow-Origin", origin)
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
		w.Header().Set("Access-Control-Allow-Credentials", "true")
		w.Header().Set("Access-Control-Max-Age", "86400")

		// Handle preflight
		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusOK)
			return
		}

		next(w, r)
	}
}

func handleChat(w http.ResponseWriter, r *http.Request, host *sdk.MCPHost) {
	// Parse request BEFORE setting SSE headers
	var req ChatRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Prompt == "" {
		http.Error(w, "Prompt is required", http.StatusBadRequest)
		return
	}

	// Check if streaming is supported
	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "Streaming unsupported", http.StatusInternalServerError)
		return
	}

	// NOW set SSE headers
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("X-Accel-Buffering", "no") // Disable nginx buffering
	flusher.Flush()

	// Use request context for proper cancellation
	ctx := r.Context()

	// Send start event
	sendSSE(w, map[string]string{
		"type":   "start",
		"prompt": req.Prompt,
	})
	flusher.Flush()

	// Send prompt with streaming callbacks
	response, err := host.PromptWithCallbacks(
		ctx,
		req.Prompt,

		// TOOL CALL START
		func(name, args string) {
			event := map[string]interface{}{
				"type": "tool-call",
				"tool": name,
				"args": args,
			}
			sendSSE(w, event)
			flusher.Flush()
		},

		// TOOL RESULT END
		func(name, args, result string, failed bool) {
			event := map[string]interface{}{
				"type":    "tool-result",
				"tool":    name,
				"result":  result,
				"success": !failed,
			}
			sendSSE(w, event)
			flusher.Flush()
		},

		// LLM TEXT TOKENS / DELTAS
		func(chunk string) {
			event := map[string]interface{}{
				"type":    "token",
				"content": chunk,
			}
			sendSSE(w, event)
			flusher.Flush()
		},
	)

	if err != nil {
		sendSSE(w, map[string]string{
			"type":  "error",
			"error": err.Error(),
		})
		flusher.Flush()
		return
	}

	// Send final response
	sendSSE(w, map[string]interface{}{
		"type":     "done",
		"response": response,
	})
	flusher.Flush()
}

func sendSSE(w http.ResponseWriter, v interface{}) {
	raw, _ := json.Marshal(v)
	fmt.Fprintf(w, "data: %s\n\n", raw)
}
