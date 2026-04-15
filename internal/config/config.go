package config

import (
	"fmt"
	"log"
	"os"

	"gopkg.in/yaml.v3"
)

// Config represents the daemon configuration
type Config struct {
	Schedule       ScheduleConfig       `yaml:"schedule"`
	Logging        LoggingConfig        `yaml:"logging"`
	Blog           BlogConfig           `yaml:"blog"`
	Git            GitConfig            `yaml:"git"`
	LLM            LLMConfig            `yaml:"llm"`
	PostGeneration PostGenConfig        `yaml:"post_generation"`
	Build          BuildConfig          `yaml:"build"`
	HealthCheck    HealthCheckConfig    `yaml:"health_check"`
	Notifications  NotificationsConfig  `yaml:"notifications"`
	ErrorHandling  ErrorHandlingConfig  `yaml:"error_handling"`
	Features       FeaturesConfig       `yaml:"features"`
}

// ScheduleConfig defines cron schedules for each task
type ScheduleConfig struct {
	PostGeneration   TaskSchedule `yaml:"post_generation"`
	ArticleMaintenance TaskSchedule `yaml:"article_maintenance"`
	BuildAndDeploy   TaskSchedule `yaml:"build_and_deploy"`
	SiteHealthCheck  TaskSchedule `yaml:"site_health_check"`
	LLMHealthCheck   TaskSchedule `yaml:"llm_health_check"`
}

// TaskSchedule defines a single task's schedule
type TaskSchedule struct {
	Enabled     bool   `yaml:"enabled"`
	Cron        string `yaml:"cron"`
	Description string `yaml:"description"`
}

// LoggingConfig defines logging behavior
type LoggingConfig struct {
	Level         string `yaml:"level"`
	LogDir        string `yaml:"log_dir"`
	RetentionDays int    `yaml:"retention_days"`
}

// BlogConfig defines blog directory settings
type BlogConfig struct {
	PostsDir   string `yaml:"posts_dir"`
	AssetsDir  string `yaml:"assets_dir"`
	ImagesDir  string `yaml:"images_dir"`
	JekyllSource string `yaml:"jekyll_source"`
	JekyllOutput string `yaml:"jekyll_output"`
}

// GitConfig defines git settings
type GitConfig struct {
	AutoCommit   bool   `yaml:"auto_commit"`
	RepoDir      string `yaml:"repo_dir"`
	CommitPrefix string `yaml:"commit_prefix"`
}

// LLMConfig defines LLM service settings
type LLMConfig struct {
	Ollama     OllamaConfig  `yaml:"ollama"`
	LMStudio   LMStudioConfig `yaml:"lm_studio"`
	MaxRetries int           `yaml:"max_retries"`
	RetryDelay int           `yaml:"retry_delay"`
}

// OllamaConfig defines Ollama settings
type OllamaConfig struct {
	Enabled bool   `yaml:"enabled"`
	URL     string `yaml:"url"`
	Model   string `yaml:"model"`
	Timeout int    `yaml:"timeout"`
}

// LMStudioConfig defines LM Studio settings
type LMStudioConfig struct {
	Enabled bool   `yaml:"enabled"`
	URL     string `yaml:"url"`
	Model   string `yaml:"model"`
	Timeout int    `yaml:"timeout"`
}

// PostGenConfig defines post generation settings
type PostGenConfig struct {
	CheckDiversity     bool   `yaml:"check_diversity"`
	RecentPostsToCheck int    `yaml:"recent_posts_to_check"`
	Temperature        float64 `yaml:"temperature"`
	MaxAttempts        int     `yaml:"max_attempts"`
	Source             string  `yaml:"source"`
}

// BuildConfig defines build and deployment settings
type BuildConfig struct {
	Command     string         `yaml:"command"`
	Timeout     int            `yaml:"timeout"`
	AutoDeploy  bool           `yaml:"auto_deploy"`
	DeployType  string         `yaml:"deploy_type"`
	DeployTarget string        `yaml:"deploy_target"`
	GitHubPages GitHubPagesConfig `yaml:"github_pages"`
}

