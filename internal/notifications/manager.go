package notifications

import (
	"fmt"
	"time"

	"github.com/niusounds/horror-blog-daemon/internal/config"
	"github.com/niusounds/horror-blog-daemon/internal/tasks"
	"github.com/niusounds/horror-blog-daemon/internal/utils"
)

// Manager handles notifications
type Manager struct {
	config *config.Config
	logger *utils.Logger
}

// NewManager creates a new notification manager
func NewManager(cfg *config.Config, logger *utils.Logger) *Manager {
	return &Manager{
		config: cfg,
		logger: logger,
	}
}

// NotifySuccess sends a success notification
func (m *Manager) NotifySuccess(taskName string, result tasks.TaskResult) {
	message := fmt.Sprintf("✅ %s: %s", taskName, result.Message)
	m.logger.Info("Notifications", message)

	// Send to Slack if enabled
	if contains(m.config.Notifications.EnabledChannels, "slack") && m.config.Notifications.Slack.Enabled {
		if m.config.Notifications.Slack.NotifyOnSuccess {
			m.sendSlack(message, "good")
		}
	}
}

// NotifyError sends an error notification
func (m *Manager) NotifyError(taskName string, result tasks.TaskResult, err error) {
	message := fmt.Sprintf("❌ %s: %s", taskName, result.Message)
	errorMsg := fmt.Sprintf("Error: %v", err)

	m.logger.Error("Notifications", message)
	m.logger.Error("Notifications", errorMsg)

	// Send to GitHub Issues if enabled
	if contains(m.config.Notifications.EnabledChannels, "github_issues") && m.config.Notifications.GitHub.Enabled {
		if m.config.Notifications.GitHub.AutoIssue {
			m.createGitHubIssue(taskName, result, err)
		}
	}

	// Send to Slack if enabled
	if contains(m.config.Notifications.EnabledChannels, "slack") && m.config.Notifications.Slack.Enabled {
		if m.config.Notifications.Slack.NotifyOnError {
			m.sendSlack(fmt.Sprintf("%s\n%s", message, errorMsg), "danger")
		}
	}

	// Send email if enabled
	if contains(m.config.Notifications.EnabledChannels, "email") && m.config.Notifications.Email.Enabled {
		m.sendEmail(taskName, result, err)
	}
}

// createGitHubIssue creates a GitHub issue for the error
func (m *Manager) createGitHubIssue(taskName string, result tasks.TaskResult, err error) {
	title := fmt.Sprintf("🔴 Maintenance: %s failed", taskName)
	body := fmt.Sprintf("## Task: %s\n\n**Status**: ❌ Failed\n\n**Error**: %s\n\n**Details**:\n```\n%v\n```\n", taskName, result.Message, err)

	cmd := fmt.Sprintf(`issue create --title "%s" --body "%s" --labels "maintenance,automated,error"`, title, body)
	execResult := utils.ExecGhCommand(cmd, 10*time.Second)

	if execResult.Success {
		m.logger.Info("Notifications", fmt.Sprintf("GitHub issue created for %s", taskName))
	} else {
		m.logger.Warn("Notifications", fmt.Sprintf("Failed to create GitHub issue: %s", execResult.Stderr))
	}
}

// sendSlack sends a Slack message
func (m *Manager) sendSlack(message string, color string) {
	// TODO: Implement Slack notification
	m.logger.Debug("Notifications", fmt.Sprintf("Slack notification (would send): %s", message))
}

// sendEmail sends an email notification
func (m *Manager) sendEmail(taskName string, result tasks.TaskResult, err error) {
	// TODO: Implement email notification
	m.logger.Debug("Notifications", fmt.Sprintf("Email notification (would send) for task: %s", taskName))
}

// Helper function to check if string is in slice
func contains(slice []string, item string) bool {
	for _, v := range slice {
		if v == item {
			return true
		}
	}
	return false
}
