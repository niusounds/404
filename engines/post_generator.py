import requests
import os
import re
from datetime import date

# --- Configuration ---
OLLAMA_URL = "http://localhost:11404/api/generate" # Should be the actual Ollama port
MODEL_NAME = "gemma4"

class PostGeneratorEngine:
    def __init__(self, model_name: str, ollama_url: str):
        self.model_name = model_name
        self.ollama_url = ollama_url

    def generate_story(self, theme: str) -> str:
        """Generates a horror story based on a given theme."""
        print(f"👻 Generating story for theme: {theme}")

        prompt = (
            f"あなたはプロの怪談作家です。テーマは「{theme}」です。"
            "背筋が凍るような、不気ryptで、日常の裏側に潜む恐怖を描いてください。\n"
            "必ずMarkdown形式で出力し、以下の構造を厳守してください。\n"
            "```\n"
            "---\n"
            "title: タイトル\n"
            "---\n"
            "本文...\n"
            "---\n"
            f"Written by {self.model_name}\n"
            "```\n"
            "1. 導入→展開→結末の構成にすること。\n"
            "2. 余計な前置きは一切不要です。Markdown本文のみを生成してください。"
        )

        payload = {
            "model": self.model_name,
            "prompt": prompt,
            "stream": False,
            "options": {"temperature": 0.8}
        }

        try:
            response = requests.post(self.ollama_url, json=payload)
            response.raise_for_status()
            return response.json().get("response", "")
        except Exception as e:
            return f"Error: {e}"

    def save_post(self, content: str, posts_dir: str):
        """Parses title and saves the content to a file."""
        today_str = date.today().strftime('%Y-%m-%d')

        # Extract title from front matter
        title_match = re.search(r'title:\s*(.*)', content)
        title = title_match.group(1).strip() if title_match else "mystery_story"

        # Clean title for filename
        safe_title = re.sub(r'[<>:"/\\|?*]', '', title)
        safe_title = "".join(c if c.isalnum() or c in ('-', '_') else '_' for c in safe_title).strip('_')

        filename = f"{today_str}-{safe_title}.md"
        output_path = os.path.join(posts_dir, filename)

        os.makedirs(posts_dir, exist_ok=True)
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(content)

        return output_path
