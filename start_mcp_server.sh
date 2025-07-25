#!/bin/bash

# MCP Server Startup Script for Personal Brain API
# This script ensures the correct Python environment is used

# Set environment variables if not already set
export GOOGLE_API_KEY="${GOOGLE_API_KEY:-your_google_api_key_here}"
export PINECONE_API_KEY="${PINECONE_API_KEY:-your_pinecone_api_key_here}"
export PINECONE_INDEX_NAME="${PINECONE_INDEX_NAME:-ragconemine}"
export ANTHROPIC_API_KEY="${ANTHROPIC_API_KEY:-your_anthropic_api_key_here}"

# Get the script directory and change to it
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Add the project directory to Python path
export PYTHONPATH="$SCRIPT_DIR:$PYTHONPATH"

# Run the MCP server with the correct Python interpreter
exec /opt/anaconda3/bin/python mcp_server.py