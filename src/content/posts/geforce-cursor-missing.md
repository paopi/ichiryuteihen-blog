---
title: "Geforce Experienceの録画にマウスカーソルが映らない時の対処法"
date: 2020-02-03
category: "IT"
description: "Geforce Experience（ShadowPlay）で録画した動画にマウスカーソルだけが映らない問題を、Windowsのマウス設定で解決した手順のメモ。"
tags: ["Geforce Experience", "NVIDIA", "録画", "トラブルシューティング"]
thumb:
  motif: "cursor-missing"
---

Geforce Experience でゲームを録画したところ、できあがった動画に**マウスカーソルだけが映っていない**ということがありました。
プレイ中の画面ではきちんと見えているのに、録画された映像ではカーソルが消えています。

![League of Legends の録画。マウス操作をしているのにカーソルが映っていない](/images/geforce-cursor-missing-recording.gif)

原因がわからず厄介でしたが、**Windows 側のマウス設定を触ることで解消**できました。
NVIDIA 側ではなく OS 側の設定だった、というのがポイントです（Windows 10 で確認）。

## マウス設定をやり直す

### 1. マウスのプロパティを開く

「設定」→「デバイス」を開きます。

![Windowsの設定画面で「デバイス」を選択している](../../assets/geforce-cursor-settings-devices.png)

左のメニューから **①マウス** を選び、関連設定にある **②その他のマウス オプション** をクリックします。

![デバイス設定の「マウス」から「その他のマウス オプション」を開く](../../assets/geforce-cursor-mouse-options.png)

### 2. ポインター オプションタブへ移動する

「マウスのプロパティ」が開くので、**③ポインター オプション** タブをクリックします。

![マウスのプロパティで「ポインター オプション」タブを選択している](../../assets/geforce-cursor-pointer-tab.png)

### 3. 「ポインターの軌跡を表示する」を一度オンにする

表示の欄にある **④ポインターの軌跡を表示する** にチェックを入れ、**⑤適用** を押します。

![「ポインターの軌跡を表示する」にチェックを入れて適用する](../../assets/geforce-cursor-trail-on.png)

### 4. チェックを外して確定する

適用したら、**⑥ポインターの軌跡を表示する** のチェックを**外して**、**⑦適用** → **⑧OK** の順に押します。

![チェックを外して適用し、OKで閉じる](../../assets/geforce-cursor-trail-off.png)

軌跡表示は一度オンにして適用するだけで、オンのままにしておく必要はありません。
設定をオン・オフと往復させることに意味があります。

## 録画して確認する

設定後にもう一度 Geforce Experience で録画してみると、カーソルがきちんと映るようになりました。

![設定変更後の録画。マウスカーソルが表示されている](/images/geforce-cursor-fixed-recording.gif)

なぜこの操作で直るのかまでは、正直なところ分かっていません。
ただ NVIDIA 側の設定を一切変えずに解決したので、同じ症状で困っている場合は最初に試してみる価値があります。

<div class="note-box">
📝 この記事は2020年2月にWindows 10で確認した内容です。<br>
・Windows 11 では「設定」→「Bluetooth とデバイス」→「マウス」→「マウスの追加設定」から同じ「マウスのプロパティ」を開けます。<br>
・Geforce Experience 自体は、2024年11月12日に正式リリースされた <strong>NVIDIA App</strong> へ置き換えられ、ShadowPlay などの機能はそちらへ移行しています。録画機能の入り口は変わりましたが、上記はWindows側の設定なので操作は同じです。
</div>
