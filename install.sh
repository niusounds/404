#!/bin/bash
# Installation script for horror blog daemon (Go version)

set -e

DAEMON_DIR="/home/niusounds/404"
SERVICE_NAME="horror-blog-daemon"
BINARY_NAME="horror-blog-daemon"
SERVICE_FILE="maintenance-daemon.service"

echo "================================================================"
echo "Horror Blog Maintenance Daemon (Go) - systemd Installation"
echo "================================================================"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo "❌ This script must be run as root (use: sudo ./install.sh)"
   exit 1
fi

echo ""
echo "📋 Installation Steps:"

echo "1. Building daemon..."
cd "$DAEMON_DIR"

# Check if Go is installed
if ! command -v go &> /dev/null; then
    echo "❌ Go is not installed. Please install Go 1.21+ first."
    echo "   https://golang.org/doc/install"
    exit 1
fi

# Build the binary
if ! make build; then
    echo "❌ Build failed"
    exit 1
fi

echo "   ✅ Binary built"

echo ""
echo "2. Installing binary..."

# Copy binary to system path
cp "$DAEMON_DIR/build/$BINARY_NAME" "/usr/local/bin/$BINARY_NAME"
chmod +x "/usr/local/bin/$BINARY_NAME"

echo "   ✅ Binary installed to /usr/local/bin/$BINARY_NAME"

echo ""
echo "3. Creating log directory..."

# Create log directory
mkdir -p "$DAEMON_DIR/logs"
chmod 755 "$DAEMON_DIR/logs"

echo "   ✅ Log directory created at $DAEMON_DIR/logs"

echo ""
echo "4. Copying systemd service file..."

# Copy service file to systemd directory
cp "$DAEMON_DIR/$SERVICE_FILE" "/etc/systemd/system/$SERVICE_FILE"
chmod 644 "/etc/systemd/system/$SERVICE_FILE"

echo "   ✅ Service file copied to /etc/systemd/system/"

echo ""
echo "5. Reloading systemd daemon..."

# Reload systemd
systemctl daemon-reload

echo "   ✅ systemd reloaded"

echo ""
echo "================================================================"
echo "✅ Installation Complete!"
echo "================================================================"

echo ""
echo "📝 Next Steps:"
echo ""
echo "1. Review the configuration:"
echo "   nano $DAEMON_DIR/config.yaml"
echo ""
echo "2. Start the service:"
echo "   sudo systemctl start $SERVICE_NAME"
echo ""
echo "3. Enable auto-start on boot:"
echo "   sudo systemctl enable $SERVICE_NAME"
echo ""
echo "4. Check service status:"
echo "   sudo systemctl status $SERVICE_NAME"
echo ""
echo "5. View logs in real-time:"
echo "   sudo journalctl -u $SERVICE_NAME -f"
echo ""
echo "6. Test the daemon (standalone):"
echo "   /usr/local/bin/$BINARY_NAME --test"
echo ""
echo "================================================================"
