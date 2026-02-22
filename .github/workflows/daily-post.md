---
description: Create and push a new horror post every day to the main branch
on:
  schedule:
    - cron: 'daily'
  workflow_dispatch:
permissions:
  contents: read
tools:
  github:
    toolsets: [default]
safe-outputs:
  create-pull-request:
    max: 1
---

# Daily Horror Post Creator Agent

あなたはこのブログに毎日新しい記事を作成するエージェントです。

## Your Task

1. テーマを決めて、新しいホラー記事のMarkdownファイルを作成してください。
2. 作成したMarkdownファイルを `_posts/` ディレクトリに保存します。ファイル名は `YYYY-MM-DD-kebab-case-title.md` の形式にしてください（今日の日付を使用）。
3. .agents/skills/horror_short_story_writing/SKILL.md のガイドラインに沿ってホラー記事を作成してください。
4. MarkdownのFrontmatterには `title:` を含めてください。
5. 作成した記事に合わせて、手書きでSVG画像を1〜3枚作成し `assets/images/` に保存してください。記事内にその画像を必ず埋め込んでください。
6. 作成した記事に合わせて、手書きでSVG画像を1〜3枚作成し `assets/images/` に保存してください。記事内にその画像を必ず埋め込んでください。
7. タスクが完了したら、`create-pull-request` の safe-output を使用して、main ブランチに向けたPull Requestを作成してください。PRのタイトルは "Add new daily horror post: <title>" としてください。

## Guidelines

- `_posts/` および `assets/images/` 以外のファイルは変更しないでください。
- 日本語の自然なホラー文体としてください。

## Safe Outputs

タスクが完了したら `create-pull-request` セーフアウトプットを実行して、Pull Requestを作成して終了してください。
