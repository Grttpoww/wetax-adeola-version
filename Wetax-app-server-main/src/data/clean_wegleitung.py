#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to clean and convert the Kanton Zürich tax guide text to clean Markdown.
Removes PDF artifacts, form field markers, and formats content for RAG use.
"""

import re
import sys

def clean_text(text):
    """Clean the text from PDF artifacts and format for Markdown."""
    
    # Remove common PDF artifacts (form field markers, repeated numbers, etc.)
    # These patterns are based on what I saw in the file
    
    # Remove lines that are just repeated numbers (form field markers)
    lines = text.split('\n')
    cleaned_lines = []
    
    for line in lines:
        # Skip lines that are just repeated number patterns (form field markers)
        if re.match(r'^[0-9]{1,10}(\s+[0-9]{1,10})*$', line.strip()):
            # But keep single page numbers
            if len(line.strip()) <= 4 and line.strip().isdigit():
                cleaned_lines.append(line)
            continue
        
        # Skip lines that are just special characters (arrows, etc.)
        if re.match(r'^[▲▼◀▸▾▴\s]+$', line.strip()):
            continue
        
        # Skip lines that are just form field codes like "13213211", "113211", etc.
        if re.match(r'^(13213211|113211|3213211|13211|3211|111)(\s+(13213211|113211|3213211|13211|3211|111))*$', line.strip()):
            continue
        
        # Skip empty lines that are just whitespace
        if not line.strip():
            # Keep some empty lines for structure, but not too many
            if cleaned_lines and cleaned_lines[-1].strip():
                cleaned_lines.append('')
            continue
        
        cleaned_lines.append(line)
    
    # Join lines back
    text = '\n'.join(cleaned_lines)
    
    # Remove excessive blank lines (more than 2 consecutive)
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    # Clean up specific patterns
    # Remove form field references like "0106252602261" at end of lines
    text = re.sub(r'\s+0\d{12}$', '', text, flags=re.MULTILINE)
    
    # Clean up page numbers that appear alone
    text = re.sub(r'^\s*(\d{1,2})\s*$', r'\n## Seite \1\n', text, flags=re.MULTILINE)
    
    return text

def structure_as_markdown(text):
    """Structure the cleaned text as proper Markdown."""
    
    lines = text.split('\n')
    markdown_lines = []
    in_section = False
    current_section = None
    
    i = 0
    while i < len(lines):
        line = lines[i].strip()
        
        # Skip empty lines at the start
        if not line and not markdown_lines:
            i += 1
            continue
        
        # Detect major headings (they're usually short and in caps or have specific patterns)
        if line and len(line) < 100:
            # Check if it's a heading pattern
            # Headings often start with numbers or are short descriptive lines
            if re.match(r'^\d+\.?\s+[A-ZÄÖÜ]', line) or \
               (len(line) < 80 and line[0].isupper() and not line.endswith('.') and 
                not line.endswith(',') and ':' not in line and 
                not any(char.isdigit() for char in line[-5:])):
                # It might be a heading
                if markdown_lines and markdown_lines[-1].strip():
                    markdown_lines.append('')
                markdown_lines.append(f'## {line}')
                markdown_lines.append('')
                i += 1
                continue
        
        # Regular content
        if line:
            markdown_lines.append(line)
        elif markdown_lines and markdown_lines[-1].strip():
            markdown_lines.append('')
        
        i += 1
    
    return '\n'.join(markdown_lines)

def main():
    input_file = 'Kanton Zürich.txt'
    output_file = 'Kanton_Zuerich_Wegleitung_2025.md'
    
    print(f"Reading {input_file}...")
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    print("Cleaning text...")
    cleaned = clean_text(content)
    
    print("Structuring as Markdown...")
    markdown = structure_as_markdown(cleaned)
    
    # Add header
    header = """# Wegleitung zur Steuererklärung 2025
## Kanton Zürich - Steueramt

> Dieses Dokument wurde aus der offiziellen Wegleitung des Kantons Zürich erstellt.
> Steuerperiode: 2025
> Stand: 2025

---

"""
    
    final_markdown = header + markdown
    
    print(f"Writing to {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(final_markdown)
    
    print(f"Done! Created {output_file}")
    print(f"Original lines: {len(content.splitlines())}")
    print(f"Cleaned lines: {len(final_markdown.splitlines())}")

if __name__ == '__main__':
    main()


