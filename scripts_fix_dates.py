import re, os, sys

POSTS_DIR = "/home/niusounds/404/_posts"

def clean_date_field(match):
    """Replace date field line to remove TZ markers, keep only YYYY-MM-DD."""
    prefix = match.group(1)  # everything before the value (including 'date:' and optional quote)
    after_prefix = match.group(2).rstrip()
    
    # Find the base date in the after_prefix portion
    dm = re.match(r'^(\d{4})-(\d{2})-(\d{1,2})', after_prefix.lstrip())  # skip any leading whitespace/quotes
    if not dm:
        return match.group(0)
    
    yyyy_mm_dd = f"{dm.group(1)}-{dm.group(2)}-{int(dm.group(3)):02d}"
    
    # Determine quote style used originally (if any)
    quote_match = re.match(r"^(\s*date:\s*[\"']?)", match.group(0))
    if not quote_match:
        return f"{prefix}{yyyy_mm_dd}\n"  # safe fallback
    
    orig_quote = ''
    for i in range(len(match.group(0))-1, -1, -1):
        c = match.group(0)[i]
        if c in ('"', "'"):
            orig_quote = c
            break
    
    return f"{prefix}{orig_quote}{yyyy_mm_dd}{orig_quote}\n"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    new_content = re.sub(
        r'^(\s*date:\s*[\'"]?)\s*(\d{4}-\d+-\d+T.*)$',
        lambda m: clean_date_field(m),
        content,
        count=0,
        flags=re.MULTILINE
    )
    
    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed date in {filepath}")

# Process all .md files in posts directory
for filename in os.listdir(POSTS_DIR):
    if filename.endswith('.md'):
        process_file(os.path.join(POSTS_DIR, filename))

print("=== Date fix complete ===")
sys.exit(0)
