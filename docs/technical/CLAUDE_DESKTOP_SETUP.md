# 🛠 Claude Desktop MCP Server Setup

## ✅ Issue Fixed!

The MCP server startup issues have been resolved. Here's what was fixed:

1. **Python Path**: Updated to use full path `/opt/anaconda3/bin/python`
2. **Logging**: Fixed read-only file system issue by using `~/Documents/mcp_server.log`
3. **Working Directory**: Ensured proper working directory and Python path

## 🚀 Setup Instructions

### Step 1: Copy Configuration to Claude Desktop

**Location (macOS)**: `~/Library/Application Support/Claude/claude_desktop_config.json`

**Configuration to use**:
```json
{
  "mcpServers": {
    "personal-brain": {
      "command": "/opt/anaconda3/bin/python",
      "args": [
        "/Users/vuc229/Downloads/Projects/python-mcp/mcp_server.py"
      ],
      "env": {
        "GOOGLE_API_KEY": "your_google_api_key_here",
        "PINECONE_API_KEY": "your_pinecone_api_key_here",
        "PINECONE_INDEX_NAME": "your_pinecone_index_name",
        "ANTHROPIC_API_KEY": "your_anthropic_api_key_here"
      }
    }
  }
}
```

### Step 2: Restart Claude Desktop

Close Claude Desktop completely and restart it.

### Step 3: Verify Connection

Look for the Personal Brain server in Claude Desktop. You should see:
- Server initializing successfully
- No error messages in the logs
- MCP tools available for use

## 🔧 Alternative Setup (Shell Script)

If you encounter any issues, use the shell script approach:

**Configuration**:
```json
{
  "mcpServers": {
    "personal-brain": {
      "command": "/Users/vuc229/Downloads/Projects/python-mcp/start_mcp_server.sh",
      "args": []
    }
  }
}
```

## 🧪 Testing Your Setup

Run the test script to verify everything works:

```bash
cd /Users/vuc229/Downloads/Projects/python-mcp
/opt/anaconda3/bin/python test_mcp_startup.py
```

You should see all green checkmarks.

## 📋 Available Tools in Claude Desktop

Once connected, you'll have access to:

### 🔍 **Document Tools**
- `search_documents` - Search through uploaded documents
- `get_document_details` - Get specific document information
- `list_all_documents` - Browse all documents
- `ask_with_citations` - Get answers with source citations

### 💬 **Chat Management Tools**
- `search_chat_history` - Search archived conversations
- `save_chat` - Save current conversation
- `retrieve_saved_chats` - Find and retrieve saved chats
- `list_saved_chats` - Browse all saved conversations
- `import_chat_export` - Import Claude/ChatGPT exports
- `process_chat_command` - Handle natural language commands

### 📚 **Resources**
- `documents://list` - Direct access to document list
- `documents://{id}` - Access specific documents
- `chats://saved` - Access saved conversations
- `chats://{id}` - Access specific chats

## 💡 Usage Examples

### Save Current Conversation
```
save_chat as "Machine Learning Discussion" with tags ai, research
```

### Retrieve Past Chats
```
retrieve_chat with tags ai limit 5
```

### Search Documents
```
search_documents about "neural networks" in PDF files
```

### Import Chat Export
```
import_chat_export from my Claude export file with tags research
```

## 🔍 Troubleshooting

### If the server still won't start:

1. **Check Python Path**:
   ```bash
   which python
   # Should show: /opt/anaconda3/bin/python
   ```

2. **Test Manual Startup**:
   ```bash
   cd /Users/vuc229/Downloads/Projects/python-mcp
   /opt/anaconda3/bin/python mcp_server.py
   ```

3. **Check Logs**:
   ```bash
   tail -f ~/Documents/mcp_server.log
   ```

4. **Verify Environment**:
   ```bash
   /opt/anaconda3/bin/python test_setup.py
   ```

### Common Issues:

- **"spawn python ENOENT"**: Use full Python path instead of just `python`
- **"Read-only file system"**: Fixed by using `~/Documents/` for logs
- **Import errors**: Run `pip install -r requirements.txt`
- **API errors**: Check your API keys in the configuration

## 🎉 Success Indicators

When everything works correctly, you'll see:
- ✅ Server started and connected successfully
- ✅ MCP tools available in Claude Desktop interface
- ✅ No error messages in Claude Desktop logs
- ✅ Ability to run commands like `save_chat` and `search_documents`

Your Personal Brain API is now fully integrated with Claude Desktop! 🧠✨