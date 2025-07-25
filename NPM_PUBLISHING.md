# NPM Publishing Guide for Personal Brain MCP

## Prerequisites

1. **Create npm Account**:
   - Go to https://npmjs.com/signup
   - Create an account and verify your email

2. **Install npm CLI** (if not already installed):
   ```bash
   npm install -g npm@latest
   ```

3. **Login to npm**:
   ```bash
   npm login
   ```

## Package Structure

The npm package is located in `npm-package/` and includes:
- Node.js wrapper script (`bin/personal-brain-mcp.js`)
- Installation scripts (`scripts/`)
- Python source code (`python-src/`)
- Package metadata (`package.json`)

## Publishing Steps

### Step 1: Navigate to npm package
```bash
cd npm-package
```

### Step 2: Test the package
```bash
npm test
```

### Step 3: Check package contents
```bash
npm pack --dry-run
```

### Step 4: Publish to npm
```bash
npm publish
```

### Alternative: Use the automated script
```bash
./publish-npm.sh
```

## Post-Publication Testing

Test the published package:
```bash
# Install globally
npm install -g personal-brain-mcp

# Test the command
personal-brain-mcp --help
```

## Package Features

### Automatic Python Installation
- The npm package automatically installs the Python dependencies
- Falls back to local source if PyPI is unavailable
- Provides helpful error messages for missing requirements

### Cross-Platform Support
- Works on macOS, Linux, and Windows
- Handles different Python/pip command variations
- Provides platform-specific installation guidance

### User-Friendly CLI
- Acts as a transparent wrapper for the Python command
- Passes all arguments through to the underlying Python process
- Provides helpful error messages and setup guidance

## Version Management

To publish updates:
1. Update version in `package.json`
2. Update version in `python-src/pyproject.toml` 
3. Rebuild Python package if needed
4. Run `npm publish`

## Troubleshooting

### Common Issues
- **Name conflicts**: The package name `personal-brain-mcp` should be available
- **Authentication**: Ensure you're logged in with `npm whoami`
- **Permissions**: Some systems may require `sudo` for global installation
- **Python deps**: Installation script handles Python package dependencies

### Support Files
- `README.md`: User documentation
- `.npmignore`: Files excluded from npm package
- `publish-npm.sh`: Automated publishing script

## Package Size
- Current package: ~47KB compressed, ~140KB unpacked
- Includes Python source code for offline installation
- Optimized with .npmignore to exclude unnecessary files