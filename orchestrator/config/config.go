package config

import (
	"os"
	"strconv"
)

type Config struct {
	ServerPort     string
	ServerAddress  string
	PythonAPIURL   string
	TLSCertFile    string
	TLSKeyFile     string
	MCPConfigFile  string
	MCPModel       string
	MCPStreaming   bool
	MCPQuiet       bool
	AllowedOrigins []string
}

func Load() *Config {
	return &Config{
		ServerPort:     getEnv("SERVER_PORT", "8080"),
		ServerAddress:  getEnv("SERVER_ADDRESS", "localhost"),
		PythonAPIURL:   getEnv("PYTHON_API_URL", "http://localhost:8000"),
		TLSCertFile:    getEnv("TLS_CERT_FILE", "localhost+2.pem"),
		TLSKeyFile:     getEnv("TLS_KEY_FILE", "localhost+2-key.pem"),
		MCPConfigFile:  getEnv("MCP_CONFIG_FILE", "/Users/the.narcissist.coder/karm/local.json"),
		MCPModel:       getEnv("MCP_MODEL", "ollama:qwen2.5"),
		MCPStreaming:   getEnvBool("MCP_STREAMING", true),
		MCPQuiet:       getEnvBool("MCP_QUIET", true),
		AllowedOrigins: getEnvSlice("ALLOWED_ORIGINS", []string{"*"}),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvBool(key string, defaultValue bool) bool {
	if value := os.Getenv(key); value != "" {
		if parsed, err := strconv.ParseBool(value); err == nil {
			return parsed
		}
	}
	return defaultValue
}

func getEnvSlice(key string, defaultValue []string) []string {
	if value := os.Getenv(key); value != "" {
		// Simple comma-separated values parsing
		if value == "*" {
			return []string{"*"}
		}
		// Could add more sophisticated parsing here
		return []string{value}
	}
	return defaultValue
}

