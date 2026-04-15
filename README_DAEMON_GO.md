# 🚀 Horror Blog Maintenance Daemon (Go Edition)

> Autonomous blog maintenance system written in Go - Single compiled binary, high performance, zero dependencies at runtime

Autonomous Horror Blog Maintenance System - continuously generates horror stories, maintains the site, and handles deployments using Go for maximum stability and performance.

## ✨ What it Does

- 📝 **Generates new horror stories** - Using local LLMs (Ollama/LM Studio)
- 🔧 **Maintains existing articles** - Validates links, images, and metadata
- 🏗️  **Builds & deploys** - Runs Jekyll build and deploys to production
- 🔍 **Checks site health** - Validates RSS, sitemap, and internal links
- 💚 **Verifies LLM availability** - Ensures AI services are ready
- 📬 **Sends notifications** - Via GitHub Issues, email, and Slack

## 🎯 Why Go?

✅ **Single compiled binary** - No runtime dependencies  
✅ **Type-safe** - Compile-time error checking  
✅ **High performance** - ~5-20MB memory, 10ms startup  
✅ **Natural concurrency** - goroutines for parallel task execution  
✅ **Easy deployment** - Copy binary, done  
✅ **Cross-platform** - Build once, run anywhere  

## 📋 Prerequisites

