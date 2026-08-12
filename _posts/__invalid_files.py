#!/usr/bin/env python3
import os
import re
from datetime import datetime, timezone, timedelta

files = [f for f in os.listdir('_posts') if f.endswith('.md')]
invalid_files = []
broken_count = 0  

date_pattern_invalid = r'date:\s*[\"]?(\d{4}-\d+-T\d+):' 

for filename in files:
    filepath = os.path.join('
