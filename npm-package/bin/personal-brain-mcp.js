#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

// Check if the Python command is available
function findPythonCommand() {
    const { execSync } = require('child_process');
    const commands = ['personal-brain-mcp'];
    
    for (const cmd of commands) {
        try {
            execSync(`which ${cmd}`, { stdio: 'ignore' });
            return cmd;
        } catch (error) {
            continue;
        }
    }
    
    // If not found in PATH, provide helpful error
    console.error('❌ personal-brain-mcp Python package not found.');
    console.error('');
    console.error('This usually means one of the following:');
    console.error('1. The Python package failed to install during npm install');
    console.error('2. The Python package is not in your PATH');
    console.error('3. You need to configure your API keys');
    console.error('');
    console.error('Try running:');
    console.error('  npm test  # to check installation');
    console.error('  pip install personal-brain-mcp  # to install manually');
    console.error('');
    process.exit(1);
}

// Main wrapper function
function main() {
    const command = findPythonCommand();
    
    // Pass all arguments to the Python command
    const args = process.argv.slice(2);
    
    // Spawn the Python process
    const child = spawn(command, args, {
        stdio: 'inherit',
        shell: process.platform === 'win32'
    });
    
    // Handle process exit
    child.on('close', (code) => {
        process.exit(code);
    });
    
    child.on('error', (error) => {
        console.error('❌ Failed to start personal-brain-mcp:', error.message);
        process.exit(1);
    });
    
    // Handle process signals
    process.on('SIGTERM', () => child.kill('SIGTERM'));
    process.on('SIGINT', () => child.kill('SIGINT'));
}

// Show help if no Python command found and --help requested
if (process.argv.includes('--help') || process.argv.includes('-h')) {
    console.log('Personal Brain MCP - Node.js Wrapper');
    console.log('');
    console.log('This is a Node.js wrapper for the Personal Brain MCP Python package.');
    console.log('');
    console.log('Usage:');
    console.log('  personal-brain-mcp [options]');
    console.log('');
    console.log('The wrapper will pass all arguments to the underlying Python command.');
    console.log('');
    console.log('Setup:');
    console.log('1. Ensure you have Python 3.8+ installed');
    console.log('2. Create a .env file with your API keys:');
    console.log('   GOOGLE_API_KEY=your_key');
    console.log('   PINECONE_API_KEY=your_key');
    console.log('   PINECONE_INDEX_NAME=your_index');
    console.log('3. Run: personal-brain-mcp');
    console.log('');
    
    // Try to show Python help too
    try {
        main();
    } catch (error) {
        console.log('For more options, install the Python package and run again.');
    }
} else {
    main();
}