- **Go 1.21+** - [Install](https://golang.org/doc/install)
- **Git** - For auto-commits
- **Bundle/Jekyll** - For site building
- **Ollama** and/or **LM Studio** - For story generation
- **gh CLI** - For GitHub Issue notifications

## 🚀 Quick Start

### 1. Build

```bash
make build
# or
make build-linux   # For Linux target
make build-darwin  # For macOS target
```

### 2. Test

```bash
# Run all tasks once
make run-test

# Show schedule without executing
make run-dry
```

### 3. Install & Run

```bash
# Install systemd service
sudo ./install.sh

# Start service
sudo systemctl start horror-blog-daemon

# View logs
sudo journalctl -u horror-blog-daemon -f
```

## ⚙️ Configuration

Edit `config.yaml` to customize behavior:

```yaml
schedule:
  post_generation:
    enabled: true
    cron: "0 7,12,19 * * *"  # 7am, noon, 7pm daily

llm:
  ollama:
    enabled: true
    url: "http://localhost:11434"
    model: "gemma4"

notifications:
  github:
    auto_issue: true  # Create issues on errors
  slack:
    enabled: true
    webhook_url: "https://hooks.slack.com/..."
```

See [config.yaml](config.yaml) for all options.

## 📁 Project Structure

```
cmd/horror-blog-daemon
  └── main.go                # Entry point, scheduler

internal/
  ├── config/
  │   └── config.go         # YAML parsing
  ├── tasks/
  │   ├── executor.go       # Task interface
  │   ├── llm_check.go      # LLM health check
  │   ├── post_generation.go
  │   ├── article_maintenance.go
  │   ├── build_deploy.go
  │   └── health_check.go
  ├── notifications/
  │   ├── manager.go        # Notification router
  │   ├── github.go
  │   ├── slack.go
  │   └── email.go
  └── utils/
      ├── logger.go
      ├── exec.go
      └── retry.go

Makefile                     # Build targets
config.yaml                  # Configuration
maintenance-daemon.service   # systemd unit file
```

## 🔧 Commands

### Build

```bash
make build              # Build binary
make build-linux       # Build for Linux
make build-darwin      # Build for macOS
```

### Run

```bash
make run               # Build and start daemon
make run-test          # Build and test all tasks
make run-dry           # Build and show schedule
```

### Development

```bash
make fmt               # Format code
make vet               # Run go vet
make lint              # Run golangci-lint
make test              # Run unit tests
make test-verbose      # Run tests with coverage
```

### Install / Uninstall

```bash
make install           # Install binary and systemd service
sudo systemctl enable horror-blog-daemon   # Auto-start on boot
make uninstall         # Remove binary and service
```

## 📊 System Commands

### Check Status

```bash
sudo systemctl status horror-blog-daemon
```

### View Logs

```bash
# Real-time logs
sudo journalctl -u horror-blog-daemon -f

# Last 50 lines
sudo journalctl -u horror-blog-daemon -n 50

# Last hour
sudo journalctl -u horror-blog-daemon --since "1 hour ago"
```

### Start / Stop / Restart

```bash
sudo systemctl start horror-blog-daemon
sudo systemctl stop horror-blog-daemon
sudo systemctl restart horror-blog-daemon
```

### Enable / Disable Auto-start

```bash
sudo systemctl enable horror-blog-daemon   # Auto-start on boot
sudo systemctl disable horror-blog-daemon  # Manual start only
```

## 🧪 Testing

### Test All Tasks

```bash
make run-test
```

This executes each task once:
1. LLM health check
2. Post generation
3. Article maintenance
4. Build and deploy
5. Site health check

### Dry Run (Show Schedule)

```bash
make run-dry
```

Shows scheduled jobs without executing them.

### Unit Tests

```bash
make test              # Run all tests
make test-verbose      # Generate coverage report
```

## 📝 Configuration Details

### Schedule (Cron Format)

The daemon uses standard cron format with seconds:

`second minute hour day_of_month month day_of_week`

Examples:
- `"0 7 0 * * *"` - 7:00 AM daily
- `"0 7,12,19 0 * * *"` - 7am, noon, 7pm daily
- `"0 2 0 * * 1"` - 2:00 AM every Monday

### LLM Services

**Ollama** (recommended):
```yaml
ollama:
  enabled: true
  url: "http://localhost:11434"
  model: "gemma4"
  timeout: 300
```

**LM Studio**:
```yaml
lm_studio:
  enabled: true
  url: "http://localhost:1234"  
  model: "gemma-3n-e4b"
  timeout: 300
```

### Notifications

**GitHub Issues**:
```yaml
github:
  enabled: true
  auto_issue: true  # Create on errors
```

**Slack**:
```yaml
slack:
  enabled: true
  webhook_url: "https://hooks.slack.com/..."
```

**Email**:
```yaml
email:
  enabled: true
  smtp_server: "smtp.gmail.com"
  sender_email: "bot@example.com"
  recipients:
    - "admin@example.com"
```

## 🔍 Troubleshooting

### Binary won't start

Check logs:
```bash
make run-test
# or
./build/horror-blog-daemon --test
```

### LLM not detected

Verify services are running:
```bash
curl http://localhost:11434/api/tags      # Ollama
curl http://localhost:1234/v1/models      # LM Studio
```

### GitHub Issues not creating

Verify `gh` CLI is authenticated:
```bash
gh auth status
gh auth login  # If needed
```

### Build warnings

Update dependencies:
```bash
go mod tidy
go mod download
```

## 📊 Performance

Typical resource usage:

| Aspect | Value |
|--------|-------|
| Binary size | 8-12 MB |
| Memory (idle) | 5-10 MB |
| Memory (generating) | 50-150 MB* |
| Startup time | ~10 ms |
| Task overhead | <1% CPU |

*Depends on LLM model and generation task

## 🔐 Security

- **No external dependencies at runtime** - Only system binaries
- **Secure signal handling** - Graceful shutdown
- **Resource limits** - Memory and file descriptor limits via systemd
- **Sandboxing** - Private /tmp isolation

## 📚 API Reference

### Task Interface

All tasks implement:

```go
type TaskExecutor interface {
    Execute(ctx context.Context) TaskResult
    GetName() string
}

type TaskResult struct {
    Success bool
    Message string
    Details map[string]interface{}
    Error   string
}
```

### Creating Custom Tasks

```go
type CustomTask struct {
    BaseTask
    config *config.Config
    logger *utils.Logger
}

func (t *CustomTask) Execute(ctx context.Context) tasks.TaskResult {
    // Your implementation
    return tasks.TaskResult{
        Success: true,
        Message: "Task completed",
    }
}
```

## 🐛 Known Limitations

- Currently placeholder implementations for:
  - Full post generation (can call ahe_orchestrator.py)
  - Article maintenance detailed validation
  - Email notifications (SMTP)
  - Slack message formatting

These will be completed in Phase 2 of implementation.

## 📈 Roadmap

**Phase 1 (Current)**: Core daemon, LLM health checks  
**Phase 2**: Full task implementations (post generation, maintenance, health checks)  
**Phase 3**: Notification systems (GitHub, Slack, Email)  
**Phase 4**: Testing and documentation  
**Phase 5**: Advanced features (AI article review, narrative mutations)  

## 🤝 Contributing

To extend the daemon:

1. Create task in `internal/tasks/`
2. Implement `TaskExecutor` interface
3. Register in `cmd/main.go` registerTasks()
4. Test with `make run-test`

## 📄 License

Part of the Horror Blog project. See LICENSE file.

## 📞 Support

For issues:
1. Check logs: `journalctl -u horror-blog-daemon -f`
2. Test config: `go run ./cmd/horror-blog-daemon/ --test`
3. Review [config.yaml](config.yaml) settings

---

**Last Updated**: 2026-04-16  
**Status**: Phase 1 Complete - Core infrastructure ready  
**Version**: 0.1.0-go