// GitHubPagesConfig defines GitHub Pages deployment
type GitHubPagesConfig struct {
	Enabled  bool   `yaml:"enabled"`
	AutoPush bool   `yaml:"auto_push"`
	Branch   string `yaml:"branch"`
}

// HealthCheckConfig defines site health check settings
type HealthCheckConfig struct {
	CheckLinks         bool     `yaml:"check_links"`
	CheckImages        bool     `yaml:"check_images"`
	CheckRSS           bool     `yaml:"check_rss"`
	CheckSitemap       bool     `yaml:"check_sitemap"`
	CreateIssueOnError bool     `yaml:"create_issue_on_error"`
	IssueLabels        []string `yaml:"issue_labels"`
}

// NotificationsConfig defines notification settings
type NotificationsConfig struct {
	EnabledChannels []string              `yaml:"enabled_channels"`
	GitHub          GitHubNotifyConfig    `yaml:"github"`
	Email           EmailConfig           `yaml:"email"`
	Slack           SlackConfig           `yaml:"slack"`
}

// GitHubNotifyConfig defines GitHub notification settings
type GitHubNotifyConfig struct {
	Enabled       bool   `yaml:"enabled"`
	AutoIssue     bool   `yaml:"auto_issue"`
	IssueType     string `yaml:"issue_type"`
	IssueAssignee string `yaml:"issue_assignee"`
}

// EmailConfig defines email notification settings
type EmailConfig struct {
	Enabled            bool     `yaml:"enabled"`
	SMTPServer         string   `yaml:"smtp_server"`
	SMTPPort           int      `yaml:"smtp_port"`
	SenderEmail        string   `yaml:"sender_email"`
	Recipients         []string `yaml:"recipients"`
	SendDailyDigest    bool     `yaml:"send_daily_digest"`
	DigestTime         string   `yaml:"digest_time"`
}

// SlackConfig defines Slack notification settings
type SlackConfig struct {
	Enabled          bool   `yaml:"enabled"`
	WebhookURL       string `yaml:"webhook_url"`
	Channel          string `yaml:"channel"`
	NotifyOnSuccess  bool   `yaml:"notify_on_success"`
	NotifyOnError    bool   `yaml:"notify_on_error"`
}

// ErrorHandlingConfig defines error handling behavior
type ErrorHandlingConfig struct {
	MaxRetries           int     `yaml:"max_retries"`
	InitialRetryDelay    int     `yaml:"initial_retry_delay"`
	BackoffMultiplier    float64 `yaml:"backoff_multiplier"`
	MaxRetryDelay        int     `yaml:"max_retry_delay"`
	HaltOnBuildFailure   bool    `yaml:"halt_on_build_failure"`
	HaltOnLLMFailure     bool    `yaml:"halt_on_llm_failure"`
	AutoRollback         bool    `yaml:"auto_rollback"`
	DumpErrorContext     bool    `yaml:"dump_error_context"`
	ErrorLogDir          string  `yaml:"error_log_dir"`
}

// FeaturesConfig defines feature flags
type FeaturesConfig struct {
	AIArticleReview    bool `yaml:"ai_article_review"`
	NarrativeMutations bool `yaml:"narrative_mutations"`
	ImageGeneration    bool `yaml:"image_generation"`
	SEOOptimization    bool `yaml:"seo_optimization"`
}

// LoadConfig loads configuration from YAML file
func LoadConfig(path string) (*Config, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("failed to read config file: %w", err)
	}

	cfg := &Config{}
	if err := yaml.Unmarshal(data, cfg); err != nil {
		return nil, fmt.Errorf("failed to parse config file: %w", err)
	}

	// Set defaults
	cfg.setDefaults()

	// Validate
	if err := cfg.Validate(); err != nil {
		return nil, fmt.Errorf("config validation failed: %w", err)
	}

	return cfg, nil
}

