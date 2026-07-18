import os
import json
import re
import datetime
from typing import Dict, Any

# Placeholder for LLM interaction. 
# In a real deployment, this would call OpenAI, Anthropic, or a local model via Ollama/vLLM.
# For the sake of this implementation, we assume an environment where an OpenAI-compatible 
# client is available and configured with OPENAI_API_KEY.

try:
    from openai import OpenAI
    client = OpenAI()
except ImportError:
    client = None
    print("Warning: 'openai' library not found. LLM calls will fail unless installed.")

class HorrorPipeline:
    def __init__(self, base_path: str):
        self.base_path = base_path
        self.prompts_path = os.path.join(base_path, "prompts")
        self.output_dir = os.path.join(base_path, "output")
        os.makedirs(self.output_dir, exist_ok=True)

    def load_prompt(self, name: str) -> str:
        with open(os.path.join(self.prompts_path, f"{name}.md"), 'r', encoding='utf-8') as f:
            return f.read()

    def call_llm(self, prompt: str, response_format: str = "text") -> str:
        """Calls the LLM with a given prompt."""
        if not client:
            raise RuntimeError("OpenAI client not initialized. Please install 'openai' and set OPENAI_API_KEY.")
        
        messages = [{"role": "system", "content": "You are an expert horror writer engine."},
                     {"role": "user", "content": prompt}]
        
        response = client.chat.completions.create(
            model="gpt-4o", # Or any preferred model
            messages=messages,
            response_format={"type": "json_object"} if response_format == "json" else {"type": "text"}
        )
        return response.choices[0].message.content

    def _extract_json(self, text: str) -> Dict[str, Any]:
        """Extracts JSON from a potential markdown code block."""
        match = re.search(r'```json\n(.*?)```', text, re.DOTALL)
        if match:
            return json.loads(match.group(1))
        try:
            return json.loads(text)
        except json.JSONDecodeError:
            # Fallback to finding the first '{' and last '}'
            start = text.find('{')
            end = text.rfind('}')
            if start != -1 and end != -1:
                return json.loads(text[start:end+1])
            raise ValueError("Could not parse JSON from LLM response")

    def run(self, seed_idea: str = "The unknown"):
        print(f"--- Starting Horror Construction Pipeline ---")
        print(f"Seed Idea: {seed_idea}")

        # STEP 1: Archetype Engine
        print("[1/4] Running Archetype Engine...")
        archetype_prompt = self.load_prompt("archetype") + f"\n\nSeed/Context: {seed_idea}"
        archetype_raw = self.call_llm(archetype_prompt, response_format="json")
        archetype_data = self._extract_json(archetype_raw)
        print(f"  Targeting: {archetype_data['vulnerability']} ({archetype_data['target_emotion']})")

        # STEP 2: Sensory Texture Generator
        print("[2/4] Running Sensory Texture Generator...")
        sensory_prompt = self.load_prompt("sensory") + f"\n\nContext: {json.dumps(archetype_data)}"
        sensory_raw = self.call_llm(sensory_prompt, response_format="json")
        sensory_data = self._extract_json(sensory_raw)
        print(f"  Sensory layers prepared.")

        # STEP 3: Plot Architect
        print("[3/4] Running Plot Architect...")
        architect_prompt = self.dumps_context(self.load_prompt("architect"), archetype_data, sensory_data)
        architect_raw = self.call_llm(architect_prompt, response_format="json")
        architect_data = self._extract_json(architect_raw)
        print(f"  Plot structure constructed.")

        # STEP 4: Synthesis Engine
        print("[4/4] Running Synthesis Engine...")
        synthesis_prompt = self.dumps_context(self.load_prompt("synthesis"), archetype_data, sensory_data, architect_data)
        story_md = self.call_llm(synthesis_prompt, response_format="text")

        # Finalizing Output
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"horror_{timestamp}.md"
        filepath = os.path.join(self.output_dir, filename)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(story_md)
        
        print(f"--- Pipeline Complete! ---")
        print(f"Story saved to: {filepath}")
        return filepath

    def dumps_context(self, prompt_template: str, *data_layers: Dict[str, Any]) -> str:
        """Combats the 'lost in context' problem by cleanly injecting all layers."""
        context_str = "\n\n## Input Contexts\n"
        for i, data in enumerate(data_layers):
            context_str += f"\n### Layer {i+1}\n{json.dumps(data, indent=2)}\n"
        return prompt_template + context_str

if __name__ == "__main__":
    import sys
    pipeline = HorrorPipeline(os.path.expanduser("~/404/horror_system"))
    seed = sys.argv[1] if len(sys.argv) > 1 else "A disturbing discovery in an old attic"
    try:
        pipeline.run(seed)
    except Exception as e:
        print(f"Pipeline Failed: {e}")
