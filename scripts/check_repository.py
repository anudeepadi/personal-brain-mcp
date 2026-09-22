"""Validate current documentation, example configuration, and source declarations."""
import ast
import json
import re
import tomllib
from pathlib import Path
from urllib.parse import urlsplit, unquote
from xml.etree import ElementTree
ROOT=Path(__file__).resolve().parents[1]
pages=[ROOT/n for n in ['README.md','CONTRIBUTING.md','SECURITY.md','CODE_OF_CONDUCT.md','ROADMAP.md','CHANGELOG.md']]
pages+=list((ROOT/'docs').glob('*.md'))
errors=[]
for p in pages:
 text=p.read_text()
 for target in re.findall(r'\]\(([^)]+)\)',text)+re.findall(r'(?:src|srcset|href)="([^"]+)"',text):
  parsed=urlsplit(target)
  if parsed.scheme or not parsed.path:continue
  if not (p.parent/unquote(parsed.path)).exists():errors.append(f'{p.name}: missing {target}')
for p in (ROOT/'docs/assets').glob('*.svg'):
 tree=ElementTree.parse(p).getroot()
 for tag in ['title','desc']:
  if tree.find('{http://www.w3.org/2000/svg}'+tag) is None:errors.append(f'{p.name}: missing {tag}')
json.loads((ROOT/'examples/claude_desktop_config.json').read_text())
project=tomllib.loads((ROOT/'pyproject.toml').read_text())['project']
assert project['scripts']['personal-brain-mcp']=='personal_brain_mcp.server:main'
tree=ast.parse((ROOT/'personal_brain_mcp/server.py').read_text())
counts={'tool':0,'resource':0}
for node in ast.walk(tree):
 if isinstance(node,(ast.FunctionDef,ast.AsyncFunctionDef)):
  for d in node.decorator_list:
   if isinstance(d,ast.Call) and isinstance(d.func,ast.Attribute) and isinstance(d.func.value,ast.Name) and d.func.value.id=='mcp' and d.func.attr in counts:counts[d.func.attr]+=1
assert counts=={'tool':10,'resource':5},counts
if errors:raise SystemExit('\n'.join(errors))
print(f'Validated {len(pages)} current guides, SVG metadata, example config, and 10 tools / 5 resource declarations.')
