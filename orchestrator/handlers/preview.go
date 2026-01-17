package handlers

import (
	"log"
	"net/http"

	"orchestrator/utils"
)

type PreviewHandler struct {
	HTTPClient *utils.HTTPClient
}

func NewPreviewHandler(httpClient *utils.HTTPClient) *PreviewHandler {
	return &PreviewHandler{
		HTTPClient: httpClient,
	}
}

func (h *PreviewHandler) Handle(w http.ResponseWriter, r *http.Request) {
	result, err := h.HTTPClient.Call("/presentation/preview", http.MethodGet, nil)
	if err != nil {
		log.Printf("Error calling Python API: %v", err)
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write(result)
}

