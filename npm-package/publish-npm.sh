#!/bin/bash
# NPM Publishing script for Personal Brain MCP

set -e

echo "📦 Preparing npm package for publishing..."

# Check if logged in to npm
if ! npm whoami > /dev/null 2>&1; then
    echo "❌ Not logged in to npm. Please run: npm login"
    exit 1
fi

echo "✅ npm login verified"

# Check package
echo "🔍 Checking package..."
npm pack --dry-run

# Test the package
echo "🧪 Testing package..."
npm test

echo "📤 Publishing to npm..."
npm publish

echo "🎉 Successfully published to npm!"
echo "📦 Install with: npm install -g personal-brain-mcp"

# Test installation from npm (optional)
read -p "Test installation from npm? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🧪 Testing npm installation..."
    # Create temp directory for testing
    temp_dir=$(mktemp -d)
    cd "$temp_dir"
    
    echo "Installing from npm..."
    npm install -g personal-brain-mcp
    
    echo "Testing command..."
    if command -v personal-brain-mcp >/dev/null 2>&1; then
        echo "✅ Installation test passed!"
    else
        echo "❌ Installation test failed"
    fi
    
    cd - > /dev/null
    rm -rf "$temp_dir"
fi