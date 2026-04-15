.PHONY: build run test clean install help fmt lint

# Build variables
BINARY_NAME=horror-blog-daemon
BINARY_PATH=./build/$(BINARY_NAME)
MAIN_PATH=./cmd/$(BINARY_NAME)/main.go
GOOS?=$(shell go env GOOS)
GOARCH?=$(shell go env GOARCH)
VERSION?=0.1.0
BUILD_TIME=$(shell date -u '+%Y-%m-%d %H:%M:%S')
GIT_COMMIT=$(shell git rev-parse --short HEAD 2>/dev/null || echo "unknown")

# Build flags
LDFLAGS=-ldflags "-X 'main.Version=$(VERSION)' -X 'main.BuildTime=$(BUILD_TIME)' -X 'main.GitCommit=$(GIT_COMMIT)'"

help: ## Display this help menu
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

build: deps ## Build the daemon binary
	@echo "Building $(BINARY_NAME)..."
	@mkdir -p build
	@go build $(LDFLAGS) -o $(BINARY_PATH) $(MAIN_PATH)
	@echo "✓ Built: $(BINARY_PATH)"

build-darwin: ## Build for macOS
	@echo "Building for macOS..."
	@mkdir -p build
	@GOOS=darwin GOARCH=amd64 go build $(LDFLAGS) -o build/$(BINARY_NAME)-darwin-amd64 $(MAIN_PATH)
	@echo "✓ Built: build/$(BINARY_NAME)-darwin-amd64"

build-linux: ## Build for Linux
	@echo "Building for Linux..."
	@mkdir -p build
	@GOOS=linux GOARCH=amd64 go build $(LDFLAGS) -o build/$(BINARY_NAME)-linux-amd64 $(MAIN_PATH)
	@echo "✓ Built: build/$(BINARY_NAME)-linux-amd64"

run: build ## Build and run the daemon
	@echo "Starting daemon..."
	@$(BINARY_PATH) --config config.yaml

run-test: build ## Build and run in test mode
	@echo "Running tests..."
	@$(BINARY_PATH) --test

run-dry: build ## Build and run in dry-run mode
	@echo "Running dry-run..."
	@$(BINARY_PATH) --dry-run

test: ## Run unit tests
	@echo "Running unit tests..."
	@go test -v -race -coverprofile=coverage.out ./...
	@echo "✓ Tests passed"

test-verbose: ## Run unit tests with verbose output
	@echo "Running unit tests (verbose)..."
	@go test -v -race -coverprofile=coverage.out ./...
	@go tool cover -html=coverage.out -o coverage.html
	@echo "✓ Coverage report: coverage.html"

deps: ## Download and verify dependencies
	@echo "Tidying dependencies..."
	@go mod tidy
	@echo "Downloading dependencies..."
	@go mod download
	@go mod verify
	@echo "✓ Dependencies verified"

fmt: ## Format code
	@echo "Formatting code..."
	@go fmt ./...
	@echo "✓ Code formatted"

lint: ## Run linter
	@echo "Running linter..."
	@golangci-lint run ./... || echo "⚠ Install golangci-lint: https://golangci-lint.run/usage/install/"

vet: ## Run go vet
	@echo "Running go vet..."
	@go vet ./...
	@echo "✓ Vet passed"

install: build ## Install binary to system
	@echo "Installing $(BINARY_NAME) to /usr/local/bin/..."
	@sudo cp $(BINARY_PATH) /usr/local/bin/$(BINARY_NAME)
	@sudo chmod +x /usr/local/bin/$(BINARY_NAME)
	@echo "✓ Installed to /usr/local/bin/$(BINARY_NAME)"

install-service: ## Install systemd service
	@echo "Installing systemd service..."
	@sudo cp maintenance-daemon.service /etc/systemd/system/
	@sudo systemctl daemon-reload
	@echo "✓ Service installed. Run: sudo systemctl enable maintenance-daemon"

uninstall: ## Uninstall binary and service
	@echo "Uninstalling..."
	@sudo rm -f /usr/local/bin/$(BINARY_NAME)
	@sudo rm -f /etc/systemd/system/maintenance-daemon.service
	@sudo systemctl daemon-reload
	@echo "✓ Uninstalled"

clean: ## Clean build artifacts
	@echo "Cleaning..."
	@rm -rf build/
	@rm -f coverage.out coverage.html
	@echo "✓ Cleaned"

version: ## Show version info
	@echo "$(BINARY_NAME) v$(VERSION)"
	@echo "Build time: $(BUILD_TIME)"
	@echo "Git commit: $(GIT_COMMIT)"

# Default target
.DEFAULT_GOAL := help
