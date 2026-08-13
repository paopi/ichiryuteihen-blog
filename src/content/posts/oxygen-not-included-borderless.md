---
title: "Oxygen Not Included をボーダーレスウィンドウでプレイする方法"
date: 2019-12-05
category: "ゲーム"
description: "ONI をボーダーレスウィンドウ化して、マルチディスプレイでの画面切り替えでクライアントが裏に飛ぶのを防ぐ設定手順。Steamの起動オプションを使います。"
tags: ["Oxygen Not Included", "ONI", "Steam", "ウィンドウモード"]
thumb:
  motif: "window-borderless"
---

Oxygen Not Included（ONI）を全画面でプレイしていると、マルチディスプレイ環境では画面を切り替えるたびにクライアントが裏に飛んでしまいます。
ボーダーレスウィンドウにすればこれが解消され、別モニターで攻略情報を見ながら遊べるようになります。

この記事では、Steam の起動オプションを使ってボーダーレスウィンドウ化する手順を紹介します。
※ゲームの言語は日本語設定で説明します。

<div class="note-box">
ℹ️ ONI のグラフィック設定に「ボーダーレス」という項目はありません。<a href="https://forums.kleientertainment.com/forums/topic/87688-is-there-any-way-to-make-the-game-borderless/">Klei公式フォーラムでの回答</a>でも、Unity製であるためグラフィックオプションへの追加は難しいと説明されています。そのため下記のように<strong>起動オプション側で指定する</strong>のが実質的な方法になります。
</div>

## 1. Oxygen Not Included のプロパティを開く

Steam を開き、ライブラリの Oxygen Not Included を右クリックして「プロパティ」を選びます。

![Steamライブラリで Oxygen Not Included を右クリックする](../../assets/oni-steam-library.png)

![右クリックメニューから「プロパティ」を選択する](../../assets/oni-steam-properties.png)

## 2. 起動オプションを設定する

プロパティ画面にある「起動オプションを設定...」をクリックします。

![プロパティ画面の「起動オプションを設定...」ボタン](../../assets/oni-launch-options-button.png)

入力欄に **①`-popupwindow`** と入力し、**②OK** を押します。

![起動オプションの入力欄に -popupwindow と入力する](../../assets/oni-launch-options-input.png)

<div class="note-box">
📝 掲載画像は2019年当時のSteamの画面です。現在のSteamでは「起動オプションを設定...」ボタンは無くなり、プロパティの「一般」タブに「起動オプション」の入力欄が直接置かれています。入力する内容は同じです。
</div>

## 3. ゲーム内の全画面設定を外す

起動オプションを入れたら Oxygen Not Included を起動し、メインメニューから「設定」を開きます。

![ONIのメインメニューで「設定」を選択する](../../assets/oni-ingame-settings.png)

設定メニューの「グラフィック」を開きます。

![設定メニューから「グラフィック」を選択する](../../assets/oni-settings-graphics.png)

画面の欄にある **①全画面** のチェックを外し（すでに外れていればそのまま）、**②完了** を押します。

![グラフィック設定で「全画面」のチェックを外して完了する](../../assets/oni-graphics-fullscreen.png)

## 完了

これでボーダーレスウィンドウで起動するようになります。
画面を切り替えてもクライアントが裏に飛ばなくなり、マルチディスプレイでの操作が快適になります。

![ボーダーレスウィンドウで表示されている Oxygen Not Included](../../assets/oni-borderless-result.png)

## 補足: 解像度について

ボーダーレスウィンドウではデスクトップの解像度に合わせて表示されます。
高解像度モニターでUIが小さく感じる場合は、同じグラフィック設定内にある「インターフェース」のUIサイズで調整できます。
