# Publishing Guide for Personal Brain MCP

## Prerequisites

1. **Create PyPI Account**:
   - Go to https://pypi.org/account/register/
   - Create an account and verify your email

2. **Create TestPyPI Account** (for testing):
   - Go to https://test.pypi.org/account/register/
   - Create an account (separate from main PyPI)

3. **Create API Tokens**:
   - On PyPI: Account Settings → API tokens → "Add API token"
   - On TestPyPI: Account Settings → API tokens → "Add API token"
   - Save both tokens securely

## Step 1: Configure Authentication

Create `~/.pypirc` file:

```ini
[distutils]
index-servers =
    pypi
    testpypi

[pypi]
username = __token__
password = <your-pypi-api-token>

[testpypi]
repository = https://test.pypi.org/legacy/
username = __token__
password = <your-testpypi-api-token>
```

## Step 2: Test Upload (TestPyPI)

```bash
# Upload to TestPyPI first
twine upload --repository testpypi dist/*

# Test installation from TestPyPI
pip install --index-url https://test.pypi.org/simple/ personal-brain-mcp
```

## Step 3: Final Upload (PyPI)

```bash
# Upload to main PyPI
twine upload dist/*

# Test installation from PyPI
pip install personal-brain-mcp
```

## Troubleshooting

- **Name conflicts**: If the package name is taken, modify `name` in `pyproject.toml`
- **Version issues**: Increment version number for each upload
- **Authentication**: Ensure API tokens are correct in `~/.pypirc`

## Post-Publication

1. Test installation: `pip install personal-brain-mcp`
2. Test CLI command: `personal-brain-mcp`
3. Update documentation with PyPI installation instructions