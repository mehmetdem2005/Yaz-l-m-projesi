#!/usr/bin/env python3
"""standards.ts'deki promptTemplate'lerdeki Türkçe kesme sorununu backtick ile çözer."""
import re
from pathlib import Path

path = Path('/home/z/my-project/src/lib/standards.ts')
content = path.read_text(encoding='utf-8')

# promptTemplate:\n      '...tek satır...'  ->  promptTemplate:\n      `...tek satır...`
# Bu sefer inner kısmı greedy yapacağız: sondaki ',\n'i bulana kadar
def replacer(match):
    indent = match.group(1)
    inner = match.group(2)
    inner = inner.replace('`', '\\`').replace('${', '\\${')
    return f'promptTemplate:\n{indent}`{inner}`,'

# Non-greedy değil, satırın sonundaki ' yakalayana kadar greedy
pattern = re.compile(r"promptTemplate:\s*\n(\s+)'(.*?)',(?:\n|$)", re.MULTILINE | re.DOTALL)
new_content = pattern.sub(replacer, content)

path.write_text(new_content, encoding='utf-8')
print('Done.')

# Hata kalan mı kontrol et
remaining = re.findall(r"promptTemplate:\s*\n\s+'", new_content)
print('Remaining single-quote promptTemplates:', len(remaining))
