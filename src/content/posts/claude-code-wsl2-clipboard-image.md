---
title: "Claude Code（WSL2）でクリップボードの画像を渡す方法"
date: 2026-04-04
category: "IT"
description: "WSL2上のClaude Code CLIにWindowsのクリップボード画像を渡す方法。PowerShellスクリプトとカスタムスキルで「スクショ見て」が使えるようになります。"
tags: ["Claude Code", "WSL2", "クリップボード", "スキル"]
thumbnail: "../../assets/claude-code-wsl2-clipboard-image.png"
---

WSL2 上で Claude Code CLI を使っていると、**画像を渡す方法がない**ことに気づきます。

デスクトップアプリやWeb版なら画像をドラッグ＆ドロップで貼れますが、CLI にはその機能がありません。でも WSL2 から Windows 側の PowerShell を呼び出せば、クリップボードの画像を取得できます。

この記事では、「スクショ見て」と言うだけでクリップボードの画像を Claude Code に渡せる仕組みを作ります。

## 目次

1. [仕組み](#1-仕組み)
2. [PowerShell スクリプト](#2-powershell-スクリプト)
3. [Claude Code のカスタムスキルとして登録](#3-claude-code-のカスタムスキルとして登録)
4. [使い方](#4-使い方)
5. [注意点](#5-注意点)

## 1. 仕組み

WSL2 からは `powershell.exe` で Windows 側の PowerShell を実行できます。これを使って：

1. PowerShell でクリップボードから画像を取得
2. WSL2 側のファイルに保存
3. Claude Code の Read ツールで画像を読み取り
4. 一時ファイルを削除

という流れで実現します。

## 2. PowerShell スクリプト

以下の PowerShell スクリプトが、クリップボードから画像を取得して指定パスに保存します。

```powershell
Add-Type -AssemblyName System.Windows.Forms
$img = [System.Windows.Forms.Clipboard]::GetImage()
if ($img) {
    $img.Save($args[0])
    Write-Host 'OK'
} else {
    Write-Host 'No image'
}
```

やっていることはシンプルです。

- `System.Windows.Forms.Clipboard` で Windows のクリップボードにアクセス
- 画像があれば引数で指定されたパスに保存して `OK` を出力
- なければ `No image` を出力

## 3. Claude Code のカスタムスキルとして登録

Claude Code には**カスタムスキル**機能があり、`.claude/skills/` に定義ファイルを置くと `/スキル名` で呼び出せるようになります。

### ファイル構成

```
.claude/skills/clip/SKILL.md
```

### SKILL.md の中身

````markdown
---
name: clip
description: クリップボードの画像を読み取る。ユーザーが「クリップボード見て」「スクショ見て」と言った時に使う。
disable-model-invocation: true
allowed-tools: Bash, Read
---

クリップボードの画像を取得して表示する。

手順:
1. PSスクリプトを作成し、PowerShell経由でクリップボード画像を保存:
   ```
   cat > /tmp/clip.ps1 << 'PSEOF'
   Add-Type -AssemblyName System.Windows.Forms
   $img = [System.Windows.Forms.Clipboard]::GetImage()
   if ($img) {
       $img.Save($args[0])
       Write-Host 'OK'
   } else {
       Write-Host 'No image'
   }
   PSEOF
   CLIP_PATH="$(pwd)/tmp_clip.png"
   powershell.exe -ExecutionPolicy Bypass -File "$(wslpath -w /tmp/clip.ps1)" "$(wslpath -w "$CLIP_PATH")"
   ```
2. 出力が「OK」の場合、Readツールで `tmp_clip.png` を読み取る
3. 読み取り後、一時ファイルを削除:
   ```
   rm tmp_clip.png
   ```
4. 出力が「No image」の場合は「クリップボードに画像がありません」と伝える
````

### ポイント

- `disable-model-invocation: true` を指定すると、スキルの内容がそのまま Claude Code への指示として展開されます（AI が解釈し直さない）
- `allowed-tools: Bash, Read` で、使えるツールを Bash と Read に限定しています
- `wslpath -w` で WSL パスを Windows パスに変換しています（PowerShell は Windows パスしか理解できないため）

## 4. 使い方

1. Windows 側でスクリーンショットを撮る（`Win + Shift + S` など）
2. Claude Code で `/clip` と入力

これだけです。クリップボードの画像が Claude Code に渡されて、内容を認識してくれます。

### 使用例

- `/clip` → 「このエラー画面の原因を教えて」
- `/clip` → 「このデザインをコードにして」
- `/clip` → 「この設定画面の手順を説明して」

Cloudflare のダッシュボード操作やエラー画面の共有など、**画面を見せながら会話する**のに便利です。

## 5. 注意点

- **Sandbox 制限**: Claude Code の Sandbox が有効な場合、`/tmp` への書き込みがブロックされることがあります。その場合はプロジェクトディレクトリ内に一時ファイルを保存する形にしてください
- **画像のみ対応**: テキストのクリップボードには対応していません。画像がコピーされていない場合は「クリップボードに画像がありません」と表示されます
- **一時ファイル**: `tmp_clip.png` はスキル実行後に自動削除されますが、エラーで残った場合は手動で消してください。`.gitignore` に追加しておくと安全です

## まとめ

1. **WSL2 から `powershell.exe` 経由でクリップボード画像を取得**
2. **Claude Code のカスタムスキルとして `/clip` で呼び出し**
3. **スクショを撮って `/clip` するだけで画像を渡せる**

CLI でも画像を扱えるようになると、Claude Code の活用の幅がかなり広がります。
