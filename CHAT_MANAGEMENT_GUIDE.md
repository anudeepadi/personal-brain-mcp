# Chat Management & Export Guide

This guide covers the comprehensive chat management features of your Personal Brain API, including export/import functionality and conversation persistence.

## 🚀 Overview

Your Personal Brain API now supports:
- **Chat Export Import**: Parse Claude and ChatGPT export files
- **Conversation Saving**: Save any chat with metadata and tags
- **Smart Retrieval**: Find conversations by content, title, or tags
- **Natural Commands**: Use simple commands like `save_chat` and `retrieve_chat`
- **MCP Integration**: Full Claude Desktop integration for seamless workflow

## 📥 Chat Export & Import

### Supported Export Formats

#### 1. Claude Exports
**Format**: JSON with meta and chats structure
```json
{
  "meta": {
    "exported_at": "2024-03-19 16:03:09",
    "title": "Machine Learning Discussion"
  },
  "chats": [
    {
      "index": 0,
      "type": "prompt",
      "message": [{"type": "p", "data": "How does neural network training work?"}]
    },
    {
      "index": 1,
      "type": "response", 
      "message": "Neural networks learn through backpropagation..."
    }
  ]
}
```

#### 2. ChatGPT Exports
**Format**: conversations.json with mapping structure
```json
{
  "title": "AI Discussion",
  "mapping": {
    "uuid1": {
      "message": {
        "author": {"role": "user"},
        "content": {"parts": ["What is machine learning?"]}
      }
    },
    "uuid2": {
      "message": {
        "author": {"role": "assistant"},
        "content": {"parts": ["Machine learning is a subset of AI..."]}
      }
    }
  }
}
```

#### 3. Plain Text Exports
**Format**: Simple text with role indicators
```
User: What is artificial intelligence?
Assistant: Artificial intelligence (AI) is a branch of computer science that aims to create intelligent machines...