---
name: horror_short_story_writing
description: Guidelines and tech patterns for generating Japanese scary short stories — horror, mystery, and hitokowa — and their accompanying illustrations for the Kowai Site blog.
---

# Horror Short Story Writing Guide

This skill defines the guidelines for writing Japanese scary short stories for the `kowai-site` blog, as well as how to generate and implement the corresponding illustrations.

The blog covers a wide range of scary stories beyond just supernatural horror (怪異・お化け). Stories can also be **mysteries** (ミステリー — unsolvable puzzles, unexplained disappearances, revelations that are worse than the unknown) or **hitokowa** (ヒトコワ — human horror, where the source of dread is human malice, obsession, or madness rather than the supernatural).

## 1. Writing Style and Narrative Tone

*   **Perspective:** Use a first-person narrative (mostly 「私」 or 「僕」) to increase immersion and make the terror feel personal to the reader.
*   **Setting:** Start setting the scene in mundane, relatable, everyday Japanese situations (e.g., checking a smartphone on a bed, riding an empty late-night train, looking in a mirror before school).
*   **Pacing:** Start slow and ordinary. Introduce a slight, almost unnoticeable sense of wrongness (違和感). Gradually escalate the tension until the climax. Avoid relying entirely on jump scares; focus on psychological dread, surrealism, and the uncanny valley (気味の悪さ).
*   **Formatting:** Use frequent paragraph breaks, especially one-sentence paragraphs, to control reading rhythm and build tension.
*   **Endings:** Use open-ended, lingering, or chilling twists. Often, the protagonist is trapped, replaced, or left in a deeply unsettling permanent state. Do not resolve the horror happily.

### Diversity Guardrails (Strong Mode)

Before drafting, check the latest three posts in `_posts/` and avoid repeating the same combination of:
*   **Genre core:** supernatural / mystery / hitokowa.
*   **Structure:** linear timeline, reverse timeline, testimony transcript, investigation log, fragmented chapters.
*   **Narrator mode:** standard first-person, unreliable narrator, multi-witness first-person, third-party records.

If the genre overlaps with recent posts, force at least two changes from this list:
*   Change the narrative structure.
*   Change the narrator mode.
*   Change the horror engine (what is terrifying: motive, mechanism, consequence).

Avoid these repetition patterns in consecutive posts:
*   Same opening beat (e.g., "late-night commute and a sudden anomaly").
*   Same ending class (replacement reveal, endless loop reveal, narrator disappearance reveal).

Prioritize underused themes listed in AGENTS.md, with extra preference for mystery-forward stories.

### Genre-Specific Tone Adjustments

#### For Mystery Stories (ミステリー)
*   Open with a clear, concrete mystery — a disappearance, an inexplicable death, a strange object left behind.
*   Scatter clues and partial explanations throughout; let the reader try to piece things together alongside the narrator.
*   The resolution should be either "no explanation is possible" (which is terrifying in itself) or "the explanation is even more horrifying than the mystery."
*   An **unreliable narrator** — one whose perception or memory may be compromised — is a powerful technique. The reader should wonder: is the narrator telling the truth? Are they sane?

##### Mystery Composition Templates
Use one of these templates and rotate them across posts:
1.  **Early question template:** Mystery in paragraph 1-2, clue layering in middle, reveal that deepens uncertainty.
2.  **Reverse-fragment template:** Start from aftermath, then reconstruct events via logs/records.
3.  **Dual-testimony template:** Two first-person accounts that contradict each other; terror comes from the gap.

#### For Hitokowa Stories (ヒトコワ — Human Horror)
*   The source of fear must be entirely human: a stalker, a controlling partner, a neighbor with a secret, a cult, or a workplace that subtly destroys a person.
*   Begin with a character who seems merely **odd** or **a little too friendly**. Slowly peel back the facade to reveal something deeply wrong.
*   Crucially maintain realism — no supernatural elements. The horror lands hardest when readers think "this could actually happen."
*   Portray the protagonist's **isolation**: people they turn to for help don't believe them, or are themselves complicit.
*   The ending should leave the reader with a sense that there is no escape, no rescue, and no justice.

