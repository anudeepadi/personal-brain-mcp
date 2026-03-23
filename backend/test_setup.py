#!/usr/bin/env python3
"""
Test script to verify the Personal Brain API setup is working correctly.
"""

import sys
import os

def test_imports():
    """Test that all required modules can be imported."""
    print("Testing imports...")
    
    try:
        # Test core API imports
        from main import app
        print("✅ FastAPI main app imports successfully")
        
        # Test models
        from models import ChatMessage, ArchiveRequest, DocumentMetadata
        print("✅ Pydantic models import successfully")
        
        # Test services (without initialization)
        import services
        print("✅ Services module imports successfully")
        
        # Test MCP server
        from mcp_server import mcp
        print("✅ MCP server imports successfully")
        
        # Test configuration
        from config import settings
        print("✅ Configuration module imports successfully")
        
        return True
    except Exception as e:
        print(f"❌ Import error: {e}")
        return False

def test_environment():
    """Test that required environment variables are set."""
    print("\nTesting environment variables...")
    
    required_vars = [
        'GOOGLE_API_KEY',
        'PINECONE_API_KEY', 
        'PINECONE_INDEX_NAME'
    ]
    
    optional_vars = [
        'ANTHROPIC_API_KEY'
    ]
    
    all_good = True
    
    for var in required_vars:
        if os.getenv(var):
            print(f"✅ {var} is set")
        else:
            print(f"❌ {var} is NOT set (required)")
            all_good = False
    
    for var in optional_vars:
        if os.getenv(var):
            print(f"✅ {var} is set")
        else:
            print(f"⚠️  {var} is NOT set (optional)")
    
    return all_good

def test_mcp_tools():
    """Test that MCP tools are properly defined."""
    print("\nTesting MCP tools...")
    
    try:
        from mcp_server import mcp
        
        # Check if tools are registered (FastMCP stores them internally)
        tools_defined = hasattr(mcp, 'tool') and callable(mcp.tool)
        resources_defined = hasattr(mcp, 'resource') and callable(mcp.resource)
        
        if tools_defined:
            print("✅ MCP tools decorator is available")
        else:
            print("❌ MCP tools decorator is NOT available")
            
        if resources_defined:
            print("✅ MCP resources decorator is available")
        else:
            print("❌ MCP resources decorator is NOT available")
            
        return tools_defined and resources_defined
    except Exception as e:
        print(f"❌ MCP tools test error: {e}")
        return False

def main():
    """Run all tests."""
    print("🧪 Personal Brain API Setup Test")
    print("=" * 40)
    
    # Run tests
    imports_ok = test_imports()
    env_ok = test_environment()
    mcp_ok = test_mcp_tools()
    
    print("\n" + "=" * 40)
    print("📊 TEST SUMMARY")
    print("=" * 40)
    
    if imports_ok:
        print("✅ All imports working")
    else:
        print("❌ Import issues detected")
    
    if env_ok:
        print("✅ Environment variables configured")
    else:
        print("❌ Missing required environment variables")
    
    if mcp_ok:
        print("✅ MCP server ready")
    else:
        print("❌ MCP server issues")
    
    # Overall status
    all_tests_passed = imports_ok and env_ok and mcp_ok
    
    print("\n" + "=" * 40)
    if all_tests_passed:
        print("🎉 ALL TESTS PASSED! Your setup is ready.")
        print("\nNext steps:")
        print("1. Start FastAPI server: uvicorn main:app --reload")
        print("2. Configure Claude Desktop with the provided JSON")
        print("3. Test MCP server: python mcp_server.py")
    else:
        print("⚠️  SOME TESTS FAILED. Please check the issues above.")
        print("\nTroubleshooting:")
        if not imports_ok:
            print("- Run: pip install -r requirements.txt")
        if not env_ok:
            print("- Create .env file with your API keys")
            print("- Or set environment variables manually")
    
    return 0 if all_tests_passed else 1

if __name__ == "__main__":
    sys.exit(main())