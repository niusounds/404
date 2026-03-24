---
on:
  schedule: daily
permissions:
      contents: read
      issues: read
      pull-requests: read
engine: copilot
network:
  allowed:
    - defaults
    - python
    - node
    - go
    - java
tools:
  github:
    toolsets: [default]
safe-outputs:
  create-pull-request:
    auto-merge: true
---

# write-post

新しい記事を1本作成してください。以下を必須要件として守ってください。

## 必須手順
1. `_posts/` の直近3本を確認し、各記事の「ジャンル」「構成」「語り手」を短く整理する。
2. 新作のテーマを決めるときは、`AGENTS.md` の「未開拓テーマの例」を最優先する。
3. 直近3本と同じ系統の組み合わせ（ジャンル+構成+語り手）は禁止。
4. ミステリー要素を強める。本文の早い段階で読者が追える問いを提示し、途中で手がかりを段階的に出す。
5. 導入パターンとオチ類型の連投を避ける。
6. 記事末尾に必ずクレジットを入れる。

## 構成・語り手の選択ルール
- 構成は以下から選び、直近3本で使われたものを優先的に避ける:
  - 時系列順
  - 時系列逆転
  - 証言記録形式
  - 調査ログ形式
  - 断章形式
- 語り手は以下から選び、直近3本で使われたものを優先的に避ける:
  - 一人称
  - 信頼できない語り手
  - 複数証言型
  - 第三者記録型

## 出力要件
以下をこの順で出力する:
1. 新作の企画メモ（3-6行）
   - 選んだジャンル
   - 選んだ構成
   - 選んだ語り手
   - 直近3本との重複回避ポイント
2. 記事本文（Jekyll投稿形式）
   - `_posts/YYYY-MM-DD-kebab-case-title.md` に保存可能な形式
   - YAML frontmatter の `title` を含む
   - 必要に応じて画像挿入（画像後は空行を2つ）
   - 最後に `Written by {モデル名}` を含める

<!--
## TODO: Customize this workflow

The workflow has been generated based on your selections. Consider adding:

- [ ] More specific instructions for the AI
- [ ] Error handling requirements
- [ ] Output format specifications
- [ ] Integration with other workflows
- [ ] Testing and validation steps

## Configuration Summary

- **Trigger**: Daily schedule (fuzzy, scattered time)
- **AI Engine**: copilot
- **Tools**: github
- **Safe Outputs**: create-pull-request
- **Network Access**: ecosystem

## Next Steps

1. Review and customize the workflow content above
2. Remove TODO sections when ready
3. Run `gh aw compile` to generate the GitHub Actions workflow
4. Test the workflow with a manual trigger or appropriate event
-->
