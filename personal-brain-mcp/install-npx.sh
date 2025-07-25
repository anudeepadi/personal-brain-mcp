#!/bin/bash
# Personal Brain MCP Server - npx installation script

echo "🧠 Installing Personal Brain MCP Server via npx..."

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required. Please install from https://nodejs.org"
    exit 1
fi

# Install globally
echo "📦 Installing personal-brain-mcp globally..."
npm install -g personal-brain-mcp

echo "✅ Installation complete!"
echo ""
echo "🔧 To use with Claude Desktop, add this to your MCP config:"
echo '{'
echo '  "mcpServers": {'
echo '    "personal-brain": {'
echo '      "command": "personal-brain-mcp"'
echo '    }'
echo '  }'
echo '}'

echo ""
echo "🚀 You can also run directly with: npx personal-brain-mcp"
