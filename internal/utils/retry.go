package utils

import (
	"fmt"
	"math"
	"time"
)

// RetryConfig holds retry configuration
type RetryConfig struct {
	MaxRetries       int
	InitialDelay     time.Duration
	BackoffMultiplier float64
	MaxDelay         time.Duration
}

// Retry executes a function with retry logic
func Retry(config RetryConfig, fn func() error, logger *Logger, taskName string) error {
	var lastErr error
	delay := config.InitialDelay

	for attempt := 1; attempt <= config.MaxRetries; attempt++ {
		if logger != nil {
			logger.Info("Retry", fmt.Sprintf("Attempt %d/%d for %s", attempt, config.MaxRetries, taskName))
		}

		err := fn()
		if err == nil {
			return nil // Success
		}

		lastErr = err

		if attempt == config.MaxRetries {
			if logger != nil {
				logger.Error("Retry", fmt.Sprintf("All %d attempts failed for %s: %v", config.MaxRetries, taskName, err))
			}
			return fmt.Errorf("max retries exceeded: %w", err)
		}

		// Wait before retry
		if logger != nil {
			logger.Warn("Retry", fmt.Sprintf("Attempt %d failed, retrying in %v: %v", attempt, delay, err))
		}
		time.Sleep(delay)

		// Exponential backoff
		newDelay := time.Duration(math.Min(
			float64(delay)*config.BackoffMultiplier,
			float64(config.MaxDelay),
		))
		delay = newDelay
	}

	return lastErr
}
