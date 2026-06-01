#Requires -Version 7
<#
.SYNOPSIS
  ローカルの LM Studio (OpenAI 互換 API) を使って怪談を生成し、_posts/ に保存する。
  まずランダムな単語5つを生成し、それらをテーマにした怪談を出力する。
#>

# ---------- 設定 ----------
$LMStudioUrl   = "http://localhost:1234/v1/chat/completions"
$Model         = "google/gemma-4-e4b"
$PostsDir      = Join-Path $PSScriptRoot "_posts"
$Today         = (Get-Date).ToString("yyyy-MM-dd")

# ---------- ファイル名生成 ----------
# 既存ファイルと被らないようランダム suffix をつける
$Suffix = -join ((48..57) + (65..90) + (97..122) | Get-Random -Count 4 | ForEach-Object { [char]$_ })
$FileName = "$Today-horror-story-$Suffix.md"
$FilePath = Join-Path $PostsDir $FileName

# ---------- ステップ1: ランダムな単語5つを生成 ----------
$WordBody = @{
    model     = $Model
    messages  = @(
        @{ role = "system"; content = "あなたは創造的な単語生成AIです。" }
        @{ role = "user"; content = @"
日本語の単語をちょうど5つだけ出力してください。
以下の条件を守ってください：
- 日常の物・現象・感覚・場所・人・動物・自然・食べ物・音・色 など、あらゆるカテゴリからランダムに選ぶ
- 例：「傘」「蛍光灯」「梅雨」「猫」「錆びた鎖」のような組み合わせ
- 単語同士に明らかな関連性がない方がよい（意外な組み合わせが怖い話の種になる）
- 各単語は1行に1つ。合計5行のみを出力し、それ以外の説明は付けない
"@ }
    )
    temperature = 1.0
    max_tokens  = 1024
} | ConvertTo-Json -Depth 5

Write-Host "ステップ1: ランダムな単語5つを生成中..." -ForegroundColor Cyan
$wordResponse = Invoke-RestMethod -Uri $LMStudioUrl -Method Post -Body $WordBody -ContentType "application/json"

$words = $wordResponse.choices[0].message.content.Trim()

Write-Host "  生成された単語: $words" -ForegroundColor Yellow

# ---------- ステップ2: 単語5つをテーマにした怪談を生成 ----------
$SystemPrompt = @"
[指示]
あなたはホラー作家です。与えられたテーマ単語5つをすべて物語に自然に織り込み、読者の背筋が凍るような短編ホラーストーリーを書いてください。

[制約]
- 500〜1,200文字程度で完結させる。
- 過度な血液・傷痕の描写は避ける。恐怖感は暗示と心理的圧迫で表現。
- 文章は感覚描写を多用し、リズムにメリハリをつける。
- 最後まで読者に「次は自分が…」という不安を残すこと。
- 一人称視点で書く。
- 日常的な場面から始め、徐々に違和感を忍び込ませる。

[出力]
ストーリー本文だけを出力し、それ以外の説明やヘッダーは付けない。
"@

$UserPrompt = "テーマ単語: $words をすべて物語に織り込んだ怪談を書いてください。"

$StoryBody = @{
    model     = $Model
    messages  = @(
        @{ role = "system"; content = $SystemPrompt }
        @{ role = "user";   content = $UserPrompt }
    )
    temperature = 0.9
    max_tokens  = 2048
} | ConvertTo-Json -Depth 5

Write-Host "ステップ2: 怪談を生成中..." -ForegroundColor Cyan
$response = Invoke-RestMethod -Uri $LMStudioUrl -Method Post -Body $StoryBody -ContentType "application/json"

$story = $response.choices[0].message.content.Trim()

# ---------- ステップ3: タイトル生成 ----------
$TitlePrompt = @"
[指示]
以下のホラー短編ストーリーを読んで、適切な日本語のタイトルを1つ考えてください。
タイトルは短く、不気味で、読者の興味を引くものにしてください。
タイトルのみを出力し、それ以外の説明は付けないでください。

[ストーリー]
$story
"@

$TitleBody = @{
    model     = $Model
    messages  = @(
        @{ role = "system"; content = "あなたはホラー作家です。ストーリーに適切なタイトルを付けてください。" }
        @{ role = "user";   content = $TitlePrompt }
    )
    temperature = 0.7
    max_tokens  = 64
} | ConvertTo-Json -Depth 5

Write-Host "ステップ3: タイトルを生成中..." -ForegroundColor Cyan
$titleResponse = Invoke-RestMethod -Uri $LMStudioUrl -Method Post -Body $TitleBody -ContentType "application/json"

$title = $titleResponse.choices[0].message.content.Trim()

# ---------- フロントマター + 署名を付与 ----------
$frontMatter = @"
---
title: $title
---
"@

$signature = @"

---
Written by $Model

"@

$fullContent = "$frontMatter`n$story`n$signature"

# ---------- 保存 ----------
$fullContent | Out-File -FilePath $FilePath -Encoding utf8

Write-Host "完了！ -> $FilePath" -ForegroundColor Green
