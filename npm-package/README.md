# Personal Brain MCP (npm package)

A Node.js wrapper for the Personal Brain MCP Python package. This provides semantic search and archival capabilities for documents and chat sessions with Claude Desktop integration.

## Installation

```bash
npm install -g personal-brain-mcp
```

This will automatically:
1. Install the npm wrapper
2. Install the Python dependencies
3. Set up the `personal-brain-mcp` command

## Requirements

- **Node.js** 16.0.0 or higher
- **Python** 3.8 or higher
- **pip** (Python package manager)

## Quick Start

### 1. Set up environment variables

Create a `.env` file in your working directory:

```env
GOOGLE_API_KEY=your_google_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=your_pinecone_index_name
ANTHROPIC_API_KEY=your_anthropic_api_key  # Optional
```

### 2. Run the MCP server

```bash
personal-brain-mcp
```

### 3. Configure Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "personal-brain": {
      "command": "personal-brain-mcp",
      "args": []
    }
  }
}
```

## Features

- **Document Processing**: PDF, images (OCR), audio transcription
- **Vector Search**: Pinecone-powered semantic search
- **Chat Management**: Archive and search conversations
- **Multi-LLM Support**: Google Gemini and Anthropic Claude
- **MCP Integration**: Direct Claude Desktop integration

## Available Tools (via MCP)

### Document Management
- `search_documents`: Semantic search through documents
- `get_document_details`: Retrieve specific document info
- `list_all_documents`: Browse all documents
- `ask_with_citations`: Q&A with source citations

### Chat Management  
- `search_chat_history`: Search archived chats
- `save_chat`: Save conversations
- `retrieve_saved_chats`: Find saved chats
- `import_chat_export`: Import Claude/ChatGPT exports

## Troubleshooting

### Installation Issues

```bash
# Check installation
npm test

# Reinstall Python dependencies
npm run postinstall

# Manual Python installation
pip install personal-brain-mcp
```

### Common Problems

1. **Python not found**: Install Python 3.8+ from python.org
2. **pip not found**: Install pip or use `python -m pip` 
3. **API key errors**: Check your .env file configuration
4. **Permission errors**: Try `sudo npm install -g` (macOS/Linux)

## Development

```bash
# Clone and install
git clone <repository>
cd npm-package
npm install

# Test the package
npm test

# Publish to npm
npm publish
```

## API Keys Setup

You'll need API keys from:

- **Google AI Studio**: https://makersuite.google.com/app/apikey
- **Pinecone**: https://app.pinecone.io/
- **Anthropic** (optional): https://console.anthropic.com/

## Support

- GitHub Issues: https://github.com/your-username/personal-brain-mcp/issues
- Documentation: See README.md in the Python package

## License

MIT