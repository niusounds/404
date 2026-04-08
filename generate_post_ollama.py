import requests
from datetime import date
import re
import os
import json

# --- 設定 ---
OLLAMA_URL = "http://localhost:11434/api/generate" # ローカルのOllama APIエンドポイント
MODEL_NAME = "gemma4" # 使用するモデル名（適宜変更してください）

def generate_kidan_story(prompt: str, max_tokens: int = 2000) -> str:
    """
    Ollama APIを呼び出し、ストリーミング形式で怪談のテキストを収集します。
    (★最終修正版：ストリーミング処理対応)
    """
    print("👻 Ollamaから怪談の生成をリクエスト中...（ストリーミング処理）")
    
    payload = {
        "model": MODEL_NAME,
        "prompt": prompt,
        "options": {
            "temperature": 0.8,
            "num_predict": max_tokens
        }
    }
    
    # ストリーミング処理のために stream=True を渡すのが重要
    try:
        response = requests.post(OLLAMA_URL, json=payload, stream=True)
        response.raise_for_status()

        full_text = ""
        
        # ストリーミング処理: 届いたチャンクを一つずつ処理する
        for line in response.iter_lines():
            if line:
                try:
                    # 1. 届いた行（チャンク）をJSONとして解析
                    data = json.loads(line)
                    print(f"[debug]: {data}")
                    
                    # 2. チャンクデータからレスポンステキストを取得し、結合
                    response_chunk = data.get("response", "")
                    if response_chunk:
                        full_text += response_chunk
                    
                    # 3. 処理が完了したかチェック
                    if data.get("done"):
                        break # 完了したらループを抜ける
                except json.JSONDecodeError:
                    # ここでJSON解析エラーが起きても処理を続行する
                    print(f"\n[警告] JSON解析に失敗した行をスキップしました: {line.decode('utf-8')}")
                except Exception as e:
                    # その他の予期せぬエラー
                    return f"【内部エラー】ストリーミング処理中に予期せぬエラーが発生しました: {e}"

        # 最後の返り値が空（何らかのエラーでテキストが取得できなかった）の場合の処理
        if not full_text:
             return "【致命的エラー】Ollamaからの応答が空でした。モデル名やサービスの状態を確認してください。"
             
        return full_text
        
    except requests.exceptions.ConnectionError:
        return "【致命的エラー】Ollamaサービスが起動していないか、アドレスが間違っています。ご確認ください。"
    except requests.exceptions.HTTPError as e:
        return f"【HTTPエラー】APIリクエストに失敗しました。ステータスコード: {response.status_code}。原因: {e}"
    except requests.exceptions.RequestException as e:
        return f"【致命的エラー】API呼び出しに失敗しました: {e}"

def extract_title_and_save(full_text: str):
    """
    生成された全文からタイトルを推測し、Markdownファイルとして保存します。
    （今回は、Markdownの最初の見出し（#）をタイトルとして利用することを想定します）
    """
    today_str = date.today().strftime('%Y-%m-%d')
    title = "untitled"
    
    # 1. タイトルの抽出（最初のMarkdownの見出し # を利用）
    # Markdownのパターンから最初の # を見つける
    title_match = re.search(r'^#\s*(.*)$', full_text, re.MULTILINE)
    
    if title_match:
        raw_title = title_match.group(1).strip()
        # ファイル名に使用できない文字をクリーンアップ（タイトルを安全な変数に変換）
        title = re.sub(r'[<>:"/\\|?*]', '', raw_title) 
        
        # タイトルをファイル名の形式に調整（日本語がそのまま入ると文字化け対策としてエンコーディングを考慮）
        safe_title = "".join(c if c.isalnum() or c in ('-', '_') else '_' for c in title).strip('_')
    else:
        # 見出しがない場合は、最初の数単語をタイトルとして使うなど、フォールバック処理が必要
        safe_title = "mystery_story"
    
    # 2. ファイル名とパスの決定
    filename = f"{today_str}-{safe_title}.md"
    output_path = os.path.join("_posts", filename)

    # 3. ファイルの書き込み
    try:
        # ディレクトリが存在しなければ作成
        os.makedirs(os.path.dirname(output_path), exist_ok=True)
        
        # ファイル全体を書き込む（Markdown形式を保つ）
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(full_text)
        
        print("\n============================================")
        print(f"✨ 成功！物語を以下のファイルに保存しました:")
        print(f"   ➡️ {output_path}")
        print("============================================\n")

    except Exception as e:
        print(f"\n❌ ファイル保存中にエラーが発生しました: {e}")


def main_script_runner():
    system_prompt = (
        "あなたはプロの怪談作家であり、特に『学校』を舞台とした怪談の創作に長けています。"
        "テーマは「学校の怪談」に固定し、日常の風景の中に潜む背筋が凍るような恐怖を描いてください。"
        "必ずMarkdown形式で出力し、以下の構造を厳守してください。\n"
        "```\n"
        "---\n"
        "title: タイトル\n"
        "---\n"
        "本文...\n"
        "---\n"
        f"Written by {MODEL_NAME}\n"
        "```\n"
        "1. 導入（平和な日常や学校の描写）→ 展開（異常な出来事や恐怖の体験）→ 結末（戦慄のオチ）を持つ、物語を記述してください。\n"
        "2. 物語に「制服」「廊下」「部活動」「忘れ物」「購買」など、学校的な要素を複数組み込んでください。\n"
        "3. 装飾や余計な前置きは一切不要です。本文のみを生成してください。"
    )
    full_text = generate_kidan_story(system_prompt)
    if full_text.startswith("【エラー】"):
        print(full_text)
        return

    extract_title_and_save(full_text)

if __name__ == "__main__":
    main_script_runner()
