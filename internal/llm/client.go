package llm

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// Client communicates with Ollama-compatible / LM Studio / OpenAI-format APIs.
type Client struct {
	URL         string // e.g. http://localhost:11434 or http://host.docker.internal:1234
	Model       string // e.g. ornith-35b, gemma3
	Temperature float64
	HTTPClient  *http.Client
}

// NewClient creates an Ollama/LM Studio compatible client.
func NewClient(baseURL, model string, temperature float64) *Client {
	return &Client{
		URL:         baseURL,
		Model:       model,
		Temperature: temperature,
		HTTPClient:  &http.Client{Timeout: 5 * time.Minute},
	}
}

// Message is an OpenAI-format chat message.
type Message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

// Generate sends a structured prompt and returns the generated text.
func (c *Client) Generate(ctx context.Context, systemPrompt, userPrompt string, opts ...Option) (string, error) {
	cfg := DefaultOptions()
	for _, o := range opts {
		o(&cfg)
	}

	messages := []Message{
		{Role: "system", Content: systemPrompt},
		{Role: "user", Content: userPrompt},
	}

	reqBody := map[string]interface{}{
		"model":       c.Model,
		"messages":    messages,
		"temperature": cfg.Temperature,
		"stream":      false,
	}
	if cfg.Stop != "" {
		reqBody["stop"] = []string{cfg.Stop}
	}

	jsonBody, err := json.Marshal(reqBody)
	if err != nil {
		return "", fmt.Errorf("marshaling request body: %w", err)
	}

	url := c.URL + "/v1/chat/completions"
	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewReader(jsonBody))
	if err != nil {
		return "", fmt.Errorf("creating request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("HTTP call to LLM: %w (endpoint=%s)", err, url)
	}
	defer resp.Body.Close()

	bodyBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return "", fmt.Errorf("reading response body: %w", err)
	}

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("LLM returned %d: %s (model=%s)", resp.StatusCode, string(bodyBytes), c.Model)
	}

	var result chatResponse
	if err := json.Unmarshal(bodyBytes, &result); err != nil {
		return "", fmt.Errorf("unmarshaling LLM response: %w; raw=%s", err, string(bodyBytes))
	}

	content := result.Choices[0].Message.Content
	if content == "" {
		return "", fmt.Errorf("empty content from LLM (model=%s)", c.Model)
	}
	return content, nil
}

// Ping checks if the LLM service is reachable.
func (c *Client) Ping(ctx context.Context) error {
	url := c.URL + "/v1/models"
	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return err
	}
	resp, err := c.HTTPClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("LLM ping returned %d", resp.StatusCode)
	}
	return nil
}

// --- internal types ---

type chatResponse struct {
	Choices []struct {
		Message Message `json:"message"`
	} `json:"choices"`
}

// Option lets callers override defaults.
type Option func(*options)
type options struct {
	Temperature float64
	Stop        string
}

func DefaultOptions() options { return options{Temperature: 0.8} }
func WithTemperature(t float64) Option { return func(o *options) { o.Temperature = t } }
