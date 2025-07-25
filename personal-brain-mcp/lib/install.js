#!/usr/bin/env node
/**
 * Post-install script for Personal Brain MCP
 * 
 * This script runs after npm install to ensure the Python package is available.
 */

const { spawn } = require('cross-spawn');
const which = require('which');

/**
 * Find a suitable Python executable
 */
function findPython() {
  const candidates = ['python3', 'python', 'py'];
  
  for (const candidate of candidates) {
    try {
      const pythonPath = which.sync(candidate);
      // Test if this Python version is suitable (3.9+)
      const result = spawn.sync(candidate, ['-c', 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")'], { 
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore']
      });
      
      if (result.status === 0) {
        const version = result.stdout.trim();
        const [major, minor] = version.split('.').map(Number);
        if (major === 3 && minor >= 9) {
          return pythonPath;
        }
      }
    } catch (error) {
      // Continue to next candidate
    }
  }
  
  return null;
}

/**
 * Check if uvx is available
 */
function hasUvx() {
  try {
    which.sync('uvx');
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Main installation check
 */
function main() {
  console.log('🧠 Personal Brain MCP Server - Post-install check');
  
  // Check if uvx is available (preferred method)
  if (hasUvx()) {
    console.log('✅ uvx detected - Python package will be managed automatically');
    console.log('   Use: npx personal-brain-mcp to start the server');
    return;
  }
  
  // Check Python availability
  const pythonPath = findPython();
  
  if (!pythonPath) {
    console.log('⚠️  Python 3.9+ not found');
    console.log('   Please install Python 3.9+ from https://python.org');
    console.log('   Or install uv/uvx for automatic Python management:');
    console.log('   curl -LsSf https://astral.sh/uv/install.sh | sh');
    return;
  }
  
  console.log(`✅ Python found: ${pythonPath}`);
  
  // Check if the Python package is available
  try {
    const result = spawn.sync(pythonPath, ['-c', 'import personal_brain_mcp'], {
      stdio: ['ignore', 'ignore', 'ignore']
    });
    
    if (result.status === 0) {
      console.log('✅ Personal Brain MCP Python package is available');
    } else {
      console.log('📦 Python package will be installed on first run');
    }
  } catch (error) {
    console.log('📦 Python package will be installed on first run');
  }
  
  console.log('');
  console.log('Ready to use! Start with: npx personal-brain-mcp');
  console.log('For Claude Desktop, add this to your MCP settings:');
  console.log('');
  console.log('{'); 
  console.log('  "mcpServers": {');
  console.log('    "personal-brain": {');
  console.log('      "command": "npx",');
  console.log('      "args": ["personal-brain-mcp"]');
  console.log('    }');
  console.log('  }');
  console.log('}');
}

if (require.main === module) {
  main();
}