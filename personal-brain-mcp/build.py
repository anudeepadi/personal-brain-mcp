#!/usr/bin/env python3
"""
Build script for Personal Brain MCP Server
Creates both Python and Node.js packages for distribution.
"""

import os
import subprocess
import sys
import shutil
from pathlib import Path

def run_command(cmd, description):
    """Run a command and handle errors"""
    print(f"📦 {description}...")
    result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    
    if result.returncode != 0:
        print(f"❌ Failed: {description}")
        print(f"Error: {result.stderr}")
        return False
    else:
        print(f"✅ Success: {description}")
        if result.stdout.strip():
            print(f"   {result.stdout.strip()}")
        return True

def build_python_package():
    """Build the Python package"""
    print("\n🐍 Building Python Package")
    print("=" * 40)
    
    # Clean previous builds
    for dir_name in ['build', 'dist', 'src/personal_brain_mcp.egg-info']:
        if os.path.exists(dir_name):
            shutil.rmtree(dir_name)
            print(f"🧹 Cleaned {dir_name}")
    
    # Build the package
    commands = [
        ("python -m build", "Building Python wheel and sdist"),
        ("python -m pip install --upgrade build", "Installing build dependencies"),
        ("python -m build", "Creating distribution packages")
    ]
    
    for cmd, desc in commands:
        if not run_command(cmd, desc):
            return False
    
    return True

def build_node_package():
    """Build the Node.js package"""
    print("\n📦 Building Node.js Package")
    print("=" * 40)
    
    # Check npm is available
    if not run_command("npm --version", "Checking npm availability"):
        print("❌ npm is required for Node.js package building")
        return False
    
    # Install dependencies and create package
    commands = [
        ("npm install", "Installing Node.js dependencies"),
        ("npm pack", "Creating Node.js package")
    ]
    
    for cmd, desc in commands:
        if not run_command(cmd, desc):
            return False
    
    return True

def create_installation_scripts():
    """Create installation and distribution scripts"""
    print("\n📋 Creating Installation Scripts")
    print("=" * 40)
    
    # Create install script for uvx
    uvx_install = """#!/bin/bash
# Personal Brain MCP Server - uvx installation script

echo "🧠 Installing Personal Brain MCP Server via uvx..."

# Check if uv is installed
if ! command -v uv &> /dev/null; then
    echo "📥 Installing uv..."
    curl -LsSf https://astral.sh/uv/install.sh | sh
    export PATH="$HOME/.cargo/bin:$PATH"
fi

# Install with uvx
echo "📦 Installing personal-brain-mcp..."
uvx install personal-brain-mcp

echo "✅ Installation complete!"
echo ""
echo "🔧 To use with Claude Desktop, add this to your MCP config:"
echo '{'
echo '  "mcpServers": {'
echo '    "personal-brain": {'
echo '      "command": "uvx",'
echo '      "args": ["personal-brain-mcp"]'
echo '    }'
echo '  }'
echo '}'
"""
    
    with open("install-uvx.sh", "w") as f:
        f.write(uvx_install)
    os.chmod("install-uvx.sh", 0o755)
    print("✅ Created install-uvx.sh")
    
    # Create install script for npx
    npx_install = """#!/bin/bash
# Personal Brain MCP Server - npx installation script

echo "🧠 Installing Personal Brain MCP Server via npx..."

# Check if node is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is required. Please install from https://nodejs.org"
    exit 1
fi

# Install globally
echo "📦 Installing personal-brain-mcp globally..."
npm install -g personal-brain-mcp

echo "✅ Installation complete!"
echo ""
echo "🔧 To use with Claude Desktop, add this to your MCP config:"
echo '{'
echo '  "mcpServers": {'
echo '    "personal-brain": {'
echo '      "command": "personal-brain-mcp"'
echo '    }'
echo '  }'
echo '}'

echo ""
echo "🚀 You can also run directly with: npx personal-brain-mcp"
"""
    
    with open("install-npx.sh", "w") as f:
        f.write(npx_install)
    os.chmod("install-npx.sh", 0o755)
    print("✅ Created install-npx.sh")
    
    return True

def main():
    """Main build process"""
    print("🏗️  Personal Brain MCP Server - Build Process")
    print("=" * 50)
    
    # Check we're in the right directory
    if not os.path.exists("pyproject.toml"):
        print("❌ pyproject.toml not found. Run this script from the package root.")
        sys.exit(1)
    
    success = True
    
    # Build Python package
    if not build_python_package():
        success = False
    
    # Build Node.js package
    if not build_node_package():
        success = False
    
    # Create installation scripts
    if not create_installation_scripts():
        success = False
    
    if success:
        print("\n🎉 Build Complete!")
        print("=" * 20)
        print("📦 Python package: dist/personal_brain_mcp-*.whl")
        print("📦 Node.js package: personal-brain-mcp-*.tgz")
        print("📋 Installation scripts: install-uvx.sh, install-npx.sh")
        print("")
        print("🚀 Ready for distribution!")
        print("")
        print("Next steps:")
        print("  1. Test packages locally")
        print("  2. Upload Python package: twine upload dist/*")
        print("  3. Publish Node.js package: npm publish personal-brain-mcp-*.tgz")
    else:
        print("\n❌ Build failed. Check errors above.")
        sys.exit(1)

if __name__ == "__main__":
    main()