package utils

import (
	"bytes"
	"encoding/json"
	"io"
	"log"
	"net/http"
)

// HTTPClient wraps HTTP client operations
type HTTPClient struct {
	BaseURL string
	Client  *http.Client
}

// NewHTTPClient creates a new HTTP client instance
func NewHTTPClient(baseURL string) *HTTPClient {
	return &HTTPClient{
		BaseURL: baseURL,
		Client:  &http.Client{},
	}
}

// Call makes an HTTP request to the configured base URL
func (c *HTTPClient) Call(path string, method string, body interface{}) ([]byte, error) {
	url := c.BaseURL + path
	log.Printf("Making %s request to: %s", method, url)

	var reqBody io.Reader = nil
	if body != nil {
		b, err := json.Marshal(body)
		if err != nil {
			return nil, err
		}
		reqBody = bytes.NewBuffer(b)
	}

	req, err := http.NewRequest(method, url, reqBody)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := c.Client.Do(req)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	return io.ReadAll(resp.Body)
}

