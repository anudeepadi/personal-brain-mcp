#!/usr/bin/env python3
"""
Quick test to verify MCP server can start without errors.
"""

import sys
import os
import time

def test_mcp_startup():
    """Test that MCP server starts without immediate errors."""
    print("🧪 Testing MCP Server Startup")
    print("=" * 40)
    
    try:
        # Test imports
        print("Testing imports...")
        from mcp_server import mcp, log_file
        print("✅ MCP server imports successfully")
        print(f"✅ Log file location: {log_file}")
        
        # Check if log directory is writable
        log_dir = os.path.dirname(log_file)
        if os.access(log_dir, os.W_OK):
            print("✅ Log directory is writable")
        else:
            print("❌ Log directory is not writable")
            return False
        
        # Test that the server object is created
        if hasattr(mcp, 'tool') and callable(mcp.tool):
            print("✅ MCP server tools are available")
        else:
            print("❌ MCP tools not available")
            return False
            
        if hasattr(mcp, 'resource') and callable(mcp.resource):
            print("✅ MCP server resources are available")
        else:
            print("❌ MCP resources not available")
            return False
        
        print("\n✅ All startup tests passed!")
        print("\nTo use with Claude Desktop:")
        print("1. Copy the claude_desktop_config.json to your Claude Desktop settings")
        print("2. Restart Claude Desktop") 
        print("3. The MCP server should now be available")
        
        return True
        
    except Exception as e:
        print(f"❌ Startup test failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = test_mcp_startup()
    sys.exit(0 if success else 1)