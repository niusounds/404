---
name: Horror Short Story Writing
description: Guidelines and tech patterns for generating Japanese horror short stories and their accompanying illustrations for the Kowai Site blog.
---

# Horror Short Story Writing Guide

This skill defines the guidelines for writing Japanese horror short stories for the `kowai-site` blog, as well as how to generate and implement the corresponding illustrations.

## 1. Writing Style and Narrative Tone

*   **Perspective:** Use a first-person narrative (mostly 「私」 or 「僕」) to increase immersion and make the terror feel personal to the reader.
*   **Setting:** Start setting the scene in mundane, relatable, everyday Japanese situations (e.g., checking a smartphone on a bed, riding an empty late-night train, looking in a mirror before school). 
*   **Pacing:** Start slow and ordinary. Introduce a slight, almost unnoticeable sense of wrongness (違和感). Gradually escalate the tension until the climax. Avoid relying entirely on jump scares; focus on psychological dread, surrealism, and the uncanny valley (気味の悪さ).
*   **Formatting:** Use frequent paragraph breaks, especially one-sentence paragraphs, to control reading rhythm and build tension.
*   **Endings:** Use open-ended, lingering, or chilling twists. Often, the protagonist is trapped, replaced, or left in a deeply unsettling permanent state. Do not resolve the horror happily.

## 2. File Structure and Metadata

*   Files should be placed in the `_posts/` directory.
*   The filename format must be: `YYYY-MM-DD-kebab-case-title.md`.
*   Include YAML frontmatter with the title:
    ```yaml
    ---
    title: 日本語のホラータイトル
    ---
    ```

## 3. Illustrations (Images / SVGs)

Illustrations are a core part of the reading experience. They should be interspersed throughout the story to visually represent key terrifying moments.

### Implementation Methods
You have two main methods for creating illustrations:
1.  **AI Image Generation (e.g., Banana Pro / Gemini Pro Vision):** If image generation capabilities are active and you have quota, use your `generate_image` tool with prompts like *"A high-quality, photorealistic cinematic shot of [scene], extremely terrifying, horror movie aesthetic, hyper-realistic, dark lighting"*. Save the generated images to `assets/images/`.
2.  **Custom SVG Coding (Fallback/Alternative):** If generative image API constraints occur, or if the user requests it, hand-code SVG files and save them to `assets/images/`.

### SVG Design Guidelines for Horror
When writing SVGs manually, keep them abstract, atmospheric, and unsettling:
*   **Color Palette:** Use very dark backgrounds (`#000000`, `#111111`, `#1a1a2e`) with muted or high-contrast highlights (e.g., dark crimson for blood/screens, sickly yellow/green, or stark white).
*   **Animations:** Use `<animate>` or `<animateTransform>` for subtle, disturbing movements:
    *   Flickering lights (changing `opacity` from 0.8 to 0.1 sporadically).
    *   Slowly creeping shadows or reaching hands (using `animateTransform` with `translate` over a long duration like `4s` or `5s`).
    *   Throbbing or breathing effects.
*   **Subject Matter:** Silhouettes of figures, distorted text/signs, grasping hands, glaring eyes, or cracked screens.

### Inserting Illustrations into the Post

Use standard Markdown image syntax, followed by a bold or italicized caption on the next line to add flavor to the image.

**Example:**
```markdown
暗闇の奥から、無数の白い手が、車両に向かって伸びてくるのが見えた。

![無数の手](/assets/images/train-hands.svg)

*手はドアの少し手前まで迫っていた*
```

## 4. Typical Workflow for a New Post Request

1.  **Understand the Prompt:** Identify the core horror theme requested by the user. If none is given, invent a compelling everyday scenario that turns horrifying.
2.  **Draft the Narrative:** Write the story in Japanese following the tone guidelines.
3.  **Plan Illustrations:** Identify 2-3 key moments that would benefit from an illustration (e.g., the setup, the introduction of the anomaly, the horrifying climax).
4.  **Generate/Create Assets:** Create the illustrations and save them to `x:\kowai-site\assets\images\`.
5.  **Compile the Post:** Write the markdown file to `_posts/` with the narrative text, frontmatter, and embedded illustrations with captions.
6.  **Add Credit:** At the very end of the post, add a credit line in the following format:
    ```markdown
    ---
    Written by {Your model name}
    ```
    - example: `Written by GitHub Copilot (Gemini 3 Flash (Preview))`
7.  **Verify:** Validate that the post builds correctly via Jekyll.
