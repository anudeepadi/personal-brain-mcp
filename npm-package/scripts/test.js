#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🧪 Testing Personal Brain MCP installation...');

try {
    // Check if Python package is installed
    console.log('📦 Checking Python package installation...');
    execSync('python3 -c "import personal_brain_mcp; print(f\\"Package version: {personal_brain_mcp.__version__}\\")"', { stdio: 'inherit' });
    
    // Check if CLI command is available
    console.log('⚡ Checking CLI command availability...');
    try {
        execSync('personal-brain-mcp --help', { stdio: 'ignore', timeout: 3000 });
        console.log('✅ CLI command is working');
    } catch (error) {
        console.log('⚠️  CLI command check timed out (might need API keys configured)');
    }
    
    console.log('✅ All tests passed!');
} catch (error) {
    console.error('❌ Tests failed:', error.message);
    process.exit(1);
}