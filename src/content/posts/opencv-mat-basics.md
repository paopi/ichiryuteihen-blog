---
title: "OpenCVのcoreライブラリMatについて"
date: 2018-07-20
category: "IT"
description: "OpenCV の中心データ構造 Mat の基本的な使い方と、よくある落とし穴をまとめたメモ。"
tags: ["OpenCV", "C++", "Python", "画像処理"]
---

OpenCV を使い始めたばかりのころ、`Mat` クラスの挙動に戸惑いました。
特に「コピー」の概念が独特で、ハマりやすいポイントが多いです。
このメモが同じ轍を踏む人の助けになれば幸いです。

## Mat の基本

`Mat` は OpenCV の基本データ構造で、画像や行列を表します。

```cpp
// 空のMatを作成
cv::Mat img;

// 画像ファイルを読み込む
cv::Mat img = cv::imread("photo.jpg");

// 空のMatを特定のサイズで作成
cv::Mat blank = cv::Mat::zeros(480, 640, CV_8UC3);  // 640x480の黒画像
```

## シャローコピーとディープコピー

`Mat` の最大の罠がここです。

```cpp
cv::Mat a = cv::imread("photo.jpg");
cv::Mat b = a;  // シャローコピー！同じデータを参照

b.at<cv::Vec3b>(0, 0) = {255, 0, 0};  // a も変わってしまう！

// ディープコピーするには clone() を使う
cv::Mat c = a.clone();  // または a.copyTo(c);
```

`=` での代入は参照カウントによるシャローコピーになります。
独立したコピーが必要な場合は必ず `clone()` を使いましょう。

## よくある型と意味

| 型 | 意味 |
|---|---|
| `CV_8UC1` | 8bit符号なし整数、1チャンネル（グレースケール） |
| `CV_8UC3` | 8bit符号なし整数、3チャンネル（BGR） |
| `CV_32FC1` | 32bit浮動小数点、1チャンネル |

## ROI（Region of Interest）

画像の一部を切り出す際も参照になる点に注意：

```cpp
cv::Mat img = cv::imread("photo.jpg");
cv::Rect roi(100, 100, 200, 200);
cv::Mat region = img(roi);  // これも参照！
cv::Mat region_copy = img(roi).clone();  // ディープコピー
```

## まとめ

- `Mat` の代入は参照コピー → 独立したコピーは `clone()`
- ROI 抽出も参照 → 独立させるなら `clone()`
- 型の違いに注意（整数型と浮動小数点型で演算結果が変わる）

最初は戸惑いますが、慣れると非常に効率的な構造です。
