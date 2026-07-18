# AI恐怖短話自動生成パイプライン設計書

## 前提

- `_posts/` に56本の手動投稿が既に存在する（`AGENTS.md` の指示に従う人間が1つずつ書いた）
- daemon (`cmd/horror-blog-daemon/main.go`) は起動できる状態だが、`post_generation` タスクの `Execute()` が TODO placeholder になっている
- LLM (Ollama gemma4/ornith:35b) はローカルで稼働している
- `_meta/topics.md`, `_meta/generated-stories-count.txt`, `horror_system/prompts/{architype,sensory,architect,synthesis}.md` が既存の設計文書にある

## 現状の問題点

### 1. post_generation.go がTODO placeholder（致命傷）
`internal/tasks/post_generation.go:27-43` は以下のような空stub：

```go
// TODO: Implement post generation logic
return TaskResult{
    Success: true,
    Message: "Post generation task placeholder - not yet implemented",
    ...
}
```

→ daemonはスケジュール通りトリガーされるが、中身がなく即座に成功として返る。 `_posts/` にファイル追加されない。

### 2. topic-selector が実体化していない
_horror_system_ 下の `prompts/architype.md`, `prompts/sensory.md` はLLMプロンプト定義はあるが、実際にそれを読んで次のテーマを決定するロジック (`meta/docs/post-generation.md`) は存在しない。

### 3. theme-tracking (`_meta/topics`) のフォーマット統一
`horror-system/topics.jsonl`, `generated-stories-count.txt` が2箇所に散在している状態だが、生成パイプラインが実際にこれを読み書きしていない。

## 必要な実装（5段階）

### Step 1: LLM呼び出し基盤の Go クライアントを構築
`config.yaml` の Ollama/LM Studio 設定に応じて、HTTP でLLMにプロンプトを送り Markdown を受け取る `internal/llm/client.go`。既に `post-generation.md` スキルで「HTTP POST → /v1/chat/completions」と定義済みなので、これを Go で実装する。

```go
type Client struct {
    URL      string // http://localhost:11434
    Model    string // gemma3, ornith-35b, ...
    Temperature float64
}

func (c *Client) Generate(ctx context.Context, prompt string) (string, error) {...}

```

このクライアントを用いて4段階の `horror_pipeline.py` で定義されたステップ（architype → sensory → architect → synthesis）をそれぞれプロンプト呼び出しに変換する。

### Step 2: テーマ選定ロジック (`internal/topics/selector.go`)
- `_posts/*.md` を読取り、直近3本のタイトル・カテゴリを一覧にする
- `AGENTS.md §4「未開拓テーマ」リストを参照し、未使用の先から選ぶ（ランダムor順次）`
- 結果を `_meta/topics.jsonl` に1行記録

### Step 3: post_generation.go にパイプラインを実装
```go
func (t *PostGenerationTask) Execute(ctx context.Context) TaskResult {
    theme := topics.SelectNext(ctx)          // Step 2
    archetype := llm.GenArchetype(prompt, theme)   // Stage 1 of horror_system pipeline
    sensory := llm.GenSensory(prompt, archetype)
    architect_data := llm.GenPlot(prompt, archetype, sensory)
    story_md := llm.Synthesize(prompt, archetype, sensory, architect_data)

    if err := savePost(t.Config, theme, story_md); err != nil {
        return fail(err)
    }
    // optional: auto-commit via git
    return successWith(story_md)
}
```

### Step 4: レビュー・不合格再生成ループ（option）
`horror-post-reviewer` スキルの評価指標（恐怖度1-10）を用い、生成後レビュー。恐怖度が閾値(例：7)未満なら再生成。_config.yaml の `post_generation.max_attempts: 3` を参照。

### Step 5: cronジョブの動作確認
```bash
go build -o bin/daemon ./cmd/horror-blog-daemon
./bin/daemon --test    # 手動でテスト実行
# or schedule
crontab -e
0 7 * * * /path/to/daemon start >> logs/cron.log 2>&1
```

## ファイル追加・改修一覧

| ファイル | 操作 | 説明 |
|----------|------|------|
| `internal/llm/client.go` | 新規 | Ollama/LM Studio HTTP クライアント |
| `internal/topics/selector.go` | 新規 | テーマ選定＋被り除外ロジック |
| `internal/topics/tracker.go` | 新規 | `_meta/generated-stories-count.txt` の読み書き |
| `meta/themes/unlock-list.jsonl` | 改修or新規 | `AGENTS.md §4` の定義を構造化したもの（現状未実装） |
| `internal/tasks/post_generation.go` | 大幅改修 | TODO placeholder → 実パイプライン |
| `_posts/test-scenarios.jsonl` | 既成 | テスト用 |
| `_meta/generated-stories-*.txt` | 参照 | 生成数カウント（未使） |

### config.yaml の修正事項
```yaml
post_generation:
  source: ollama            # gemini-flash ではないローカルモデル使用
  llm_endpoint: "http://localhost:11434"
  model: ornith-35b         # gemma3 → ロカルの ornith に変更（gemma4 は使えなかった可能性）
```

## Ollama 利用上の注意点
現在ローカルで稼働してるモデルは `ornith:35b`。プロンプト長に注意（8k-32kトークン）。各ステージを逐次呼出しするとコンテキストが膨れるので、architype → sensory の結果を要約してから architect に渡す等、中間出力の圧縮が必要になる場合がある。
