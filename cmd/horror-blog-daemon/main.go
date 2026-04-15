package main

import (
	"context"
	"flag"
	"fmt"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/robfig/cron/v3"

	"github.com/niusounds/horror-blog-daemon/internal/config"
	"github.com/niusounds/horror-blog-daemon/internal/notifications"
	"github.com/niusounds/horror-blog-daemon/internal/tasks"
	"github.com/niusounds/horror-blog-daemon/internal/utils"
)

func main() {
	// Parse command line flags
	configPath := flag.String("config", "config.yaml", "Path to config file")
	testMode := flag.Bool("test", false, "Run all tasks once and exit")
	dryRun := flag.Bool("dry-run", false, "Show scheduled tasks without running them")
	flag.Parse()

	// Load configuration
	cfg, err := config.LoadConfig(*configPath)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Failed to load config: %v\n", err)
		os.Exit(1)
	}

	// Setup logger
	logger, err := utils.NewLogger(cfg.Logging.LogDir)
	if err != nil {
		fmt.Fprintf(os.Stderr, "Failed to setup logger: %v\n", err)
		os.Exit(1)
	}
	defer logger.Close()

	logger.Info("MaintenanceDaemon", "================================")
	logger.Info("MaintenanceDaemon", "🚀 HORROR BLOG MAINTENANCE DAEMON")
	logger.Info("MaintenanceDaemon", "================================")

	// Create notification manager
	notificationMgr := notifications.NewManager(cfg, logger)

	// Create daemon
	daemon := NewDaemon(cfg, logger, notificationMgr)

	// Run in test mode if requested
	if *testMode {
		logger.Info("MaintenanceDaemon", "Running in TEST mode...")
		daemon.RunTests()
		return
	}

	// Run in dry-run mode if requested
	if *dryRun {
		logger.Info("MaintenanceDaemon", "Running in DRY-RUN mode (showing schedule only)...")
		daemon.DryRun()
		return
	}

	// Start daemon
	daemon.Start()
}

// Daemon orchestrates task scheduling and execution
type Daemon struct {
	config       *config.Config
	logger       *utils.Logger
	notifications *notifications.Manager
	scheduler    *cron.Cron
	tasks        map[string]tasks.TaskExecutor
}

// NewDaemon creates a new daemon instance
func NewDaemon(cfg *config.Config, logger *utils.Logger, notifMgr *notifications.Manager) *Daemon {
	return &Daemon{
		config:       cfg,
		logger:       logger,
		notifications: notifMgr,
		tasks:        make(map[string]tasks.TaskExecutor),
	}
}

// Start starts the daemon
func (d *Daemon) Start() {
	d.logger.Info("Daemon", "Starting daemon...")

	// Initialize scheduler
	d.scheduler = cron.New(cron.WithSeconds())

	// Register tasks
	d.registerTasks()

	// Setup signal handling
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, syscall.SIGTERM, syscall.SIGINT)

	// Start scheduler in separate goroutine
	go d.scheduler.Start()

	d.logger.Info("Daemon", "Waiting for scheduled tasks...")
	d.logger.Info("Daemon", fmt.Sprintf("Scheduler running with %d jobs", len(d.scheduler.Entries())))

	// Wait for signal
	sig := <-sigChan
	d.logger.Info("Daemon", fmt.Sprintf("Received signal %v, shutting down gracefully...", sig))

	// Stop scheduler
	<-d.scheduler.Stop().Done()
	d.logger.Info("Daemon", "Daemon stopped.")
}

