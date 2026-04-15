package utils

import (
	"bytes"
	"context"
	"fmt"
	"os"
	"os/exec"
	"time"
)

// ExecResult holds command execution result
type ExecResult struct {
	Stdout   string
	Stderr   string
	ExitCode int
	Success  bool
	Error    error
}

// ExecCommand executes a shell command and returns result
func ExecCommand(command string, timeout time.Duration) *ExecResult {
	result := &ExecResult{}

	// Create context with timeout
	ctx, cancel := context.WithTimeout(context.Background(), timeout)
	defer cancel()

	// Create command
	cmd := exec.CommandContext(ctx, "bash", "-c", command)

	// Capture stdout and stderr
	var stdout, stderr bytes.Buffer
	cmd.Stdout = &stdout
	cmd.Stderr = &stderr
	cmd.Env = os.Environ()

	// Execute
	err := cmd.Run()

	result.Stdout = stdout.String()
	result.Stderr = stderr.String()

	if err != nil {
		result.Error = err
		result.Success = false

		// Try to get exit code
		if exitErr, ok := err.(*exec.ExitError); ok {
			result.ExitCode = exitErr.ExitCode()
		} else {
			result.ExitCode = 1
		}
	} else {
		result.Success = true
		result.ExitCode = 0
	}

	return result
}

// ExecGitCommand executes a git command
func ExecGitCommand(repoDir string, gitCmd string, timeout time.Duration) *ExecResult {
	cmd := fmt.Sprintf("cd %s && git %s", repoDir, gitCmd)
	return ExecCommand(cmd, timeout)
}

// ExecJekyllBuild executes Jekyll build command
func ExecJekyllBuild(repoDir string, timeout time.Duration) *ExecResult {
	cmd := fmt.Sprintf("cd %s && bundle exec jekyll build", repoDir)
	return ExecCommand(cmd, timeout)
}

// ExecGhCommand executes GitHub CLI command
func ExecGhCommand(ghCmd string, timeout time.Duration) *ExecResult {
	cmd := fmt.Sprintf("gh %s", ghCmd)
	return ExecCommand(cmd, timeout)
}
