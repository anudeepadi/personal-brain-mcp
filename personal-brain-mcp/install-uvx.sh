#!/bin/bash
# Personal Brain MCP Server - uvx installation script

echo "🧠 Installing Personal Brain MCP Server via uvx..."

# Check if uv is installed
if ! command -v uv &> /dev/null; then
    echo "📥 Installing uv..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    export PATH="$HOME/.cargo/bin:$PATH"
fi

# Install with uvx
echo "📦 Installing personal-brain-mcp..."
uvx install personal-brain-mcp

echo "✅ Installation complete!"
echo ""
echo "🔧 To use with Claude Desktop, add this to your MCP config:"
echo '{'
echo '  "mcpServers": {'
echo '    "personal-brain": {'
echo '      "command": "uvx",'
echo '      "args": ["personal-brain-mcp"]'
echo '    }'
echo '  }'
echo '}'
