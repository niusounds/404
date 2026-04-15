package tasks

import (
	"context"

	"github.com/niusounds/horror-blog-daemon/internal/config"
	"github.com/niusounds/horror-blog-daemon/internal/utils"
)

// PostGenerationTask generates new horror story posts
type PostGenerationTask struct {
	BaseTask
	config *config.Config
	logger *utils.Logger
}

// NewPostGenerationTask creates a new post generation task
func NewPostGenerationTask(cfg *config.Config, logger *utils.Logger) *PostGenerationTask {
	return &PostGenerationTask{
		BaseTask: BaseTask{Name: "post_generation"},
		config:   cfg,
		logger:   logger,
	}
}

// Execute generates a new post
func (t *PostGenerationTask) Execute(ctx context.Context) TaskResult {
	t.logger.Info(t.Name, "Starting post generation...")

	// TODO: Implement post generation logic
	// - Check LLM availability
	// - Call Ollama/LM Studio
	// - Save markdown
	// - Git commit

	return TaskResult{
		Success: true,
		Message: "Post generation task placeholder - not yet implemented",
		Details: map[string]interface{}{
			"status": "pending_implementation",
		},
	}
}
