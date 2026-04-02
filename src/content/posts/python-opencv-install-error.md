---
title: "Python3.xでOpenCVのインストールに失敗する場合の対処"
date: 2019-05-14
category: "IT"
description: "pip install opencv-python でエラーになる原因と解決策。Visual C++ Redistributableの不足やPythonバージョンの不一致が主な原因。"
tags: ["Python", "OpenCV", "pip", "トラブルシューティング"]
---

`pip install opencv-python` を実行するとエラーが出る場合の対処法をまとめます。

## よくあるエラーパターン

### エラー1: Visual C++ Build Tools が見つからない

```
error: Microsoft Visual C++ 14.0 or greater is required.
```

**解決策**: Visual Studio Build Tools をインストールする

Microsoft の公式サイトから「Build Tools for Visual Studio」をダウンロードしてインストールしてください。
インストール時に「C++ build tools」を選択することが重要です。

### エラー2: Python バージョンの不一致

```
ERROR: Could not find a version that satisfies the requirement opencv-python
```

最新の opencv-python は Python 3.6 以上が必要です。

```bash
python --version  # バージョン確認
```

Python 3.5 以下の場合はアップグレードが必要です。

### エラー3: pip が古い

```bash
python -m pip install --upgrade pip
pip install opencv-python
```

pip を最新版にアップグレードしてから再試行してください。

## ヘッドレス環境（サーバー等）の場合

GUI不要な環境では `opencv-python-headless` を使います：

```bash
pip install opencv-python-headless
```

こちらはGUI関連のライブラリに依存しないため、サーバーやWSL環境でもインストールしやすいです。

## まとめ

1. まず pip を最新版にアップグレード
2. Visual C++ Build Tools をインストール
3. Python バージョンが 3.6 以上か確認
4. GUI不要なら `opencv-python-headless` を試す
