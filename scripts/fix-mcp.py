#!/usr/bin/env python3
"""mcp.ts Türkçe kesme içeren string'leri backtick'e çevirir."""
import re
from pathlib import Path

path = Path('/home/z/my-project/src/lib/mcp.ts')
lines = path.read_text(encoding='utf-8').split('\n')

new_lines = []
fixed_count = 0

for line in lines:
    m = re.match(r'^(\s*(?:description|name|label|placeholder):\s*)\'(.*)\',\s*$', line)
    if m:
        indent_part = m.group(1)
        inner = m.group(2)
        inner = inner.replace('`', '\\`').replace('${', '\\${')
        new_line = f"{indent_part}`{inner}`,"
        new_lines.append(new_line)
        fixed_count += 1
        continue
    new_lines.append(line)

path.write_text('\n'.join(new_lines), encoding='utf-8')
print(f'Fixed {fixed_count} lines')
