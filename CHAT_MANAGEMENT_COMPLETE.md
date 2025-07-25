# Chat Management & Export Complete Guide

This guide covers the comprehensive chat management features of your Personal Brain API, including export/import functionality and conversation persistence.

## 🚀 Overview

Your Personal Brain API now supports:
- **Chat Export Import**: Parse Claude and ChatGPT export files
- **Conversation Saving**: Save any chat with metadata and tags
- **Smart Retrieval**: Find conversations by content, title, or tags
- **Natural Commands**: Use simple commands like `save_chat` and `retrieve_chat`
- **MCP Integration**: Full Claude Desktop integration for seamless workflow

## 📥 Chat Export & Import

### Import Methods

#### 1. API Upload
```bash
curl -X POST "http://localhost:8000/import/chat" \
  -F "file=@claude_export.json" \
  -F "export_type=auto" \
  -F "title=My Important Chat" \
  -F "tags=ai,research"
```

#### 2. MCP Tool (Claude Desktop)
```
import_chat_export with my Claude export file as "ML Discussion" with tags machine_learning, ai
```

### Auto-Detection
The system automatically detects:
- **Claude JSON**: Identifies `meta` and `chats` structure
- **ChatGPT JSON**: Identifies `mapping` or `messages` structure  
- **Plain Text**: Parses role indicators like "User:", "Assistant:"

## 💾 Saving Conversations

### 1. API Method
```bash
curl -X POST "http://localhost:8000/chats/save" \
  -H "Content-Type: application/json" \
  -d '{
    "chat_id": "unique-id-123",
    "title": "Machine Learning Discussion",
    "messages": [
      {"role": "user", "content": "What is neural network?"},
      {"role": "assistant", "content": "A neural network is..."}
    ],
    "tags": ["ai", "research"],
    "metadata": {"source": "manual_save"}
  }'
```

### 2. Natural Language Commands (MCP)
```
# Basic save
save_chat

# Save with title
save_chat as "Important AI Discussion"

# Save with title and tags
save_chat as "ML Research" with tags machine_learning, ai, research
```

### 3. Command Processing
```
process_chat_command with "save_chat as 'My Chat' with tags ai" and current conversation context
```

## 🔍 Retrieving Conversations

### 1. By Specific ID
```bash
curl -X POST "http://localhost:8000/chats/retrieve" \
  -H "Content-Type: application/json" \
  -d '{"chat_id": "abc-123-def"}'
```

### 2. By Title Pattern
```bash
curl -X POST "http://localhost:8000/chats/retrieve" \
  -H "Content-Type: application/json" \
  -d '{"title_pattern": "Machine Learning", "limit": 5}'
```

### 3. By Tags
```bash
curl -X POST "http://localhost:8000/chats/retrieve" \
  -H "Content-Type: application/json" \
  -d '{"tags": ["ai", "research"], "limit": 10}'
```

### 4. MCP Commands
```
# Retrieve specific chat
retrieve_chat with id abc-123

# Find by title
retrieve_chat with title "Machine Learning"

# Find by tags
retrieve_chat with tags ai, research limit 5

# General search
retrieve_chat
```

## 📋 Listing & Management

### List All Chats
```bash
curl "http://localhost:8000/chats?skip=0&limit=20&tags=ai,research"
```

### Delete Chat
```bash
curl -X DELETE "http://localhost:8000/chats/abc-123-def"
```

### MCP Integration
```
# List saved chats
list_saved_chats

# List with filters
list_saved_chats with tags ai limit 10
```

## 🤖 Claude Desktop Integration

### Setup
1. Configure MCP server in Claude Desktop settings
2. Import your chat exports
3. Use natural language commands

### Available Commands

**Saving:**
- `"Save this conversation as 'AI Research Discussion'"`
- `"Please save our chat with tags machine_learning, research"`

**Retrieving:**  
- `"Can you find my chat about neural networks?"`
- `"Show me conversations tagged with 'ai' from last week"`
- `"Retrieve chat ID abc-123"`

**Browsing:**
- `"List all my saved conversations"`
- `"Show me my recent AI discussions"`

### Smart Context
Claude Desktop can:
- Automatically detect save/retrieve intent
- Parse natural language for parameters
- Maintain conversation context
- Provide intelligent suggestions

## 📊 Advanced Features

### Metadata Enrichment
Every saved chat includes:
- **Timestamps**: Creation and last update times
- **Message Count**: Total messages in conversation
- **Content Preview**: First 150 characters
- **Tags**: Customizable categorization
- **Source**: How the chat was created/imported

### Search Capabilities
- **Semantic Search**: Find conversations by meaning
- **Exact ID Lookup**: Direct chat retrieval
- **Tag Filtering**: Category-based organization
- **Title Matching**: Pattern-based title search
- **Content Search**: Full-text search within conversations

### Format Support
- **JSON**: Structured data interchange
- **Plain Text**: Human-readable format
- **HTML**: Web-based chat exports
- **Auto-encoding**: Handles UTF-8, Latin-1, UTF-16

## 🔧 Technical Details

### Storage
- All chats stored in Pinecone vector database
- Searchable with semantic similarity
- Metadata filtering for precise queries
- Chunk-based storage for large conversations

### Processing
- Real-time parsing and validation
- Automatic format detection
- Error handling with detailed feedback
- Batch processing for multiple exports

### Security
- No external API calls for parsing
- Local processing of sensitive conversations
- Configurable retention policies
- Access control through API keys

## 🚨 Best Practices

### Organization
- Use consistent tagging schemes
- Create meaningful titles
- Regular cleanup of outdated chats
- Backup important conversations

### Performance
- Limit retrieve queries to reasonable sizes
- Use specific filters for faster searches
- Regular index optimization
- Monitor storage usage

### Privacy
- Review exported content before import
- Use appropriate tags for sensitive topics
- Regular security audits
- Proper API key management

## 🔗 Integration Examples

### Workflow Automation
```python
# Auto-save important conversations
async def auto_save_chat(messages, sentiment_score):
    if sentiment_score > 0.8:  # High value conversation
        await save_chat_conversation(
            chat_id=generate_id(),
            title=f"High-value discussion {datetime.now()}",
            messages=messages,
            tags=["important", "auto_saved"],
            metadata={"sentiment": sentiment_score}
        )
```

### Batch Processing
```python
# Import multiple export files
for export_file in export_files:
    result = await parse_chat_export(
        file_content=export_file.read(),
        filename=export_file.name,
        export_type="auto"
    )
    print(f"Imported {result['message_count']} messages")
```

This comprehensive system turns your Personal Brain API into a powerful conversation management platform with seamless Claude Desktop integration!