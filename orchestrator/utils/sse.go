package utils

import (
	"encoding/json"
	"fmt"
	"net/http"
)

// SendSSE sends a Server-Sent Event to the client
func SendSSE(w http.ResponseWriter, v interface{}) error {
	raw, err := json.Marshal(v)
	if err != nil {
		return err
	}
	_, err = fmt.Fprintf(w, "data: %s\n\n", raw)
	return err
}

// SetupSSEHeaders configures the response writer for SSE streaming
func SetupSSEHeaders(w http.ResponseWriter) http.Flusher {
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("X-Accel-Buffering", "no") // Disable nginx buffering

	flusher, ok := w.(http.Flusher)
	if !ok {
		return nil
	}

	flusher.Flush()
	return flusher
}

