# Personal Brain MCP Server

A [Model Context Protocol (MCP)](https://modelcontextprotocol.io) server that provides AI-powered knowledge management tools for Claude Desktop. Transform your documents, conversations, and notes into a searchable personal knowledge base with semantic search and AI-powered insights.

## Features

🧠 **Semantic Search** - Search across all your documents and conversations using natural language  
💬 **Chat Management** - Import, save, and search your AI conversations  
📄 **Multi-format Support** - Process PDFs, documents, images, and audio files  
🤖 **AI Integration** - Generate responses using Claude, Gemini, or ChatGPT with your personal context  
🏷️ **Smart Organization** - Automatic tagging and categorization of your content  
⚡ **Real-time Processing** - Instant indexing and retrieval of your information  

## Quick Start

### Option 1: Using npx (Recommended)

```bash
# Install and run in one command
npx personal-brain-mcp

# Or install globally
npm install -g personal-brain-mcp
personal-brain-mcp
```

### Option 2: Using uvx (Python users)

```bash
# Install uv if you haven't already
curl -LsSf https://astral.sh/uv/install.sh | sh

# Run with uvx (automatically manages Python environment)
uvx personal-brain-mcp

# Or install globally
uv tool install personal-brain-mcp
personal-brain-mcp
```

### Option 3: Traditional pip install

```bash
pip install personal-brain-mcp
personal-brain-mcp
```

## Claude Desktop Integration

Add this to your Claude Desktop MCP settings (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):

```json
{
  "mcpServers": {
    "personal-brain": {
      "command": "npx",
      "args": ["personal-brain-mcp"]
    }
  }
}
```

**Alternative configurations:**

```json
// Using uvx
{
  "mcpServers": {
    "personal-brain": {
      "command": "uvx", 
      "args": ["personal-brain-mcp"]
    }
  }
}

// Using global install
{
  "mcpServers": {
    "personal-brain": {
      "command": "personal-brain-mcp"
    }
  }
}

// With custom API URL
{
  "mcpServers": {
    "personal-brain": {
      "command": "npx",
      "args": ["personal-brain-mcp", "--api-url", "http://localhost:3000"]
    }
  }
}
```

## Prerequisites

### Required
- **Personal Brain API** running (see [Setup Guide](#personal-brain-api-setup))
- **Python 3.9+** (automatically managed if using uvx)
- **Node.js 16+** (for npx installation)

### Optional but Recommended
- **uv/uvx** for better Python environment management

## Personal Brain API Setup

The MCP server requires the Personal Brain API to be running. Here's how to set it up:

1. **Clone the Personal Brain API:**
   ```bash
   git clone <personal-brain-api-repo>
   cd personal-brain-api
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys (Pinecone, OpenAI, etc.)
   ```

4. **Start the API:**
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 8000
   ```

The API should now be running at `http://localhost:8000`.

## Usage

### Command Line Options

```bash
personal-brain-mcp [OPTIONS]

OPTIONS:
  --api-url <url>     Personal Brain API URL (default: http://localhost:8000)
  --log-level <level> Logging level: DEBUG, INFO, WARNING, ERROR (default: INFO)
  --version          Show version information
  --help             Show help message
```

### Examples

```bash
# Default usage
npx personal-brain-mcp

# Custom API URL
npx personal-brain-mcp --api-url http://localhost:3000

# Debug mode
npx personal-brain-mcp --log-level DEBUG
```

## Available MCP Tools

Once connected to Claude Desktop, you'll have access to these tools:

### 🔍 **search_memory**
Search across all your documents and conversations
```
Search for "API design patterns I discussed last month"
```

### 📤 **upload_document** 
Add new documents to your knowledge base
```
Upload this meeting transcript with tags: meetings, product-planning
```

### 💾 **save_chat**
Save important conversations to your archive
```
Save this conversation about React optimization techniques
```

### 📥 **retrieve_saved_chats**
Find and load previous conversations
```
Show me chats about database design from last week
```

### 🤖 **generate_response**
Get AI responses enhanced with your personal context
```
Based on my documents, what are the key principles for API design?
```

### 📄 **import_chat_file**
Import chat exports from other AI platforms
```
Import this ChatGPT conversation export about machine learning
```

### 🎙️ **process_natural_command**
Use natural language commands
```
"Save this chat with tags: important, architecture-decisions"
"Retrieve chats about React performance"
```

## MCP Resources

The server also provides these resources that Claude can access:

- **memory://documents** - Your indexed documents and files
- **memory://chats** - Your archived AI conversations  
- **memory://search** - Semantic search capabilities
- **memory://status** - System status and health

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Claude        │    │   MCP Server    │    │ Personal Brain  │
│   Desktop       │◄──►│ (This Package)  │◄──►│     API         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │                         │
                              ▼                         ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │    Logging      │    │   Vector DB     │
                       │   (~/Documents) │    │   (Pinecone)    │
                       └─────────────────┘    └─────────────────┘
```

## Development

### Building from Source

```bash
# Clone the repository
git clone <repo-url>
cd personal-brain-mcp

# Python package
cd src
pip install -e .

# Node.js package  
npm install
npm link
```

### Testing

```bash
# Test the MCP server
personal-brain-mcp --help

# Test with Claude Desktop
# Add configuration and restart Claude Desktop
```

## Troubleshooting

### Common Issues

**1. "Python not found" error**
```bash
# Install Python 3.9+
# macOS: brew install python@3.11
# Windows: Download from python.org
# Linux: sudo apt install python3.11

# Or use uvx for automatic management
curl -LsSf https://astral.sh/uv/install.sh | sh
```

**2. "Personal Brain API connection failed"**
```bash
# Check if API is running
curl http://localhost:8000/health

# Start the API if needed
cd personal-brain-api && uvicorn main:app --port 8000
```

**3. "Package installation failed"**
```bash
# Try manual installation
pip install personal-brain-mcp

# Or use uvx
uvx personal-brain-mcp
```

**4. Claude Desktop not recognizing the server**
- Verify the JSON configuration syntax
- Restart Claude Desktop after adding configuration
- Check logs at `~/Documents/personal_brain_mcp.log`

### Logging

Logs are stored at:
- **macOS/Linux**: `~/Documents/personal_brain_mcp.log`
- **Windows**: `%USERPROFILE%\\Documents\\personal_brain_mcp.log`

Enable debug logging:
```bash
personal-brain-mcp --log-level DEBUG
```

## Configuration

### Environment Variables

- `PERSONAL_BRAIN_API_URL` - API URL (default: http://localhost:8000)
- `LOG_LEVEL` - Logging level (default: INFO)

### Claude Desktop Config

Full configuration example:
```json
{
  "mcpServers": {
    "personal-brain": {
      "command": "npx",
      "args": [
        "personal-brain-mcp",
        "--api-url", "http://localhost:8000",
        "--log-level", "INFO"
      ],
      "env": {
        "PERSONAL_BRAIN_API_URL": "http://localhost:8000"
      }
    }
  }
}
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Support

- **Documentation**: [GitHub Wiki](https://github.com/your-username/personal-brain-mcp/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/personal-brain-mcp/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/personal-brain-mcp/discussions)

---

**Made with ❤️ for the Claude Desktop community**