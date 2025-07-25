#!/usr/bin/env node

const { spawn, execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('🐍 Installing Personal Brain MCP Python dependencies...');

// Check if Python is available
function checkPython() {
    const pythonCommands = ['python3', 'python'];
    
    for (const cmd of pythonCommands) {
        try {
            execSync(`${cmd} --version`, { stdio: 'ignore' });
            return cmd;
        } catch (error) {
            continue;
        }
    }
    
    throw new Error('Python 3.8+ is required but not found. Please install Python first.');
}

// Check if pip is available
function checkPip(pythonCmd) {
    const pipCommands = [`${pythonCmd} -m pip`, 'pip3', 'pip'];
    
    for (const cmd of pipCommands) {
        try {
            execSync(`${cmd} --version`, { stdio: 'ignore' });
            return cmd;
        } catch (error) {
            continue;
        }
    }
    
    throw new Error('pip is required but not found. Please install pip first.');
}

// Install the Python package
function installPythonPackage(pipCmd) {
    console.log('📦 Installing personal-brain-mcp Python package...');
    
    try {
        // Try to install from PyPI first
        execSync(`${pipCmd} install personal-brain-mcp`, { stdio: 'inherit' });
        console.log('✅ Successfully installed personal-brain-mcp from PyPI');
    } catch (error) {
        console.log('⚠️  PyPI installation failed, installing from local source...');
        
        // Fallback to local installation
        const packageRoot = path.join(__dirname, '..', 'python-src');
        if (fs.existsSync(packageRoot)) {
            execSync(`${pipCmd} install -e "${packageRoot}"`, { stdio: 'inherit' });
            console.log('✅ Successfully installed personal-brain-mcp from local source');
        } else {
            throw new Error('Failed to install personal-brain-mcp: PyPI unavailable and no local source found');
        }
    }
}

// Verify installation
function verifyInstallation() {
    try {
        execSync('personal-brain-mcp --help', { stdio: 'ignore', timeout: 5000 });
        console.log('✅ Installation verified successfully');
        return true;
    } catch (error) {
        console.log('⚠️  Could not verify installation (this might be normal if API keys are not configured)');
        return false;
    }
}

// Main installation process
async function install() {
    try {
        const pythonCmd = checkPython();
        console.log(`✅ Found Python: ${pythonCmd}`);
        
        const pipCmd = checkPip(pythonCmd);
        console.log(`✅ Found pip: ${pipCmd}`);
        
        installPythonPackage(pipCmd);
        verifyInstallation();
        
        console.log('\n🎉 Personal Brain MCP installed successfully!');
        console.log('\n📋 Next steps:');
        console.log('1. Set up your .env file with API keys');
        console.log('2. Run: personal-brain-mcp');
        console.log('3. Configure Claude Desktop with the MCP server');
        
    } catch (error) {
        console.error(`❌ Installation failed: ${error.message}`);
        process.exit(1);
    }
}

// Run installation if this script is executed directly
if (require.main === module) {
    install();
}