#!/usr/bin/env node
/**
 * Personal Brain MCP Server - Node.js wrapper
 * 
 * This wrapper allows the Python MCP server to be easily installed and run via npx.
 * It handles Python environment detection and package installation automatically.
 */

const { spawn } = require('cross-spawn');
const which = require('which');
const path = require('path');
const fs = require('fs');

const PACKAGE_NAME = 'personal-brain-mcp';
const PYTHON_PACKAGE = 'personal-brain-mcp';

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
 * Check if the Python package is installed
 */
function isPythonPackageInstalled(pythonPath) {
  try {
    const result = spawn.sync(pythonPath, ['-c', `import ${PYTHON_PACKAGE.replace('-', '_')}`], {
      stdio: ['ignore', 'ignore', 'ignore']
    });
    return result.status === 0;
  } catch (error) {
    return false;
  }
}

/**
 * Install Python package using pip
 */
function installPythonPackage(pythonPath) {
  console.log('Installing Personal Brain MCP Server...');
  
  const result = spawn.sync(pythonPath, ['-m', 'pip', 'install', PYTHON_PACKAGE], {
    stdio: 'inherit'
  });
  
  if (result.status !== 0) {
    console.error('Failed to install Python package. Please install manually with:');
    console.error(`  pip install ${PYTHON_PACKAGE}`);
    process.exit(1);
  }
}

/**
 * Run the MCP server
 */
function runServer(args) {
  // Try uvx first (if available)
  if (hasUvx()) {
    console.log('Using uvx to run Personal Brain MCP Server...');
    const child = spawn('uvx', [PYTHON_PACKAGE, ...args], {
      stdio: 'inherit'
    });
    
    child.on('exit', (code) => {
      process.exit(code || 0);
    });
    
    return;
  }
  
  // Fall back to regular Python execution
  const pythonPath = findPython();
  
  if (!pythonPath) {
    console.error('Error: Python 3.9+ is required but not found.');
    console.error('Please install Python 3.9 or later from https://python.org');
    process.exit(1);
  }
  
  // Check if package is installed
  if (!isPythonPackageInstalled(pythonPath)) {
    installPythonPackage(pythonPath);
  }
  
  console.log('Starting Personal Brain MCP Server...');
  
  // Run the server
  const child = spawn(pythonPath, ['-m', PYTHON_PACKAGE.replace('-', '_').replace('_', '.'), ...args], {
    stdio: 'inherit'
  });
  
  child.on('exit', (code) => {
    process.exit(code || 0);
  });
  
  child.on('error', (error) => {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  });
}

/**
 * Display help information
 */
function showHelp() {
  console.log(`
Personal Brain MCP Server v1.0.0

USAGE:
  npx personal-brain-mcp [OPTIONS]
  personal-brain-mcp [OPTIONS]  (if installed globally)

OPTIONS:
  --api-url <url>     URL of the Personal Brain API (default: http://localhost:8000)
  --log-level <level> Logging level: DEBUG, INFO, WARNING, ERROR (default: INFO)
  --version          Show version information
  --help             Show this help message

EXAMPLES:
  # Run with default settings
  npx personal-brain-mcp

  # Run with custom API URL
  npx personal-brain-mcp --api-url http://localhost:3000

  # Run with debug logging
  npx personal-brain-mcp --log-level DEBUG

CLAUDE DESKTOP CONFIGURATION:
Add this to your Claude Desktop MCP settings:

{
  "mcpServers": {
    "personal-brain": {
      "command": "npx",
      "args": ["personal-brain-mcp"]
    }
  }
}

For more information, visit: https://github.com/your-username/personal-brain-mcp
`);
}

/**
 * Main entry point
 */
function main() {
  const args = process.argv.slice(2);
  
  // Handle help and version flags
  if (args.includes('--help') || args.includes('-h')) {
    showHelp();
    return;
  }
  
  if (args.includes('--version') || args.includes('-v')) {
    console.log('Personal Brain MCP Server v1.0.0');
    return;
  }
  
  // Run the server
  runServer(args);
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\\nShutting down Personal Brain MCP Server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  process.exit(0);
}); 

if (require.main === module) {
  main();
}