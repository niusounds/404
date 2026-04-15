package tasks

import (
	"context"
)

// TaskResult holds the result of task execution
type TaskResult struct {
	Success bool
	Message string
	Details map[string]interface{}
	Error   string
}

// TaskExecutor defines the interface for task execution
type TaskExecutor interface {
	// Execute runs the task and returns a result
	Execute(ctx context.Context) TaskResult

	// GetName returns the name of the task
	GetName() string
}

// BaseTask provides common functionality for all tasks
type BaseTask struct {
	Name string
}

// GetName returns the task name
func (bt *BaseTask) GetName() string {
	return bt.Name
}
