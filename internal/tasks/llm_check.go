package tasks

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/niusounds/horror-blog-daemon/internal/config"
	"github.com/niusounds/horror-blog-daemon/internal/utils"
)

// LLMHealthCheckTask checks LLM service availability
type LLMHealthCheckTask struct {
	BaseTask
	config *config.Config
	logger *utils.Logger
	client *http.Client
}

// NewLLMHealthCheckTask creates a new LLM health check task
func NewLLMHealthCheckTask(cfg *config.Config, logger *utils.Logger) *LLMHealthCheckTask {
	return &LLMHealthCheckTask{
		BaseTask: BaseTask{Name: "llm_health_check"},
		config:   cfg,
		logger:   logger,
		client: &http.Client{
			Timeout: time.Duration(cfg.LLM.Ollama.Timeout) * time.Second,
		},
	}
}

// Execute performs the health check
func (t *LLMHealthCheckTask) Execute(ctx context.Context) TaskResult {
	t.logger.Info(t.Name, "Starting LLM health check...")

	results := map[string]interface{}{
		"ollama":         nil,
		"lm_studio":      nil,
		"any_available":  false,
	}

	// Check Ollama
	if t.config.LLM.Ollama.Enabled {
		ollamaResult := t.checkOllama()
		results["ollama"] = ollamaResult

		if ollamaResult["status"] == "ok" {
			results["any_available"] = true
		}
	}

	// Check LM Studio
	if t.config.LLM.LMStudio.Enabled {
		lmStudioResult := t.checkLMStudio()
		results["lm_studio"] = lmStudioResult

		if lmStudioResult["status"] == "ok" {
			results["any_available"] = true
		}
	}

	success := results["any_available"].(bool)

	if success {
		t.logger.Info(t.Name, "At least one LLM service is available")
		return TaskResult{
			Success: true,
			Message: "LLM health check completed: at least one service available",
			Details: results,
		}
	}

	t.logger.Error(t.Name, "No LLM services are available!")
	return TaskResult{
		Success: false,
		Message: "LLM health check failed: no services available",
		Details: results,
		Error:   "NO_LLM_AVAILABLE",
	}
}

// checkOllama checks Ollama service
func (t *LLMHealthCheckTask) checkOllama() map[string]interface{} {
	t.logger.Info(t.Name, "Checking Ollama...")

	url := fmt.Sprintf("%s/api/tags", t.config.LLM.Ollama.URL)
	timeout := time.Duration(t.config.LLM.Ollama.Timeout) * time.Second

	// Create request with timeout
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return map[string]interface{}{
			"status": "error",
			"url":    t.config.LLM.Ollama.URL,
			"error":  err.Error(),
		}
	}

	start := time.Now()
	resp, err := t.client.Do(req)
	elapsed := time.Since(start)

	if err != nil {
		return map[string]interface{}{
			"status": "connection_error",
			"url":    t.config.LLM.Ollama.URL,
			"error":  err.Error(),
		}
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return map[string]interface{}{
			"status":      "error",
			"url":         t.config.LLM.Ollama.URL,
			"http_status": resp.StatusCode,
			"error":       fmt.Sprintf("HTTP %d", resp.StatusCode),
		}
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return map[string]interface{}{
			"status": "error",
			"url":    t.config.LLM.Ollama.URL,
			"error":  err.Error(),
		}
	}

	var data map[string]interface{}
	if err := json.Unmarshal(body, &data); err != nil {
		return map[string]interface{}{
			"status": "error",
			"url":    t.config.LLM.Ollama.URL,
			"error":  err.Error(),
		}
	}

	models := []string{}
	if modelsData, ok := data["models"].([]interface{}); ok {
		for _, m := range modelsData {
			if modelMap, ok := m.(map[string]interface{}); ok {
				if name, ok := modelMap["name"].(string); ok {
					models = append(models, name)
				}
			}
		}
	}

	t.logger.Info(t.Name, fmt.Sprintf("Ollama available with %d models", len(models)))

	return map[string]interface{}{
		"status":           "ok",
		"url":              t.config.LLM.Ollama.URL,
		"model_count":      len(models),
		"models":           models,
		"response_time_ms": elapsed.Milliseconds(),
	}
}

// checkLMStudio checks LM Studio service
func (t *LLMHealthCheckTask) checkLMStudio() map[string]interface{} {
	t.logger.Info(t.Name, "Checking LM Studio...")

	url := fmt.Sprintf("%s/v1/models", t.config.LLM.LMStudio.URL)
	timeout := time.Duration(t.config.LLM.LMStudio.Timeout) * time.Second

	// Create request with timeout
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return map[string]interface{}{
			"status": "error",
			"url":    t.config.LLM.LMStudio.URL,
			"error":  err.Error(),
		}
	}

	start := time.Now()
	resp, err := t.client.Do(req)
	elapsed := time.Since(start)

	if err != nil {
		return map[string]interface{}{
			"status": "connection_error",
			"url":    t.config.LLM.LMStudio.URL,
			"error":  err.Error(),
		}
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return map[string]interface{}{
			"status":      "error",
			"url":         t.config.LLM.LMStudio.URL,
			"http_status": resp.StatusCode,
			"error":       fmt.Sprintf("HTTP %d", resp.StatusCode),
		}
	}

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return map[string]interface{}{
			"status": "error",
			"url":    t.config.LLM.LMStudio.URL,
			"error":  err.Error(),
		}
	}

	var data map[string]interface{}
	if err := json.Unmarshal(body, &data); err != nil {
		return map[string]interface{}{
			"status": "error",
			"url":    t.config.LLM.LMStudio.URL,
			"error":  err.Error(),
		}
	}

	models := []string{}
	if modelsData, ok := data["data"].([]interface{}); ok {
		for _, m := range modelsData {
			if modelMap, ok := m.(map[string]interface{}); ok {
				if id, ok := modelMap["id"].(string); ok {
					models = append(models, id)
				}
			}
		}
	}

	t.logger.Info(t.Name, fmt.Sprintf("LM Studio available with %d models", len(models)))

	return map[string]interface{}{
		"status":           "ok",
		"url":              t.config.LLM.LMStudio.URL,
		"model_count":      len(models),
		"models":           models,
		"response_time_ms": elapsed.Milliseconds(),
	}
}
