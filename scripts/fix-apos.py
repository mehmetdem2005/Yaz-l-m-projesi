#!/usr/bin/env python3
"""connectors.ts'deki backtick string'lerdeki Türkçe kesme isaretlerini temizler."""
import re
from pathlib import Path

path = Path('/home/z/my-project/src/lib/connectors.ts')
content = path.read_text(encoding='utf-8')

def fix_apostrophes(match):
    full = match.group(0)
    inner = full[1:-1]
    inner = inner.replace("'", "")
    return f'`{inner}`'

content = re.sub(r'`[^`]*`', fix_apostrophes, content)

path.write_text(content, encoding='utf-8')
print("Done")
