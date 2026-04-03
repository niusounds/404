import json
import urllib.request
import urllib.error
from datetime import datetime
import re
import os
import sys

# 設定
API_BASE_URL = "http://localhost:1234/v1"
API_URL = f"{API_BASE_URL}/chat/completions"
SYSTEM_PROMPT = "あなたは怪談系YouTuberです。視聴者から送られてきた様々なジャンルの投稿怪談を読み上げるスタイルで文章を書いてください。テーマは様々。怖ければなんでもいいです。日常生活で起きた不可解なできごと、心霊現象、都市伝説、学校の怪談、職場の怪談、家族の怪談などジャンルは問いません。話の内容は怖ければ怖いほど良いですが、あまりに過激な内容は避けてください。口語的でわかりやすい表現を心がけてください。なるべく長い文章を書いて。"
INPUT_TEXT = "今日の話"

def get_current_model():
    """現在ロードされているモデルを取得する"""
    try:
        req = urllib.request.Request(f"{API_BASE_URL}/models")
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            if "data" in res_data and len(res_data["data"]) > 0:
                # 最初のモデルを返す
                return res_data["data"][0]["id"]
    except Exception as e:
        print(f"Error fetching models: {e}")
    return "google/gemma-3n-e4b" # デフォルト

def generate_story():
    model = get_current_model()
    print(f"Using model for story: {model}")
    
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": INPUT_TEXT}
        ]
    }
    
    headers = {"Content-Type": "application/json"}
    req = urllib.request.Request(API_URL, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST")
    
    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            if "choices" in res_data:
                return res_data["choices"][0]["message"]["content"], model
            elif "output" in res_data and isinstance(res_data["output"], list) and len(res_data["output"]) > 0:
                return res_data["output"][0]["content"], model
            elif "content" in res_data:
                return res_data["content"], model
            elif "response" in res_data:
                return res_data["response"], model
            else:
                return str(res_data), model
    except urllib.error.URLError as e:
        print(f"Error connecting to API: {e}")
        sys.exit(1)

def get_title_from_story(story_content):
    """本文からタイトルを生成する"""
    target_model = "google/gemma-3n-e4b"
    print(f"Generating title using {target_model}...")
    payload = {
        "model": target_model,
        "messages": [
            {"role": "system", "content": "与えられた怪談の本文を読み、その話にふさわしい、読者の興味を引く短いタイトルを一つだけ考えて出力してください。余計な解説や装飾は不要です。"},
            {"role": "user", "content": story_content}
        ]
    }
    
    headers = {"Content-Type": "application/json"}
    req = urllib.request.Request(API_URL, data=json.dumps(payload).encode("utf-8"), headers=headers, method="POST")
    
    try:
        with urllib.request.urlopen(req) as response:
            res_data = json.loads(response.read().decode("utf-8"))
            if "choices" in res_data:
                title = res_data["choices"][0]["message"]["content"]
            elif "content" in res_data:
                title = res_data["content"]
            else:
                title = "無題の怪談"
            
            # クリーニング（改行や引用符の除去）
            title = title.strip().replace("\n", "").replace('"', '').replace('「', '').replace('」', '')
            return title
    except:
        return "無題の怪談"

def clean_content(content):
    # <think>...</think> タグとその内容を削除
    content = re.sub(r'<think>.*?</think>', '', content, flags=re.DOTALL)
    
    # 文頭の全角スペースを削除
    content = content.replace("　", "")
    
    # 画像の後の改行を2つにする（ガイドライン準拠）
    content = re.sub(r'(!\[.*?\]\(.*?\))\n(?!\n)', r'\1\n\n', content)
    
    return content.strip()

def get_slug(title):
    # タイトルから英単語のスラッグを生成するために再度APIを呼び出す
    # スラッグ生成は精度の高い特定のモデルで実行する
    target_model = "google/gemma-3n-e4b"
    payload = {
        "model": target_model,
        "messages": [
            {"role": "system", "content": "与えられた日本語のタイトルを元に、Jekyllのファイル名に使用する英語のスラッグ（小文字、英単語をハイフンで繋いだもの）のみを出力してください。余計な解説は不要です。例：七分早い時計 -> seven-minute-watch"},
            {"role": "user", "content": title}
        ]
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

def parse_and_save(content, model):
    # 本文からタイトルを生成する
    title = get_title_from_story(content)
    print(f"Generated title: {title}")
    
    body = content.strip()
    
    # 今日の日付
    today = datetime.now().strftime("%Y-%m-%d")
    
    print(f"Generating slug for title: {title}...")
    slug = get_slug(title)
    
    filename = f"{today}-{slug}.md"
    filepath = os.path.join("_posts", filename)
    
    # クレジット
    credit = f"\n\n---\nWritten by {model}"
    
    # プロンプト情報の追記
    prompt_info = f"""

system prompt:
```
{SYSTEM_PROMPT}
```

user prompt:
```
{INPUT_TEXT}
```
"""

    # フロントマターと本文の組み立て
    post_data = f"""---
title: {title}
---

{body}{credit}{prompt_info}
"""
    
    # _posts ディレクトリの確認
    if not os.path.exists("_posts"):
        os.makedirs("_posts")
        
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(post_data)
    
    return filepath

if __name__ == "__main__":
    print("Generating story...")
    raw_content, story_model = generate_story()
    
    # 最初に <think> タグなどを除去してクリーンにする
    cleaned = clean_content(raw_content)
    
    path = parse_and_save(cleaned, story_model)
    print(f"Success! Saved to {path}")