## 2. Advanced Horror Techniques (恐怖を深める高度なテクニック)

To write "scarier" stories, move beyond simple "monsters" and focus on psychological and physiological triggers.

### 1. Sensory Infiltration (五感への侵食)
Don't just describe what the character *sees*. Focus on:
- **Smell**: The sweet, metallic scent of iron (blood), the smell of wet earth in high summer, or the faint, cloying odor of old cigarettes where no one has smoked.
- **Sound**: High-pitched ringing, the "wet" sound of something moving in the dark, or a voice that sounds slightly synthesized or distorted.
- **Touch**: The feeling of a spiderweb on the face, the sensation of hot breath on the neck, or skin that feels unnaturally cold or parchment-dry.

### 2. The Abnormality of the Mundane (日常の不気味なズレ)
- **Lack of Response**: A character who fails to react to an obvious stimulus (e.g., a car horn, a loud bang) creates a deep sense of wrongness.
- **Repetitive Behavior**: A person performing a trivial task (e.g., folding a towel) with mechanical, unceasing precision.
- **Unnatural Stillness**: A figure seen in the distance who remains perfectly still for hours, even as the environment around them changes.

### 3. Cognitive Distortion and Void (認知の歪みと空白)
- **The "Unseen" Rule**: The horror of discovering that a rule has always existed, and that the protagonist has been unknowingly breaking it.
- **Missing Information**: A photograph where one person's face is consistently blurred, or a diary with pages torn out at exactly the same date every year.
- **Logical Failures**: Using "dream logic" where the geometry of a room changes subtly, or a conversation loops in a way that feels intentional but inexplicable.

### 4. Meta-Terror: Leaking Reality (メタ的な侵食)
- **Direct Address**: A hint that the story the reader is currently reading is itself a trigger or a vessel for the curse.
- **Residual Effects**: Ending with a physical sensation that the reader might currently be feeling (e.g., "Why is it so cold in the room you're in?").

## 3. File Structure and Metadata

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

1.  **Understand the Prompt:** Identify the core scary theme requested by the user. Determine which broad category fits best:
    *   **怪異・超常ホラー** — ghosts, curses, yokai, parallel dimensions, uncanny technology.
    *   **ミステリー** — unexplained disappearances, strange objects, cryptic messages, revelations worse than the unknown.
    *   **ヒトコワ** — stalkers, manipulative people, cults, workplace terror, human cruelty.
    If no theme is given, invent a compelling everyday scenario and choose the category that would make it most unsettling.
2.  **Run Diversity Preflight:** Check the last three posts and decide genre, structure, and narrator mode that do not repeat recent combinations. Record a short rationale before writing.
3.  **Draft the Narrative:** Write the story in Japanese following the tone guidelines. Apply the genre-specific adjustments from Section 1 as needed.
4.  **Plan Illustrations:** Identify 2-3 key moments that would benefit from an illustration (e.g., the setup, the introduction of the anomaly, the horrifying climax). For hitokowa stories, illustrations should feel more grounded and photorealistic (or deliberately mundane-yet-wrong) rather than overtly supernatural.
5.  **Generate/Create Assets:** Create the illustrations and save them to `assets/images/`. Use a descriptive kebab-case filename that matches or relates to the post slug (e.g., `stalker-window.svg` for a hitokowa post about being watched). Keep all images flat in `assets/images/`; do not create subdirectories.
6.  **Compile the Post:** Write the markdown file to `_posts/` with the narrative text, frontmatter, and embedded illustrations with captions.
7.  **Add Credit:** At the very end of the post, add a credit line in the following format:
    ```markdown
    ---
    Written by {Your model name}
    ```
    - example: `Written by GitHub Copilot (Gemini 3 Flash (Preview))`
8.  **Self-Audit Before Finish:** Confirm all checks below are satisfied:
    *   Genre/structure/narrator combination is not a recent duplicate.
    *   The opening beat differs from recent posts.
    *   The ending class differs from recent posts.
    *   Mystery stories present a clear question early and escalate with clues.
9.  **Verify:** Validate that the post builds correctly via Jekyll.
