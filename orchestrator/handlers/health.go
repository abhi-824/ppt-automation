package handlers

import (
	"encoding/json"
	"net/http"

	"orchestrator/models"
)

// HealthHandler handles health check requests
func HealthHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	
	response := models.HealthResponse{
		Status: "ok",
	}
	
	json.NewEncoder(w).Encode(response)
}

