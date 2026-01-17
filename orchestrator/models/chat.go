package models

// ChatRequest represents the incoming chat request
type ChatRequest struct {
	Prompt      string `json:"prompt"`
	SlideBase64 string `json:"slide_base64"`
	X           int    `json:"x"`
}

// HealthResponse represents the health check response
type HealthResponse struct {
	Status string `json:"status"`
}

