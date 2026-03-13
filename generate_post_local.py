import json
import urllib.request
import urllib.error
from datetime import datetime
import re
import os
import sys

# 設定
API_URL = "http://localhost:1234/api/v1/chat"
MODEL = "google/gemma-3n-e4b"
SYSTEM_PROMPT = "あなたはプロの怪談師です。学校の怪談をテーマに、怖い話を創作して語ってください。なるべく長く文章を書いてください。文章の冒頭に短いタイトルを一行書き、その後に本文を続けてください。"
INPUT_TEXT = "今日の話"

def generate_story():
    payload = {
        "model": MODEL,
        "system_prompt": SYSTEM_PROMPT,
        "input": INPUT_TEXT
    }
    
    headers = {"Content-Type": "application/json"}
    req = urllib.request.Request(API_URL, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST")
    
    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            
            # レスポンス形式の推測（JSONパース）
            if "choices" in res_data:
                return res_data["choices"][0]["message"]["content"]
            elif "output" in res_data and isinstance(res_data["output"], list) and len(res_data["output"]) > 0:
                return res_data["output"][0]["content"]
            elif "content" in res_data:
                return res_data["content"]
            elif "response" in res_data:
                return res_data["response"]
            else:
                return str(res_data)
    except urllib.error.URLError as e:
        print(f"Error connecting to API: {e}")
        sys.exit(1)

def clean_content(content):
    # 文頭の全角スペースを削除
    content = content.replace("　", "")
    
    # 画像の後の改行を2つにする（ガイドライン準拠）
    content = re.sub(r'(!\[.*?\]\(.*?\))\n(?!\n)', r'\1\n\n', content)
    
    return content.strip()

def get_slug(title):
    # タイトルから英単語のスラッグを生成するために再度APIを呼び出す（オプション）
    # 面倒な場合は単に timestamp を返しても良い
    payload = {
        "model": MODEL,
        "system_prompt": "与えられた日本語のタイトルを元に、Jekyllのファイル名に使用する英語のスラッグ（小文字、英単語をハイフンで繋いだもの）のみを出力してください。余計な解説は不要です。例：七分早い時計 -> seven-minute-watch",
        "input": title
    }
    
    headers = {"Content-Type": "application/json"}
    req = urllib.request.Request(API_URL, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST")
    
    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            if "choices" in res_data:
                slug = res_data["choices"][0]["message"]["content"]
            elif "output" in res_data and isinstance(res_data["output"], list) and len(res_data["output"]) > 0:
                slug = res_data["output"][0]["content"]
            elif "content" in res_data:
                slug = res_data["content"]
            elif "response" in res_data:
                slug = res_data["response"]
            else:
                slug = "school-horror"
            
            # クリーニング（英数字とハイフン以外を除去）
            slug = slug.lower().strip()
            slug = re.sub(r'[^a-z0-0\-]', ' ', slug).strip().replace(' ', '-')
            slug = re.sub(r'-+', '-', slug)
            return slug
    except:
        return "school-horror-" + datetime.now().strftime("%H%M%S")

def parse_and_save(content):
    lines = content.split("\n")
    title = "無題の怪談"
    body = content
    
    if lines:
        # 最初の数行からタイトルを探す
        for i in range(min(5, len(lines))):
            line = lines[i].strip()
            if not line: continue
            
            cleaned = re.sub(r'^[#*【(（\s]*|[#*】)）\s]*$', '', line)
            cleaned = re.sub(r'^(タイトル|Title)[:：]\s*', '', cleaned)
            
            if 2 <= len(cleaned) < 40:
                title = cleaned
                body = "\n".join(lines[i+1:]).strip()
                break
    
    # 今日の日付
    today = datetime.now().strftime("%Y-%m-%d")
    
    print(f"Generating slug for title: {title}...")
    slug = get_slug(title)
    
    filename = f"{today}-{slug}.md"
    filepath = os.path.join("_posts", filename)
    
    # クレジット
    credit = f"\n\n---\nWritten by {MODEL}"
    
    # フロントマターと本文の組み立て
    post_data = f"""---
title: {title}
---

{body}{credit}
"""
    
    # _posts ディレクトリの確認
    if not os.path.exists("_posts"):
        os.makedirs("_posts")
        
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(post_data)
    
    return filepath

if __name__ == "__main__":
    print(f"Generating story using {MODEL}...")
    raw_content = generate_story()
    cleaned_content = clean_content(raw_content)
    path = parse_and_save(cleaned_content)
    print(f"Success! Saved to {path}")
