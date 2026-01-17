package handlers

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/mark3labs/mcphost/sdk"

	"orchestrator/models"
	"orchestrator/utils"
)

type ChatHandler struct {
	Host      *sdk.MCPHost
	HTTPClient *utils.HTTPClient
}

func NewChatHandler(host *sdk.MCPHost, httpClient *utils.HTTPClient) *ChatHandler {
	return &ChatHandler{
		Host:       host,
		HTTPClient: httpClient,
	}
}

func (h *ChatHandler) Handle(w http.ResponseWriter, r *http.Request) {
	// Parse request BEFORE setting SSE headers
	var req models.ChatRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Prompt == "" {
		http.Error(w, "Prompt is required", http.StatusBadRequest)
		return
	}

	// Send slideBase64 to Python service if provided
	if req.SlideBase64 != "" && req.X == 1 {
		slideData := map[string]string{
			"slideBase64": req.SlideBase64,
		}
		_, err := h.HTTPClient.Call("/set/slideBase64", http.MethodPost, slideData)
		if err != nil {
			log.Printf("Error sending slideBase64 to Python service: %v", err)
			// Continue processing even if this fails
		}
	}

	// Setup SSE headers and get flusher
	flusher := utils.SetupSSEHeaders(w)
	if flusher == nil {
		http.Error(w, "Streaming unsupported", http.StatusInternalServerError)
		return
	}

	// Use request context for proper cancellation
	ctx := r.Context()

	// Send start event
	if err := utils.SendSSE(w, map[string]string{
		"type":   "start",
		"prompt": req.Prompt,
	}); err != nil {
		log.Printf("Error sending start event: %v", err)
		return
	}
	flusher.Flush()

	// Send prompt with streaming callbacks
	response, err := h.Host.PromptWithCallbacks(
		ctx,
		req.Prompt,

		// TOOL CALL START
		func(name, args string) {
			event := map[string]interface{}{
				"type": "tool-call",
				"tool": name,
				"args": args,
			}
			if err := utils.SendSSE(w, event); err != nil {
				log.Printf("Error sending tool-call event: %v", err)
				return
			}
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
			if err := utils.SendSSE(w, event); err != nil {
				log.Printf("Error sending tool-result event: %v", err)
				return
			}
			flusher.Flush()
		},

		// LLM TEXT TOKENS / DELTAS
		func(chunk string) {
			event := map[string]interface{}{
				"type":    "token",
				"content": chunk,
			}
			if err := utils.SendSSE(w, event); err != nil {
				log.Printf("Error sending token event: %v", err)
				return
			}
			flusher.Flush()
		},
	)

	if err != nil {
		if err := utils.SendSSE(w, map[string]string{
			"type":  "error",
			"error": err.Error(),
		}); err != nil {
			log.Printf("Error sending error event: %v", err)
		}
		flusher.Flush()
		return
	}

	// Send final response
	if err := utils.SendSSE(w, map[string]interface{}{
		"type":     "done",
		"response": response,
	}); err != nil {
		log.Printf("Error sending done event: %v", err)
		return
	}
	flusher.Flush()
}