// registerTasks registers all enabled tasks with the scheduler
func (d *Daemon) registerTasks() {
	d.logger.Info("Daemon", "Registering tasks...")

	// Post Generation
	if d.config.Schedule.PostGeneration.Enabled {
		task := tasks.NewPostGenerationTask(d.config, d.logger)
		d.tasks["post_generation"] = task

		_, err := d.scheduler.AddFunc(d.config.Schedule.PostGeneration.Cron, func() {
			d.executeTask("post_generation", task)
		})
		if err != nil {
			d.logger.Error("Daemon", fmt.Sprintf("Failed to register post_generation: %v", err))
			d.scheduler = cron.New(cron.WithSeconds())
			d.logger.Info("Daemon", fmt.Sprintf("✓ Registered post_generation: %s", d.config.Schedule.PostGeneration.Cron))
		}
	}

	// Article Maintenance
	if d.config.Schedule.ArticleMaintenance.Enabled {
		task := tasks.NewArticleMaintenanceTask(d.config, d.logger)
		d.tasks["article_maintenance"] = task

		_, err := d.scheduler.AddFunc(d.config.Schedule.ArticleMaintenance.Cron, func() {
			d.executeTask("article_maintenance", task)
		})
		if err != nil {
			d.logger.Error("Daemon", fmt.Sprintf("Failed to register article_maintenance: %v", err))
			d.scheduler = cron.New(cron.WithSeconds())
			d.logger.Info("Daemon", fmt.Sprintf("✓ Registered article_maintenance: %s", d.config.Schedule.ArticleMaintenance.Cron))
		}
	}

	// Build and Deploy
	if d.config.Schedule.BuildAndDeploy.Enabled {
		task := tasks.NewBuildAndDeployTask(d.config, d.logger)
		d.tasks["build_and_deploy"] = task

		_, err := d.scheduler.AddFunc(d.config.Schedule.BuildAndDeploy.Cron, func() {
			d.executeTask("build_and_deploy", task)
		})
		if err != nil {
			d.logger.Error("Daemon", fmt.Sprintf("Failed to register build_and_deploy: %v", err))
		} else {
			d.logger.Info("Daemon", fmt.Sprintf("✓ Registered build_and_deploy: %s", d.config.Schedule.BuildAndDeploy.Cron))
		}
	}

	// Site Health Check
	if d.config.Schedule.SiteHealthCheck.Enabled {
		task := tasks.NewSiteHealthCheckTask(d.config, d.logger)
		d.tasks["site_health_check"] = task

		_, err := d.scheduler.AddFunc(d.config.Schedule.SiteHealthCheck.Cron, func() {
			d.executeTask("site_health_check", task)
		})
		if err != nil {
			d.logger.Error("Daemon", fmt.Sprintf("Failed to register site_health_check: %v", err))
		} else {
			d.logger.Info("Daemon", fmt.Sprintf("✓ Registered site_health_check: %s", d.config.Schedule.SiteHealthCheck.Cron))
		}
	}

	// LLM Health Check
	if d.config.Schedule.LLMHealthCheck.Enabled {
		task := tasks.NewLLMHealthCheckTask(d.config, d.logger)
		d.tasks["llm_health_check"] = task

		_, err := d.scheduler.AddFunc(d.config.Schedule.LLMHealthCheck.Cron, func() {
			d.executeTask("llm_health_check", task)
		})
		if err != nil {
			d.logger.Error("Daemon", fmt.Sprintf("Failed to register llm_health_check: %v", err))
		} else {
			d.logger.Info("Daemon", fmt.Sprintf("✓ Registered llm_health_check: %s", d.config.Schedule.LLMHealthCheck.Cron))
		}
	}
}

// executeTask executes a single task with error handling
func (d *Daemon) executeTask(taskName string, task tasks.TaskExecutor) {
	d.logger.Info("Daemon", fmt.Sprintf("========== EXECUTING: %s ==========", taskName))

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Minute)
	defer cancel()

	result := task.Execute(ctx)

	if result.Success {
		d.logger.Info("Daemon", fmt.Sprintf("✓ %s completed successfully: %s", taskName, result.Message))
		d.notifications.NotifySuccess(taskName, result)
	} else {
		d.logger.Error("Daemon", fmt.Sprintf("✗ %s failed: %s", taskName, result.Message))
		d.notifications.NotifyError(taskName, result, fmt.Errorf(result.Error))
	}

	d.logger.Info("Daemon", "==========================================")
}

// RunTests runs all tasks once for testing
func (d *Daemon) RunTests() {
	d.logger.Info("Daemon", "Running all tasks in TEST mode...")

	d.scheduler = cron.New()
	d.registerTasks()

	for taskName, task := range d.tasks {
		d.logger.Info("Daemon", fmt.Sprintf("Testing: %s", taskName))
		d.executeTask(taskName, task)
		time.Sleep(1 * time.Second) // Brief pause between tasks
	}

	d.logger.Info("Daemon", "Test mode completed.")
}

// DryRun shows the schedule without executing
func (d *Daemon) DryRun() {
	d.logger.Info("Daemon", "DRY RUN: Showing schedule (no execution)...")

	d.scheduler = cron.New()
	d.registerTasks()

	entries := d.scheduler.Entries()
	d.logger.Info("Daemon", fmt.Sprintf("Scheduled jobs (%d):", len(entries)))

	for _, entry := range entries {
		d.logger.Info("Daemon", fmt.Sprintf("  - Task: %s Schedule: %v", entry.ID, entry.Schedule))
	}

	d.logger.Info("Daemon", "Dry run completed.")
}
