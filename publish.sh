#!/bin/bash
# Publishing script for Personal Brain MCP

set -e

echo "🔍 Checking package for upload readiness..."
twine check dist/*

echo "📤 Uploading to TestPyPI..."
twine upload --repository testpypi dist/*

echo "✅ Upload to TestPyPI complete!"
echo "🧪 Test installation with:"
echo "pip install --index-url https://test.pypi.org/simple/ personal-brain-mcp"

echo ""
read -p "Ready to upload to main PyPI? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📤 Uploading to PyPI..."
    twine upload dist/*
    echo "🎉 Successfully published to PyPI!"
    echo "📦 Install with: pip install personal-brain-mcp" 
else
    echo "⏸️ Skipping PyPI upload. Test your package first!"
fi