import os
import subprocess
from datetime import datetime
import requests
import json
import sys

# --- Configuration ---
sys.path.append(os.path.join(os.path.dirname(__file__), 'engines'))
try:
    from post_generator import PostGeneratorEngine
except ImportError:
    print("Error: Could not import PostGeneratorEngine. Ensure engines/post_generator.py exists.")
    sys.exit(1)

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL_NAME = "gemma4"
POSTS_DIR = "_posts"
GIT_REPO_DIR = "."

class AHEOrchestrator:
    def __init__(self):
        self.model_name = MODEL_NAME
        self.ollama_url = OLLAMA_URL
        self.posts_dir = POSTS_DIR
        self.generator = PostGeneratorEngine(self.model_name, self.ollama_url)

    def log(self, message: str):
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{timestamp}] [AHE-Orchestrator] {message}")

    def get_existing_posts_context(self) -> str:
        """Reads existing posts to provide context for the LLM."""
        self.log("Reading existing posts for context...")
        context = ""
        if not os.path.exists(self.posts_dir):
            return "No existing posts found."

        files = sorted(os.listdir(self.posts_dir), reverse=
                       True)[:5]  # Get the 5 most recent posts

        for filename in files:
            file_path = os.path.join(self.posts_dir, filename)
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    # We only take a snippet to avoid blowing up the prompt
                    context += f"\n--- Content from {filename} ---\n{content[:500]}...\n"
            except Exception as e:
                self.log(f"Error reading {filename}: {e}")

        return context if context else "No context available."

    def ask_ollama_for_next_task(self, context: str) -> str:
        """Asks the local LLM to decide what the next task should be."""
        self.log("Asking Ollama to decide the next task...")

        prompt = f"""
        You are the brain of the Autonomous Horror Engine (AHE).
        Your goal is to maintain and expand a horror-themed Jekyll website.

        Here is the context of the existing posts:
        {context}

        Based on the existing posts, decide what the next horror story theme should be.
        The output MUST be a single, concise theme or idea in Japanese.
        Do not add any other text, only the theme.

        Example output:
        学校の放課後の教室に潜む、名前のない影
        """

        payload = {
            "model": self.model_name,
            "prompt": prompt,
            "stream": False
        }

        try:
            response = requests.post(self.ollama_url, json=payload)
            response.raise_for_status()
            return response.json().get("response", "").strip()
        except Exception as e:
            self.log(f"Error asking Ollama: {e}")
            return "Unknown horror theme"

    def run_task_post_generation(self, theme: str):
        self.log(f"Executing task: Generate post about '{theme}'")
        try:
            content = self.generator.generate_story(theme)
            if "Error:" in content:
                self.log(f"Hyper-parameter configuration failed: {content}")
                return

            output_path = self.generator.save_post(content, self.posts_dir)
            self.log(f"Successfully created: {output_path}")

            # Automate Git
            self.commit_changes(f"AHE: Automated horror post generation - {theme}")
        except Exception as e:
            self.log(f"Error during task execution: {e}")

    def commit_changes(self, message: str):
        self.log(f"Committing changes: {message}")
        try:
            subprocess.run(["git", "add", "."], check=True)
            subprocess.run(["git", "commit", "-m", message], check=True)
            self.log("Changes committed successfully.")
        except subprocess.CalledProcessError as e:
            self.log(f"Git error: {e}")
        except Exception as e:
            self.log(f"Error during commit: {e}")

    def run(self):
        self.log("Starting Autonomous Horror Engine...")
        context = self.get_existing_posts_context()
        next_theme = self.ask_ollama_for_next_task(context)
        self.log(f"Decided next theme: {next_theme}")
        self.run_task_post_generation(next_theme)
        self.log("Cycle completed.")

if __name__ == "__main__":
    orchestrator = AHEOrchestrator()
    orchestrator.run()
