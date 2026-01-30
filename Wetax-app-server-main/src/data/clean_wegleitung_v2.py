#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Improved script to clean and convert the Kanton Zürich tax guide text to clean Markdown.
Removes PDF artifacts, form field markers, and formats content optimally for RAG use.
"""

import re
import sys

def clean_text(text):
    """Clean the text from PDF artifacts and format for Markdown."""
    
    lines = text.split('\n')
    cleaned_lines = []
    
    for line in lines:
        original_line = line
        line = line.strip()
        
        # Skip lines that are just repeated number patterns (form field markers)
        if re.match(r'^[0-9]{1,10}(\s+[0-9]{1,10})*$', line):
            # But keep single page numbers (1-2 digits)
            if len(line) <= 2 and line.isdigit():
                cleaned_lines.append(f'\n## Seite {line}\n')
            continue
        
        # Skip lines that are just special characters (arrows, etc.)
        if re.match(r'^[▲▼◀▸▾▴\s]+$', line):
            continue
        
        # Skip lines that are just form field codes
        if re.match(r'^(13213211|113211|3213211|13211|3211|111)(\s+(13213211|113211|3213211|13211|3211|111))*$', line):
            continue
        
        # Remove form field references at end of lines
        line = re.sub(r'\s+0\d{12}$', '', original_line.rstrip())
        line = line.strip()
        
        # Skip empty lines
        if not line:
            if cleaned_lines and cleaned_lines[-1].strip():
                cleaned_lines.append('')
            continue
        
        cleaned_lines.append(line)
    
    # Join lines back
    text = '\n'.join(cleaned_lines)
    
    # Remove excessive blank lines (more than 2 consecutive)
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    return text

def is_heading(line, prev_line=None, next_line=None):
    """Determine if a line should be a heading."""
    line = line.strip()
    
    # Single letters are not headings (they're index entries)
    if len(line) == 1 and line.isalpha():
        return False
    
    # Lines that are just page numbers
    if re.match(r'^\d{1,2}$', line):
        return False
    
    # Lines ending with just a page number (index entries)
    if re.match(r'.+\s+\d{1,2}$', line) and len(line) < 60:
        return False
    
    # Very short lines that might be headings
    if len(line) < 80 and line and not line.endswith('.') and not line.endswith(',') and ':' not in line:
        # Check if it starts with a number (like "4. Something")
        if re.match(r'^\d+\.?\s+[A-ZÄÖÜ]', line):
            return True
        # Check if it's all caps or starts with capital
        if line[0].isupper() and not any(char.isdigit() for char in line[-10:]):
            # But not if it's part of a sentence
            if prev_line and prev_line.strip() and not prev_line.strip().endswith('.'):
                return False
            return True
    
    return False

def structure_as_markdown(text):
    """Structure the cleaned text as proper Markdown with better heading detection."""
    
    lines = text.split('\n')
    markdown_lines = []
    
    i = 0
    while i < len(lines):
        line = lines[i]
        prev_line = lines[i-1] if i > 0 else None
        next_line = lines[i+1] if i < len(lines) - 1 else None
        
        stripped = line.strip()
        
        # Skip empty lines at the start
        if not stripped and not markdown_lines:
            i += 1
            continue
        
        # Check for page number markers
        if re.match(r'^## Seite \d+$', stripped):
            markdown_lines.append(stripped)
            markdown_lines.append('')
            i += 1
            continue
        
        # Check if it should be a heading
        if is_heading(line, prev_line, next_line):
            if markdown_lines and markdown_lines[-1].strip():
                markdown_lines.append('')
            # Use appropriate heading level
            if re.match(r'^\d+\.?\s+', stripped):
                markdown_lines.append(f'## {stripped}')
            else:
                markdown_lines.append(f'### {stripped}')
            markdown_lines.append('')
            i += 1
            continue
        
        # Regular content
        if stripped:
            markdown_lines.append(line)
        elif markdown_lines and markdown_lines[-1].strip():
            markdown_lines.append('')
        
        i += 1
    
    return '\n'.join(markdown_lines)

def post_process_markdown(text):
    """Post-process the markdown to improve structure."""
    
    lines = text.split('\n')
    processed = []
    
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Remove duplicate headings
        if line.startswith('##') and i > 0 and processed and processed[-1].startswith('##'):
            # Skip if it's the same heading
            if line == processed[-1]:
                i += 1
                continue
        
        # Clean up index section (single letters)
        if line.strip() in 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' and i < 300:
            # This is the index, format it differently
            processed.append(f'**{line.strip()}**')
            i += 1
            continue
        
        processed.append(line)
        i += 1
    
    return '\n'.join(processed)

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
    
    print("Post-processing...")
    markdown = post_process_markdown(markdown)
    
    # Add header
    header = """# Wegleitung zur Steuererklärung 2025
## Kanton Zürich - Steueramt

> Dieses Dokument wurde aus der offiziellen Wegleitung des Kantons Zürich erstellt.  
> Steuerperiode: 2025  
> Stand: 2025  
> Quelle: Kantonales Steueramt Zürich

**Wichtiger Hinweis:** Dieses Dokument dient als Knowledge Base für RAG-Systeme. Für offizielle Steuerfragen konsultieren Sie bitte die Originaldokumente oder wenden Sie sich an das Steueramt.

---

## Inhaltsverzeichnis

"""
    
    # Extract table of contents from the original
    toc_section = []
    in_toc = False
    for line in markdown.split('\n'):
        if 'Inhalt' in line or 'Inhaltsverzeichnis' in line:
            in_toc = True
        if in_toc and line.strip() and not line.startswith('#'):
            if 'Einkünfte' in line or 'Abzüge' in line or 'Vermögen' in line:
                toc_section.append(f"- {line}")
            if len(toc_section) > 20:  # Limit TOC size
                break
    
    final_markdown = header + '\n'.join(toc_section[:15]) + '\n\n---\n\n' + markdown
    
    print(f"Writing to {output_file}...")
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(final_markdown)
    
    print(f"Done! Created {output_file}")
    print(f"Original lines: {len(content.splitlines())}")
    print(f"Cleaned lines: {len(final_markdown.splitlines())}")

if __name__ == '__main__':
    main()


