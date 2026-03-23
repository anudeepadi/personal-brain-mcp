# MCP Server Setup for Claude Desktop

This guide will help you set up the Personal Brain API as an MCP server for Claude Desktop integration.

## Prerequisites

1. **Claude Desktop App**: Download and install from [Claude Desktop](https://claude.ai/download)
2. **Python Environment**: Python 3.8+ with virtual environment support
3. **API Keys**: 
   - Google AI API key (for Gemini models and embeddings)
   - Pinecone API key and index
   - Anthropic API key (optional, for Claude models)

## Installation Steps

### 1. Install Dependencies

```bash
# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Environment Configuration

Create a `.env` file in the project root:

```env
GOOGLE_API_KEY=your_google_api_key_here
PINECONE_API_KEY=your_pinecone_api_key_here
PINECONE_INDEX_NAME=your_pinecone_index_name
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### 3. Test MCP Server

Test the MCP server directly:

```bash
python mcp_server.py
```

The server should start without errors and log to `mcp_server.log`.

### 4. Configure Claude Desktop

1. **Find your Claude Desktop config location**:
   - **macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - **Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

2. **Update the configuration** (create the file if it doesn't exist):

```json
{
  "mcpServers": {
    "personal-brain": {
      "command": "python",
      "args": [
        "/ABSOLUTE/PATH/TO/YOUR/PROJECT/mcp_server.py"
      ],
      "env": {
        "GOOGLE_API_KEY": "your_google_api_key",
        "PINECONE_API_KEY": "your_pinecone_api_key", 
        "PINECONE_INDEX_NAME": "your_index_name",
        "ANTHROPIC_API_KEY": "your_anthropic_key"
      }
    }
  }
}
```

**Important**: Replace `/ABSOLUTE/PATH/TO/YOUR/PROJECT/` with the actual absolute path to your project directory.

### 5. Restart Claude Desktop

Close and restart Claude Desktop. You should see MCP tools available in the interface.

## Available MCP Tools

Once configured, Claude Desktop will have access to these tools:

### 🔍 **search_documents**
Search through your uploaded documents with semantic search.
- `query`: Search query
- `content_type`: Filter by file type (optional)
- `filename`: Filter by filename pattern (optional)
- `top_k`: Number of results (1-20)

### 💬 **search_chat_history**
Search through archived chat sessions.
- `query`: Search query
- `tool`: Filter by AI tool name (optional)
- `tags`: Comma-separated tags (optional)
- `top_k`: Number of results (1-20)

### 📄 **get_document_details**
Get detailed information about a specific document.
- `document_id`: Unique document identifier

### 📚 **list_all_documents**
List all uploaded documents with metadata.
- `skip`: Number to skip (pagination)
- `limit`: Max results (1-50)

### 🤖 **ask_with_citations**
Ask questions with proper citations from your knowledge base.
- `question`: Your question
- `model_provider`: 'gemini' or 'claude'

### 💬 **save_chat**
Save a chat conversation to your knowledge base.
- `chat_id`: Unique identifier for the chat
- `messages`: List of messages with role and content
- `title`: Optional title for the chat
- `tags`: Comma-separated tags for categorization

### 🔍 **retrieve_saved_chats**
Retrieve saved chat conversations.
- `chat_id`: Specific chat ID to retrieve (optional)
- `title_pattern`: Search by title pattern (optional)
- `tags`: Comma-separated tags to filter by (optional)
- `limit`: Maximum number of chats to return (1-20)

### 📋 **list_saved_chats**
List all saved chats with metadata.
- `skip`: Number to skip (pagination)
- `limit`: Max results (1-50)
- `tags`: Filter by tags

### 📥 **import_chat_export**
Import chat exports from Claude or ChatGPT.
- `file_content`: The export file content
- `filename`: Name of the export file
- `export_type`: 'claude', 'chatgpt', or 'auto'
- `title`: Optional custom title
- `tags`: Comma-separated tags

### ⚡ **process_chat_command**
Process save_chat or retrieve_chat commands.
- `command`: The chat command text
- `context`: Current conversation context (for save_chat)

## Available Resources

### 📋 **documents://list**
Access to document list as a resource

### 📄 **documents://{document_id}**
Access to specific document details

### 🔍 **search://documents/{query}**
Search results as a resource

### 💬 **chats://saved**
Access to all saved chat conversations

### 📝 **chats://{chat_id}**
Access to a specific saved chat conversation

## Usage Examples

Once set up, you can use these in Claude Desktop:

**Document Search:**
```
Can you search my documents for information about "machine learning"?

Please list all my uploaded documents from the last week.

What does document ID abc-123 contain?

Ask my knowledge base about "best practices for API design" using citations.
```

**Chat Management:**
```
# Save current conversation
save_chat

# Save with custom title and tags
save_chat as "Machine Learning Discussion" with tags ai, research, learning

# Retrieve specific chat
retrieve_chat with id abc-123-def

# Find chats by title
retrieve_chat with title "Machine Learning"

# Find chats by tags
retrieve_chat with tags ai, research limit 5

# List all saved chats
list_saved_chats

# Import Claude or ChatGPT export
import_chat_export with Claude export JSON file
```

**Command Processing:**
You can also use natural language commands:
```
"Please save this chat as 'Important AI Discussion' with tags ai, research"

"Can you retrieve my chats about machine learning?"

"Show me all my saved conversations from last week"
```

## Troubleshooting

### 1. MCP Server Not Appearing
- Check that the absolute path in config is correct
- Verify environment variables are set
- Check `mcp_server.log` for errors

### 2. API Errors
- Verify all API keys are valid and have proper permissions
- Check Pinecone index exists and is accessible
- Ensure sufficient API quotas

### 3. Import Errors
- Make sure all dependencies are installed: `pip install -r requirements.txt`
- Verify you're using the correct Python environment

### 4. Permission Issues
- Ensure the MCP server script has execute permissions
- Check that Claude Desktop can access the specified directory

## Development Mode

For development, you can run the FastAPI server alongside the MCP server:

```bash
# Terminal 1: Run FastAPI server
uvicorn main:app --reload

# Terminal 2: Test MCP server
python mcp_server.py
```

This allows you to use both the web API and MCP server simultaneously.