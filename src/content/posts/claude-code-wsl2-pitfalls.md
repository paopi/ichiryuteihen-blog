---
title: "Claude Code × WSL2 環境構築のハマりポイント集"
date: 2026-04-04
category: "IT"
description: "Windows 11 + WSL2でClaude Codeを使う際に実際にハマったポイントと解決方法をまとめました。sudo問題、Sandbox制限、Node.jsバージョン、改行コードなど。"
tags: ["Claude Code", "WSL2", "環境構築", "Windows 11"]
thumb:
  motif: "terminal"
---

Windows 11 + WSL2（Ubuntu）で Claude Code を使っていて、実際にハマったポイントとその解決方法をまとめました。

公式ドキュメントには書かれていない、WSL2特有の落とし穴が多いです。

## 1. Node.js のバージョンが古くてインストールできない

`apt install nodejs` で入る Node.js は古すぎて Claude Code が動きません。

### 症状

```
npm install -g @anthropic-ai/claude-code
# → engine エラーで弾かれる
```

### 解決方法

nvm（Node Version Manager）を使って最新の LTS をインストールします。

```bash
# nvm インストール
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc

# Node.js 22 をインストール
nvm install 22
nvm use 22

# Claude Code インストール
npm install -g @anthropic-ai/claude-code
```

Claude Code は **Node.js 18 以上**が必須です。22 を入れておけば間違いありません。

## 2. sudo が使えない

Claude Code のチャット内で `!` を使ってシェルコマンドを実行できますが、`sudo` 付きのコマンドはパスワード入力ができないため失敗します。

### 症状

```
! sudo apt install gh
# → パスワード入力待ちのまま固まる
```

### 解決方法

`sudo` が必要なコマンドは **別のターミナルで直接実行**してください。

Windows Terminal で新しいタブを開いて Ubuntu を起動し、そこで `sudo` コマンドを実行すれば OK です。

Claude Code 側でやるべきことと、別ターミナルでやるべきことを分けて考えるのがコツです。

## 3. Sandbox でファイル書き込みが制限される

Claude Code にはセキュリティ用の Sandbox 機能があり、プロジェクトディレクトリ外への書き込みが制限されています。

### 症状

```bash
# /tmp に書き込もうとして失敗
cat > /tmp/script.sh
# → Read-only file system

# 別リポジトリへの git 操作が失敗
git commit -m "fix"
# → Unable to create '.git/index.lock': Read-only file system
```

### 解決方法

Sandbox の書き込み許可は `settings.json` で設定できます。

```json
{
  "permissions": {
    "allow": [
      "Bash(dangerouslyDisableSandbox:true)"
    ]
  }
}
```

ただし、毎回 Sandbox を無効化するのではなく、Claude Code が提案する「Sandbox を無効にして再試行しますか？」の確認に都度許可を出す方が安全です。

`/tmp` に一時ファイルを書きたい場合は、プロジェクトディレクトリ内に一時ディレクトリを作る方が Sandbox と相性が良いです。

## 4. GitHub CLI（gh）が apt で入らない

GitHub の操作に便利な `gh` コマンドは、Ubuntu の標準リポジトリには含まれていません。

### 症状

```bash
sudo apt install gh
# → パッケージが見つからない
```

### 解決方法

公式の GPG キーとリポジトリを追加してからインストールします。

```bash
# 公式リポジトリ追加
(type -p wget >/dev/null || (sudo apt update && sudo apt-get install wget -y)) \
  && sudo mkdir -p -m 755 /etc/apt/keyrings \
  && out=$(mktemp) && wget -nv -O$out https://cli.github.com/packages/githubcli-archive-keyring.gpg \
  && cat $out | sudo tee /etc/apt/keyrings/githubcli-archive-keyring.gpg > /dev/null \
  && sudo chmod go+r /etc/apt/keyrings/githubcli-archive-keyring.gpg \
  && echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
  && sudo apt update \
  && sudo apt install gh -y
```

インストール後は `gh auth login` で認証します（これも `sudo` が要るので別ターミナルで）。

## 5. WSL 側のファイルが Windows から 0KB に見える

WSL2 のファイルを Windows エクスプローラーで開くと、ファイルサイズが 0KB と表示されることがあります。

### 症状

`\\wsl.localhost\Ubuntu\home\...` 経由でファイルを開くと、中身が空に見える。

### 解決方法

WSL 側から `explorer.exe` を使って開きます。

```bash
# カレントディレクトリをエクスプローラーで開く
explorer.exe .
```

こうすると正しいファイルサイズで表示されます。Windows 側の `\\wsl.localhost\` パスから直接アクセスすると、キャッシュの問題でファイルが正しく読めないことがあるようです。

## 6. 改行コードの混在（CRLF / LF）

Windows のエディタで WSL 側のファイルを編集すると、改行コードが CRLF（Windows 形式）に変わってしまうことがあります。

### 症状

```bash
# シェルスクリプトが動かない
bash: ./script.sh: /bin/bash^M: bad interpreter
```

### 解決方法

Git の設定で自動変換を無効にします。

```bash
# WSL 側の Git 設定
git config --global core.autocrlf input
```

`input` に設定すると、コミット時に CRLF → LF に自動変換されます。チェックアウト時は変換しないので、WSL 側では常に LF が保たれます。

エディタ側でも設定しておくと確実です。VS Code の場合は、設定で `files.eol` を `\n` にしておきましょう。

## 7. WSL2 のメモリ上限

WSL2 はデフォルトで PC の RAM の 50% しか使えません。大きなプロジェクトや複数のエージェントを同時に動かすとメモリ不足になることがあります。

### 解決方法

Windows 側に `.wslconfig` を作成してメモリ上限を引き上げます。

```ini
# C:\Users\<ユーザー名>\.wslconfig
[wsl2]
memory=16GB
swap=4GB
```

設定後、PowerShell で WSL を再起動します。

```powershell
wsl --shutdown
```

## まとめ

| ハマりポイント | 解決方法 |
|---|---|
| Node.js が古い | nvm で 22 以上をインストール |
| sudo が使えない | 別ターミナルで実行 |
| Sandbox で書き込み制限 | 都度許可 or settings.json で設定 |
| gh が apt にない | 公式リポジトリを追加 |
| ファイルが 0KB に見える | `explorer.exe .` で開く |
| 改行コードが CRLF になる | `git config core.autocrlf input` |
| メモリ不足 | `.wslconfig` で上限引き上げ |

Claude Code 自体は WSL2 で問題なく動きますが、WSL2 特有の制限との組み合わせでハマることが多いです。ほとんどは一度設定すれば二度目はないので、最初に潰しておくと快適に使えます。
