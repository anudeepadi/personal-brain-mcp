"""Render the captured offline output as an SVG transcript, not a UI screenshot."""

from html import escape
from pathlib import Path
import textwrap

directory = Path(__file__).resolve().parent
lines = []
for line in (directory / "offline-output.txt").read_text().splitlines():
    lines.extend(textwrap.wrap(line, width=100, subsequent_indent="   ") or [""])
height = 90 + len(lines) * 23
svg = [
    f'<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="{height}" viewBox="0 0 1080 {height}">',
    '<title>ContextX offline synthetic walkthrough — captured terminal transcript</title>',
    '<rect width="1080" height="100%" rx="12" fill="#152925"/>',
    '<text x="30" y="36" font-family="monospace" font-size="15" fill="#9ccebd">CAPTURED TERMINAL TRANSCRIPT · LOCAL SYNTHETIC DATA · 22 SEP 2026</text>',
]
for index, line in enumerate(lines):
    color = "#b1e3d1" if line.startswith(("ContextX", "PASS:")) else "#edf3ef"
    svg.append(f'<text x="30" y="{78 + index * 23}" font-family="monospace" '
               f'font-size="16" fill="{color}" xml:space="preserve">{escape(line)}</text>')
svg.append('</svg>')
(directory / "offline-transcript.svg").write_text("\n".join(svg) + "\n")
