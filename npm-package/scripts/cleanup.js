#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🧹 Cleaning up Personal Brain MCP...');

try {
    // Try to uninstall the Python package
    const pipCommands = ['python3 -m pip', 'pip3', 'pip'];
    
    for (const cmd of pipCommands) {
        try {
            execSync(`${cmd} uninstall personal-brain-mcp -y`, { stdio: 'ignore' });
            console.log('✅ Successfully uninstalled personal-brain-mcp Python package');
            break;
        } catch (error) {
            continue;
        }
    }
    
    console.log('✅ Cleanup completed');
} catch (error) {
    console.log('⚠️  Cleanup completed with warnings (this is usually normal)');
}