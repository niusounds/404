package utils

import (
	"fmt"
	"os"
	"path/filepath"
	"time"
)

// Logger wraps standard logging with structured output
type Logger struct {
	logDir string
	logFile *os.File
}

// NewLogger creates a new logger instance
func NewLogger(logDir string) (*Logger, error) {
	// Create log directory if it doesn't exist
	if err := os.MkdirAll(logDir, 0755); err != nil {
		return nil, fmt.Errorf("failed to create log directory: %w", err)
	}

	// Create log file with date stamp
	logFileName := fmt.Sprintf("daemon_%s.log", time.Now().Format("20060102"))
	logFilePath := filepath.Join(logDir, logFileName)

	logFile, err := os.OpenFile(logFilePath, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		return nil, fmt.Errorf("failed to open log file: %w", err)
	}

	// Setup multi-writer (stdout + file)
	logger := &Logger{logDir: logDir, logFile: logFile}

	return logger, nil
}

// Info logs info level message
func (l *Logger) Info(prefix string, message string) {
	timestamp := time.Now().Format("2006-01-02 15:04:05")
	logMsg := fmt.Sprintf("[%s] [%s] INFO - %s\n", timestamp, prefix, message)
	fmt.Print(logMsg)
	if l.logFile != nil {
		l.logFile.WriteString(logMsg)
	}
}

// Warn logs warning level message
func (l *Logger) Warn(prefix string, message string) {
	timestamp := time.Now().Format("2006-01-02 15:04:05")
	logMsg := fmt.Sprintf("[%s] [%s] WARN - %s\n", timestamp, prefix, message)
	fmt.Print(logMsg)
	if l.logFile != nil {
		l.logFile.WriteString(logMsg)
	}
}

// Error logs error level message
func (l *Logger) Error(prefix string, message string) {
	timestamp := time.Now().Format("2006-01-02 15:04:05")
	logMsg := fmt.Sprintf("[%s] [%s] ERROR - %s\n", timestamp, prefix, message)
	fmt.Print(logMsg)
	if l.logFile != nil {
		l.logFile.WriteString(logMsg)
	}
}

// Debug logs debug level message
func (l *Logger) Debug(prefix string, message string) {
	timestamp := time.Now().Format("2006-01-02 15:04:05")
	logMsg := fmt.Sprintf("[%s] [%s] DEBUG - %s\n", timestamp, prefix, message)
	fmt.Print(logMsg)
	if l.logFile != nil {
		l.logFile.WriteString(logMsg)
	}
}

// Close closes the log file
func (l *Logger) Close() error {
	if l.logFile != nil {
		return l.logFile.Close()
	}
	return nil
}
