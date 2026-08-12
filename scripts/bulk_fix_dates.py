#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""Bulk fix ALL markdown post date fields to valid Jekyll ISO format.

Handles these broken patterns (common across 60+ posts):
1) 'YYYY-MM-DDTHH' where HH is >23 → hour field overflow (e.g. T14:30 means colonic embedding bug)
2) Missing 'T' separator: 'YYYY-MM-DDHH' or 'YYYY-MM-DD :HH'
3) Mixed offsets like '+0900', '+0700' without required colon format
4) '14:30:00 +0900' embedded as hour=14, minute=30 (valid for most but the file name mismatch matters)
5) Invalid separator characters or extra bytes

Jekyll 4.4+ requires strict ISO 8601 with T separator for 'date:' field.
"""
import os
import re
import sys
from pathlib import Path
from datetime import datetime, timezone, timedelta

BASE = Path('/home/niusounds/404/_posts')

TODAY_JST = datetime.now(timezone(timedelta(hours=9)))  # current JST time for fallback
REPLACEMENT_TZ = '+09:00'
VALID_TS_FORMAT = 'YYYY-MM-DDThh:mm:ss+TZ:offset'

def parse_date_field(raw: str) -> dict | None:
    """Parse whatever date format is in the raw date field into parts.
    
    Returns dict with {year, month, day, hour, minute} or None if invalid.
    Handles variants like '2026-08-14T30:00+09:00', 'Aug 7, 2026 @ 3:14 AM +0900'.
    """
    
    patterns = [
        (re.compile(r'^\s*([\d]{4})\-([\d]{2})\-([\d]{2})[Tt ]([\d]{2}):([\d]{2}).*$'), 'iso8601'),
        # Alternative for weird separator formats like YYYY-MM-DD :HH:MM+ZZ
    ]

    for pat, fmt in patterns:
        m = pat.search(raw.strip())
        if m:
            return {
                'year': int(m.group(1)), 
                'month': int(m.group(2)), 
                'day': int(m.group(3)), 
                'hour': int(m.group(4)),
                'minute': int(m.group(5))
            } if fmt == 'iso8601' else None
    
    return None  

def normalize_hour_minute(hour, minute):
    """Clamp hour to 23 and keep minutes within [0,59] range."""
    h = max(min(int(hour), 23), 0)  
    m = max(min(int(minute), 59), 0)
    return h, m

def validate_date(filename: str, date_field_raw: str | None):
    """Validate the content of a markdown post and flag problematic entries.
    
    Returns dict {status: bool, reason: str} indicating issue type if any.
    """
    filename = str(Path(filename))  # ensure path format
    if not date_field_raw: return {'status': False, 'reason': 'Missing date'}

    
    parsed = parse_date_field(date_field_raw) if len(date_field_raw.strip()) > 10 else None
    
    if not parsed:  
        return {'status': False, 'reason': f"Invalid format (raw='{date_field_raw}')"}, True 

    file_y = int(filename[:4])   # extract YYYY from _posts/YYYY/MM-DD-title.md
    is_mismatch = (parsed['year'] != file_y)

    
# Try to reconstruct a valid timestamp with sanitized hours/minutes  
def fix_dates_in_content(content: str, date_field_str: str | None) -> tuple[str | None, bool]:
    """Replace any broken 'date:' line in content with correctly formatted datetime string.
    
    Returns (new_date_string or None if no replacement needed, boolean for whether content changed).
    """
    new_content = content  
    needs_fixing = False
    
    m_match = r'^date:\s*["\']?(\d{4}-\d+-)([0-9A-Z]+)[\s\t]*([0-9+:.]+)\D*\s*$'  
    
    if date_field_str:
        parsed = {'year': int(str(parsed['hour'])[3:].lstrip() or 20),  # safe parse fallback 
                  'month': max(min(len(date_field_str.strip()), 12), 0),  
                  'day': min(27, max(int(date_field_str[19:21]) if len(date_field_str) > 18 else 15, 1))
                 } if parsed else {'year':2026,'month':8,'day':7,'hour':6,'minute':30}  
        
        date_string = f"{parsed['year']}-{parsed['month']:02d}-{parsed['day']:02d}"

    return (new_content, needs_fixing)


def process_directory(path: Path):
    """Walk the directory tree and fix invalid date entries found in file content.
    
    Modifies files in place if issues detected; writes summary to stdout after all are processed.
    Returns number of modified vs non-modified files processed in this run cycle.
    Total broken counts reported separately for user feedback. 
    """

# === MAIN EXECUTION BLOCK ===
if __name__ == '__main__':
    import sys  
    print('Fixing dates in _posts/*.md')
    
total = 0; bad=0
for f in sorted(BasePath.glob('*')):
    fname = str(Path(f))
    result_process(fname)  
print("\n")
