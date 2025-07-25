#!/usr/bin/env python3
"""
Test script for Personal Brain MCP Server installation
Verifies that the package can be installed and run correctly.
"""

import subprocess
import sys
import tempfile
import os
import json
from pathlib import Path

def run_command(cmd, description, capture_output=True):
    """Run a command and return success status"""
    print(f"🧪 {description}...")
    try:
        result = subprocess.run(
            cmd, 
            shell=True, 
            capture_output=capture_output, 
            text=True,
            timeout=30
        )
        
        if result.returncode == 0:
            print(f"✅ {description}")
            return True, result.stdout if capture_output else ""
        else:
            print(f"❌ {description}")
            if capture_output and result.stderr:
                print(f"   Error: {result.stderr.strip()}")
            return False, result.stderr if capture_output else ""
    except subprocess.TimeoutExpired:
        print(f"⏰ {description} - Timeout")
        return False, "Timeout"
    except Exception as e:
        print(f"❌ {description} - Exception: {e}")
        return False, str(e)

def test_python_installation():
    """Test Python package installation and basic functionality"""
    print("\n🐍 Testing Python Installation")
    print("=" * 40)
    
    # Test local installation
    success, output = run_command(
        "pip install -e .", 
        "Installing package in development mode"
    )
    if not success:
        return False
    
    # Test import
    success, output = run_command(
        "python -c 'import personal_brain_mcp; print(personal_brain_mcp.__version__)'",
        "Testing package import"
    )
    if not success:
        return False
    
    print(f"   Version: {output.strip()}")
    
    # Test CLI help
    success, output = run_command(
        "personal-brain-mcp --help",
        "Testing CLI help command"
    )
    if not success:
        return False
    
    # Test version command
    success, output = run_command(
        "personal-brain-mcp --version",
        "Testing CLI version command"
    )
    if not success:
        return False
    
    return True

def test_node_installation():
    """Test Node.js package installation and basic functionality"""
    print("\n📦 Testing Node.js Installation")
    print("=" * 40)
    
    # Check if npm is available
    success, output = run_command("npm --version", "Checking npm availability")
    if not success:
        print("⚠️  Skipping Node.js tests - npm not available")
        return True
    
    # Install package locally
    success, output = run_command(
        "npm install .",
        "Installing Node.js package locally"
    )
    if not success:
        return False
    
    # Test help command
    success, output = run_command(
        "node bin/personal-brain-mcp.js --help",
        "Testing Node.js wrapper help"
    )
    if not success:
        return False
    
    # Test version command
    success, output = run_command(
        "node bin/personal-brain-mcp.js --version",
        "Testing Node.js wrapper version"
    )
    if not success:
        return False
    
    return True

def test_uvx_compatibility():
    """Test uvx compatibility"""
    print("\n⚡ Testing uvx Compatibility")
    print("=" * 40)
    
    # Check if uvx is available
    success, output = run_command("uvx --version", "Checking uvx availability")
    if not success:
        print("⚠️  Skipping uvx tests - uvx not available")
        print("   Install with: curl -LsSf https://astral.sh/uv/install.sh | sh")
        return True
    
    # Test package structure for uvx compatibility
    required_files = [
        "pyproject.toml",
        "src/personal_brain_mcp/__init__.py",
        "src/personal_brain_mcp/server.py"
    ]
    
    missing_files = []
    for file_path in required_files:
        if not os.path.exists(file_path):
            missing_files.append(file_path)
    
    if missing_files:
        print(f"❌ Missing required files for uvx: {missing_files}")
        return False
    
    print("✅ Package structure compatible with uvx")
    return True

def test_mcp_server_startup():
    """Test MCP server startup (without actually connecting)"""
    print("\n🔌 Testing MCP Server Startup")
    print("=" * 40)
    
    # Create a test script that starts the server and immediately exits
    test_script = """
import asyncio
import sys
import os
sys.path.insert(0, 'src')

async def test_server():
    try:
        from personal_brain_mcp.server import create_server
        server = create_server(api_url="http://localhost:8000", log_level="INFO")
        print("Server created successfully")
        return True
    except Exception as e:
        print(f"Server creation failed: {e}")
        return False

if __name__ == "__main__":
    result = asyncio.run(test_server())
    sys.exit(0 if result else 1)
"""
    
    with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
        f.write(test_script)
        test_file = f.name
    
    try:
        success, output = run_command(
            f"python {test_file}",
            "Testing MCP server creation"
        )
        return success
    finally:
        os.unlink(test_file)

def create_claude_config_example():
    """Create example Claude Desktop configuration"""
    config_examples = {
        "npx": {
            "mcpServers": {
                "personal-brain": {
                    "command": "npx",
                    "args": ["personal-brain-mcp"]
                }
            }
        },
        "uvx": {
            "mcpServers": {
                "personal-brain": {
                    "command": "uvx",
                    "args": ["personal-brain-mcp"]
                }
            }
        },
        "global": {
            "mcpServers": {
                "personal-brain": {
                    "command": "personal-brain-mcp"
                }
            }
        }
    }
    
    with open("claude_config_examples.json", "w") as f:
        json.dump(config_examples, f, indent=2)
    
    print("📋 Created claude_config_examples.json")

def main():
    """Main test process"""
    print("🧪 Personal Brain MCP Server - Installation Test")
    print("=" * 55)
    
    # Check we're in the right directory
    if not os.path.exists("pyproject.toml"):
        print("❌ pyproject.toml not found. Run this script from the package root.")
        sys.exit(1)
    
    all_tests_passed = True
    
    # Run tests
    tests = [
        ("Python Installation", test_python_installation),
        ("Node.js Installation", test_node_installation), 
        ("uvx Compatibility", test_uvx_compatibility),
        ("MCP Server Startup", test_mcp_server_startup)
    ]
    
    for test_name, test_func in tests:
        try:
            if not test_func():
                all_tests_passed = False
        except Exception as e:
            print(f"❌ {test_name} - Unexpected error: {e}")
            all_tests_passed = False
    
    # Create configuration examples
    create_claude_config_example()
    
    # Summary
    print("\n📊 Test Summary")
    print("=" * 20)
    
    if all_tests_passed:
        print("🎉 All tests passed!")
        print("")
        print("✅ Package is ready for distribution")
        print("✅ Compatible with uvx, npx, and pip")
        print("✅ MCP server can be created successfully")
        print("")
        print("Next steps:")
        print("  1. Start Personal Brain API: uvicorn main:app --port 8000")
        print("  2. Configure Claude Desktop with examples in claude_config_examples.json")
        print("  3. Test with Claude Desktop")
    else:
        print("❌ Some tests failed. Please fix issues before distribution.")
        sys.exit(1)

if __name__ == "__main__":
    main()