// setDefaults sets default values for missing config fields
func (c *Config) setDefaults() {
	if c.Logging.LogDir == "" {
		c.Logging.LogDir = "logs"
	}
	if c.Logging.Level == "" {
		c.Logging.Level = "INFO"
	}
	if c.Logging.RetentionDays == 0 {
		c.Logging.RetentionDays = 30
	}

	if c.Blog.PostsDir == "" {
		c.Blog.PostsDir = "_posts"
	}
	if c.Blog.AssetsDir == "" {
		c.Blog.AssetsDir = "assets"
	}
	if c.Blog.ImagesDir == "" {
		c.Blog.ImagesDir = "assets/images"
	}
	if c.Blog.JekyllSource == "" {
		c.Blog.JekyllSource = "."
	}
	if c.Blog.JekyllOutput == "" {
		c.Blog.JekyllOutput = "_site"
	}

	if c.Git.RepoDir == "" {
		c.Git.RepoDir = "."
	}
	if c.Git.CommitPrefix == "" {
		c.Git.CommitPrefix = "📝"
	}

	if c.LLM.Ollama.URL == "" {
		c.LLM.Ollama.URL = "http://localhost:11434"
	}
	if c.LLM.Ollama.Model == "" {
		c.LLM.Ollama.Model = "gemma4"
	}
	if c.LLM.Ollama.Timeout == 0 {
		c.LLM.Ollama.Timeout = 300
	}

	if c.LLM.LMStudio.URL == "" {
		c.LLM.LMStudio.URL = "http://localhost:1234"
	}
	if c.LLM.LMStudio.Timeout == 0 {
		c.LLM.LMStudio.Timeout = 300
	}

	if c.LLM.MaxRetries == 0 {
		c.LLM.MaxRetries = 3
	}
	if c.LLM.RetryDelay == 0 {
		c.LLM.RetryDelay = 10
	}

	if c.PostGeneration.Temperature == 0 {
		c.PostGeneration.Temperature = 0.8
	}
	if c.PostGeneration.RecentPostsToCheck == 0 {
		c.PostGeneration.RecentPostsToCheck = 3
	}
	if c.PostGeneration.MaxAttempts == 0 {
		c.PostGeneration.MaxAttempts = 3
	}
	if c.PostGeneration.Source == "" {
		c.PostGeneration.Source = "auto"
	}

	if c.Build.Command == "" {
		c.Build.Command = "bundle exec jekyll build"
	}
	if c.Build.Timeout == 0 {
		c.Build.Timeout = 600
	}
	if c.Build.DeployType == "" {
		c.Build.DeployType = "local"
	}
	if c.Build.GitHubPages.Branch == "" {
		c.Build.GitHubPages.Branch = "main"
	}

	if c.ErrorHandling.MaxRetries == 0 {
		c.ErrorHandling.MaxRetries = 3
	}
	if c.ErrorHandling.InitialRetryDelay == 0 {
		c.ErrorHandling.InitialRetryDelay = 10
	}
	if c.ErrorHandling.BackoffMultiplier == 0 {
		c.ErrorHandling.BackoffMultiplier = 2.0
	}
	if c.ErrorHandling.MaxRetryDelay == 0 {
		c.ErrorHandling.MaxRetryDelay = 300
	}
	if c.ErrorHandling.ErrorLogDir == "" {
		c.ErrorHandling.ErrorLogDir = "logs/errors"
	}
}

// Validate validates the configuration
func (c *Config) Validate() error {
	// Check that at least one schedule is enabled
	hasEnabledTask := c.Schedule.PostGeneration.Enabled ||
		c.Schedule.ArticleMaintenance.Enabled ||
		c.Schedule.BuildAndDeploy.Enabled ||
		c.Schedule.SiteHealthCheck.Enabled ||
		c.Schedule.LLMHealthCheck.Enabled

	if !hasEnabledTask {
		return fmt.Errorf("at least one task must be enabled in schedule")
	}

	// Check that at least one LLM is enabled
	if !c.LLM.Ollama.Enabled && !c.LLM.LMStudio.Enabled {
		log.Println("WARNING: No LLM services enabled in config")
	}

	return nil
}
