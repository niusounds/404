

#!/usr/bin/env python3
"""Fix dates in all Jekyll posts: remove T-time-component keep YYYY-MM-DD only"""


import os
import re

POSTS_DIR = "/home/niusounds/404/_posts"


def fix_date_in_line(line):
    """Replace date value that contains time component with just the date part."""
    

    # Pattern: "date: YYYY-MM-DDThh:mm:ss..." (with or without quotes)
    pattern = r"^(\s*date:\s*[\"']*)(\d{4}-\d{2}-\d{2})T\d+(:[0-9.]+)?(?:Z|[+-]\d+:?\d{2}|[A-Z]+)/([\"']*)$"

    
    def replacer(m):
        prefix = m.group(1)  # "date: '..." or date: "...
        base_date = m.group(2)  # YYYY-MM-DD
        suffix = m.group(4)  # closing quote if present
        
        return f"{prefix}{base_date}{suffix}"

    new_line, n = re.subn(pattern, replacer, line)
    
# Handle the case where date has no quotes: `date: 2026-08-14T17:25:31+00:00`
    pattern_noquote = r"^(?!.*['\"].*\s*$)(date:\s*)(\d{4}-\d{2}-\d{2})([Tt]\d+:?\d*:(?:\d*)?(Z|[+-]\d+:?\d{2})?)$"
    
    new_line_noquote, n = re.subn(pattern_noquote, r'\1\2', new_line)
    return (new_line or line), n  # if pattern didn't match on second try too

def main():
    files_fixed = []
    
    for fname in sorted(os.listdir(POSTS_DIR)):
        if not fname.endswith('.md'):
            continue
        
        filepath = os.path.join(POSTS_DIR, fname)
        
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        lines = content.split('\n')
        new_lines = []
        fixed_in_this_file = 0
        
        for lineno, line in enumerate(lines):
# Try both patterns (single + multiline quoted and no-quote form):
            processed_line, n_matches = fix_date_in_line(line)
            
            if n_matches > 0:
                # Additional cleanups needed — handle multiline date formats like `date: '` then the value on next line:
                    pass
            
                new_lines.append(processed_line)
                fixed_in_this_file += 1
            else:
                new_lines.append(line)
        
        if fixed_in_this_file > 0:
            
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write('\n'.join(new_lines))

