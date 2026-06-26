#!/usr/bin/env python3
"""agent-tree.ts: systemPrompt satırlarını backtick'e çevirir (Türkçe apostrof güvenli)."""
import re
from pathlib import Path

path = Path('/home/z/my-project/src/lib/agent-tree.ts')
lines = path.read_text(encoding='utf-8').split('\n')

new_lines = []
fixed_count = 0

for line in lines:
    # Pattern: leading whitespace + KEY: VALUE + '...'  OR  KEY: '...'
    # Match any property with a string value containing apostrophes
    m = re.match(r'^(\s*(?:systemPrompt|expectedOutput|description|inputs|label):\s*)(.+?)(\s*\+\s*)\'(.*)\',\s*$', line)
    if m:
        indent_part = m.group(1)
        var_part = m.group(2)
        plus_part = m.group(3)
        inner = m.group(4)
        inner = inner.replace('`', '\\`').replace('${', '\\${')
        new_line = f"{indent_part}{var_part}{plus_part}`{inner}`,"
        new_lines.append(new_line)
        fixed_count += 1
        continue

    # Pattern: KEY: '...' (no concat)
    m2 = re.match(r'^(\s*(?:systemPrompt|expectedOutput|description|inputs|label):\s*)\'(.*)\',\s*$', line)
    if m2:
        indent_part = m2.group(1)
        inner = m2.group(2)
        inner = inner.replace('`', '\\`').replace('${', '\\${')
        new_line = f"{indent_part}`{inner}`,"
        new_lines.append(new_line)
        fixed_count += 1
        continue

    new_lines.append(line)

path.write_text('\n'.join(new_lines), encoding='utf-8')
print(f'Fixed {fixed_count} lines')
