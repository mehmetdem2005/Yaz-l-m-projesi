#!/usr/bin/env python3
"""connectors.ts'deki backtick string'lerdeki Türkçe kesme işaretlerini temizler."""
import re
from pathlib import Path

path = Path('/home/z/my-project/src/lib/connectors.ts')
content = path.read_text(encoding='utf-8')

# Backtick içinde Türkçe kesme (' karakterini) temizle
# Pattern: `...'...` → `... ...`
def fix_apostrophes(match):
    full = match.group(0)
    # Sadece içeriği al
    inner = full[1:-1]  # remove backticks
    # ' karakterini boşlukla değiştir veya kaldır
    # "deploy'ları" → "deployları"
    # "Supabase Storage'a" → "Supabase Storage'a" → "Supabase Storage"
    # Basit yaklaşım: ' → boşluk
    inner = inner.replace("'", "")
    return f'`{inner}`'

# Multi-line backtick string'leri yakala
content = re.sub(r'`[^`]*`', fix_apostrophes, content)

path.write_text(content, encoding='utf-8')
print("Done")
