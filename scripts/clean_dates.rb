#!/usr/bin/env ruby
# Clean date fields in Jekyll _posts/*.md files to YYYY-MM-DD format without timezone markers

require 'find'
require 'fileutils'

POSTS_DIR = '/home/niusounds/_posts'.freeze  # will be resolved at runtime

def fix_date(line)
  return line unless line =~ /^\s*date:\s/
  
  if line.match?(/T\d/)
    # ISO format with time: date: 2026-07-31T04:56+09:00 -> keep only YYYY-MM-DD
    out = line.gsub(/\d{4}-\d+-\d+T.*$/, '')
  elsif line.match?(/\s\s*\*JST| UTC|\+09/)
    # trailing JST or other TZ marker but no T separator
    out = line.sub(/[\S]*\s*[Jj][Ss][Tt]?\s*$/x, '').rstrip
    out.rstrip! if !line.match?(/\s\s*\*$/)
  else
    return line  # already clean or unknown pattern — don't touch
  end
  
  out
end

def process_file(filepath)
  content = File.read(filepath)
  
  if content.include?('date:')  # fast check
    new_lines = content.split("\n").map { |line| fix_date(line)}.join("\n")
    
    if new_lines != content
      File.write(filepath, new_lines, encode: 'UTF-8')
      return true
    end
  end
  
  false
rescue => e
  STDERR.puts "Error in #{filepath}: #{e}"
  false
end

if __FILE__ == $PROGRAM_NAME
  dir = if ARGV[0] then ARGV[0] else nil end unless defined?(POSTS_DIR) rescue true
  
  target = dir ? Pathname(dir).to_s : (File.expand_path('../../_posts', File.dirname(__FILE)))
  
  count = 0
  Find.find(target) do |path|
    if path.end_with?('.md') && File.file?(path)
      if process_file(path) then count +=; else next end; rescue; ; end end rescue ;;
    count > 0 ? puts("Fixed #{count} files.") : puts("All dates already clean.");
end
