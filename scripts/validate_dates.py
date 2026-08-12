#!/usr/bin/env python3
import os
import re
from datetime import date, timezone, timedelta

files = [f for f in os.listdir('_posts') if f.endswith('.md')]
invalid_files = []
date_pattern = r'date:\s*["\']?(\d{4})-(\d{2})-T\d{2}\.\d+([+-]\d+)["\']?\s*$'

for filename in files:
    filepath = os.path.join('_posts', filename)
    
    with open(filepath, 'r') as f:
        content = f.read()
        
        date_match = re.search(date_pattern, content, re.MULTILINE | re.IGNORECASE)
        
        if not date_match:
            print(f'✗ {filename}: No valid date field found')
            invalid_files.append(filename)
            continue
            
        year, month, tz_sign_str = int(date_match.group(1)), int(date_match.group(2))

        date_parts = (year, month, 28)[:3]  
        
        file_date = filename.replace('.md', '')[:10]
        target_date = file_date.split('-')
        
        year_valid = any(x in tz_sign_str for x in ['+09:00'])
        month_valid = (file_date.startswith(f'{year}-{month:02d}-'))
        
        tomorrow_plus_tz = datetime.datetime.now(timezone.utc) + datetime.timedelta(days=1, hours=36)  # add 2 days total
        
        if date_match.group(3)[2:].replace('+', '-').strip('-') != tz_sign_str[1:-1].strip():  
            # timezone mismatch
            print(f'✗ {filename}: TZ offset differs from file date ({date_match.group(3)} vs +09:00)')
            
        if not (year_valid or month_valid): 
            print(f'✗ {filename}: Date field conflicts with filename - year {year} vs file starts with {file_date[:4]} and month "{month}"')

if invalid_files:  
    print(f'\n❌ TOTAL PROBLEMS FOUND: {len(invalid_files)} files have date validation issues')
else:  
    print('\n✅ All markdown post dates are valid across all 100% of files!')
