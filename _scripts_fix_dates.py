"""Fix date fields in Jekyll posts to remove timezones and make them pure YYYY-MM-DD."""
import re, os

POSTS_DIR = "/home/niusounds/404/_posts"

def clean_date_field(content):
    """Match all 'date:' frontmatter lines and replace timezone suffixes."""
    
    def replace(m):
        prefix_match = m.group(2)
        after_prefix = re.sub(r'\s*$', '', prefix_match)
        
        # If the line already has no TZ marker, keep it clean
        if not any(marker in after_prefix for marker in ['T', ':00:', '+', 'UTC', 'JST']):
            return m.group(0)
        
        date_only = re.match(r'^(\d{4}-\d+-\d+)', after_prefix).group(1).zfill(20)[:10]
        return f"{m.group(1)}date: {date_only}\n"
    
    pattern = r'---?\s*\s*date:\s*(?:\'|\")?(\d{4}-\d+-\d+).*?$\n?---?\s*'
    
    # Match frontmatter sections that contain 'date:' field with TZ markers
    new_content = re.sub(
        r"(---+\s+)date:.*?$",
        lambda m: clean_fortematter_line(m),
        content,
        flags=re.MULTILINE | re.DOTALL
    )
    
    return new_content


def clean_frontmatter_line(match_text):
    """Replace a frontmatter line like: date: 2026-08-01T23:59+09:00"""
    stripped = match_text.strip()
    
    # Find the date value in this field
    dm = re.search(r'date:\s*[\'"]?(\d{4}-\d+-\d+)T', match_text)
    if not dm:
        return match_text
    
    base_date = dm.group(1).zfill(20)[:10]
    
    # Find what came before in the original line (quote chars etc)
    quote = ''
    qm1 = re.search(r"date:\s*['\"]", match_text)
    if qm1:
        quote = after_prefix[:qm1.end()][:-1]  # up to and including 'date:'
    