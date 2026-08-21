---
title: "CLAUDE.md 肥大化を Hooks で解決 — Claude Code のコンテキスト85%削減"
date: 2026-08-21
category: "IT"
description: "CLAUDE.md に全部書くとコンテキストを毎回圧迫します。Claude Code の引き継ぎ文書を役割ごとに分割し、SessionStart フックで「目次と危険な教訓だけ」を自動供給する方法。毎セッションの読み込みを36,674字→約5,500字（-85%）に減らした実装コードつき。"
tags: ["Claude Code", "Hooks", "CLAUDE.md", "コンテキスト管理"]
thumbnail: "../../assets/claude-code-session-handover.png"
---

Claude Code を長く使っていると、必ずこの壁に当たります。

**セッションを閉じると、AI 側の記憶はゼロに戻る。**

昨日「このコマンドは自爆するから使うな」と学習させたはずのことを、今日はまた平然とやる。人間の同僚なら覚えていることを、毎回ゼロから説明し直すことになります。

対策として誰もが最初に思いつくのが `CLAUDE.md` に全部書くことです。私もそうしました。そして次の壁に当たりました。

**全部書くと、読ませた瞬間にコンテキストが埋まる。**

この記事は、その2つの壁を「引き継ぎ文書の分割」と「SessionStart フック」で抜けた記録です。最終的に、毎セッション読ませる量を **約36,000字 → 約5,500字（-85%）** に落としつつ、「知らないことを知る」経路は残せました。

やったことを1枚にすると、こうなります。

<div class="fig-flow">
<div class="fig-col fig-before">
<div class="fig-col-title">BEFORE — 全文を読ませる</div>
<div class="fig-node"><b>教訓ファイル</b><span class="fig-sub">36,674字</span></div>
<div class="fig-arrow">↓ 開始時に全文を読み込み</div>
<div class="fig-node fig-node-key"><b>コンテキスト</b><span class="fig-sub">約4万トークンを毎回前払い</span></div>
<div class="fig-arrow">↓</div>
<div class="fig-node"><b>実際に参照するのは数百字</b><span class="fig-sub">残りは払い損。しかも他の作業を圧迫する</span></div>
</div>
<div class="fig-col fig-after">
<div class="fig-col-title">AFTER — フックが選んで渡す</div>
<div class="fig-node"><b>教訓ファイル</b><span class="fig-sub">36,674字（削っていない）</span></div>
<div class="fig-arrow">↓ セッション開始時に機械が走査</div>
<div class="fig-node fig-node-key"><b>SessionStart フック</b><span class="fig-sub">目次（節名＋行番号）と 🔴 だけを生成</span></div>
<div class="fig-arrow">↓ 約5,500字</div>
<div class="fig-node"><b>コンテキスト</b><span class="fig-sub">残りは必要になった節だけ、行番号から後で引く</span></div>
</div>
</div>

<p class="fig-caption">元データは削らない。減らすのは「毎回渡す量」だけ。目次と 🔴 を残すことで、探そうと思わない知識に出会う経路も維持する。</p>

## 目次

1. [なぜ CLAUDE.md に全部書くと失敗するのか](#1-なぜ-claudemd-に全部書くと失敗するのか)
2. [引き継ぎ文書を4つに割る](#2-引き継ぎ文書を4つに割る)
3. [それでも太る — 実測して分かったこと](#3-それでも太る--実測して分かったこと)
4. [SessionStart フックで「供給側」を変える](#4-sessionstart-フックで供給側を変える)
5. [実装コード](#5-実装コード)
6. [設計上の3つの約束](#6-設計上の3つの約束)
7. [ハマったところ](#7-ハマったところ)

## 1. なぜ CLAUDE.md に全部書くと失敗するのか

`CLAUDE.md` はセッションの最初に読み込まれ、**その内容はセッション中ずっとコンテキストに居座り続けます**。

つまり `CLAUDE.md` に書いた文字は、使うか使わないかに関係なく、毎回・全額を前払いすることになります。過去の教訓を全部ここに積むと、こうなります。

- 3万字の教訓を書く → **毎セッション3万字ぶんのトークンを、使うか分からない知識に払う**
- 実際に参照されるのは、そのうち数百字

さらにもう1つ、見落としやすい性質があります。

<div class="note-box">
📝 <strong>CLAUDE.md は context であって、enforced configuration ではない</strong><br>
公式ドキュメントに明記されています。「絶対にやるな」と書いても、それは<strong>強い提案</strong>にすぎません。判断が滑れば通ります。本当に止めたいものはフック（後述）に移す必要があります。
</div>

要するに、`CLAUDE.md` は **高い（常駐コスト）わりに、強制力がない**。ここに全部を積むのは筋が悪い、というのが出発点です。

## 2. 引き継ぎ文書を4つに割る

そこで、プロジェクト直下に `docs/session/` を作り、**役割ごとに**ファイルを分けました。私の環境の実測値がこれです。

| ファイル | サイズ | 中身 | 読み方 |
|---|---|---|---|
| `next-session.md` | 25.8KB | 進行中の状態・未完了タスク | **全文を読む** |
| `lessons.md` | 71.8KB | 過去の教訓・ハマりどころ | **目次と印だけ** |
| `environment.md` | 32.6KB | 環境情報・構成 | `grep` で引く |
| `archive/` | 49.4KB | 完了済み・過去のサマリー | **読まない** |

ここで大事なのは、分割したこと自体ではありません。

**ファイルごとに「読み方」が違うことを、明示的に書いたこと**です。

`CLAUDE.md` にはこう書いてあります。

```markdown
- セッション開始時、`docs/session/` 配下を確認すること。ただし読み方がファイルごとに違う
  - next-session.md — 引き継ぎメモ。全文を読む（現在進行中の状態なので省略できない）
  - lessons.md — 教訓。全文を読まない。目次と印から関係する節だけ引く
  - environment.md — 環境情報。必要になったときだけ引く（grep で足りる）
```

「`docs/session/` を読んで」とだけ書くと、AI は素直に全部読みます。**読まなくていいものを明示しないと、読まないという判断は生まれません。**

### archive は「削除」ではなく「退避」

完了済みタスクや過去の作業サマリーは、消さずに `archive/` へ移しました。

判断の記録（なぜその方式を選ばなかったのか）は資産です。ただし**毎回読む必要はない**。「あのときどう決めたか」を辿るときだけ開けばいい。この区別をディレクトリで表現しています。

実際、`next-session.md` はこの退避だけで **48KB → 20KB** に落ちました（上の表の 25.8KB は、その後の追記を含む現在値です）。

## 3. それでも太る — 実測して分かったこと

分割してもなお、`lessons.md` が重いままでした。実測するとこうです。

```bash
wc -c docs/session/lessons.md
# → 71751 bytes（36,674字）
```

日本語混じりの Markdown はおおよそ **1.0〜1.15 token/文字**なので、これだけで **36,000〜42,000 トークン**。毎セッション、この全額を先払いしていました。

ではどう減らすか。ここで2つの案が出て、**どちらも間違いでした**。

### 案A: 刈り込む → 失敗

「太っているなら削ればいい」と考えて、節ごとの文字数を実測しました。結果は予想外でした。

- 全31節、**最大でも4,900字・大半は1,000字前後**
- 取り消し線（無効化済みの記述）は8箇所だけ

つまり脂肪がなかった。ここで削れば、減るのは容量ではなく**資産のほう**です。

<div class="note-box">
📝 <strong>ただし「分量」だけを測るのは不十分でした</strong><br>
後から気づいたのですが、測るべきは分量ではなく<strong>「その教訓の対象がまだ存在するか」</strong>です。実際、すでにアンインストールしたツールの教訓や、存在しないコマンドの手順が丸ごと残っていました。<strong>節が薄くても、対象が消えていれば全行が負債</strong>です。刈り込みは「太った節を探す」ではなく「対象の生死を1節ずつ確認する」作業でした。
</div>

### 案B: 全部やめて grep にする → これも危険

「必要になったら `grep` すればいい」——一見合理的ですが、致命的な穴があります。

**本当に助けになる教訓は、探そうと思わない教訓だから。**

私の場合、`pkill -f "パターン"` が自分自身のシェルを巻き込んで自爆する（`pkill` を実行しているコマンド文字列自体がパターンにマッチする）という罠を、**3回踏んでから**記録しました。そして「`pkill` は危ないか？」と事前に `grep` する発想は、踏むまで出てきません。

`grep` は「知りたいことを知る」手段であって、「**知らないことを知る**」手段ではないのです。

## 4. SessionStart フックで「供給側」を変える

答えは、全文でも `grep` でもなく**中間**でした。

- **目次**（節名＋行番号）を毎回渡す → 「そこに何かある」ことは分かる
- **危険な教訓だけ**（🔴 の印）を毎回全文で渡す → 探そうと思わない罠を潰せる
- 残りは、必要になった時点で行番号から引く

そして重要なのが、**これを AI 側の努力ではなく、フックという機械で供給すること**です。

### SessionStart フックとは

Claude Code の Hooks は、特定のタイミングで任意のコマンドを実行する仕組みです。`SessionStart` はセッション開始・再開時に発火します。

<div class="note-box">
📝 <strong>SessionStart は「stdout が Claude に見える」数少ないイベント</strong><br>
公式ドキュメントによると、多くのフックでは exit 0 の stdout はデバッグログに書かれるだけで Claude には渡りません。<strong>例外が <code>UserPromptSubmit</code> / <code>UserPromptExpansion</code> / <code>SessionStart</code> の3つ</strong>で、これらは stdout がそのままコンテキストに追加されます。<br>
つまり「セッション開始時に、機械が計算した事実を Claude に渡す」という用途にそのまま使えます。
</div>

### 登録

`~/.claude/settings.json` に書きます。

```json
{
  "hooks": {
    "SessionStart": [
      {
        "hooks": [
          {
            "type": "command",
            "command": "python3 ~/.claude/scripts/hooks/session-brief.py",
            "timeout": 10
          }
        ]
      }
    ]
  }
}
```

`matcher` を省略すると全パターン（`startup` / `resume` / `clear` / `compact` / `fork`）で発火します。`timeout` の既定値は 600 秒ですが、セッション開始を待たせたくないので 10 秒にしています。

<div class="note-box">
📝 <strong><code>~</code> が使えるのは「shell 形式」のときだけ</strong><br>
フックの <code>command</code> は、<strong><code>args</code> を書かなければシェル経由</strong>で実行されます（shell 形式）。このときは <code>~</code> やチルダ展開、<code>$HOME</code> などのシェル機能が効きます。<br>
逆に <code>args</code> を書くと<strong>シェルを通さず直接起動</strong>される（exec 形式）ため、<code>~</code> や <code>$HOME</code> はただの文字列として扱われて壊れます。exec 形式でパスを書くときは、公式が用意している <code>${CLAUDE_PROJECT_DIR}</code> などのプレースホルダを使ってください。
</div>

## 5. 実装コード

スクリプトの仕事は3つです。

1. `docs/session/` に何があるかを伝える
2. 前回セッションからの経過日数を**計算して**伝える
3. `lessons.md` の目次と 🔴 を**その場で生成して**渡す

まず、目次を組み立てる部分。

```python
import datetime, json, os, re, sys

STALE_DAYS = 30        # これ以上空いたら CHANGELOG 確認を促す
RED_WARN_CHARS = 8000  # 🔴 の合計がこれを超えたら棚卸しを促す（切り捨てはしない）
SECTION_RE = re.compile(r"^##\s+(.+?)\s*$")


def scan_lessons(lines):
    """lessons.md の行から (節名, 開始行, 終了行) と 🔴 行を拾う。"""
    sections = []
    for i, line in enumerate(lines, start=1):
        m = SECTION_RE.match(line)
        if m:
            sections.append([m.group(1), i, None])
    for idx, sec in enumerate(sections):
        end = sections[idx + 1][1] - 1 if idx + 1 < len(sections) else len(lines)
        while end > sec[1] and not lines[end - 1].strip():
            end -= 1     # 末尾の空行は範囲に含めない
        sec[2] = end

    reds = [ln.rstrip() for ln in lines if "🔴" in ln]
    return sections, reds


def lessons_brief(path):
    """目次と 🔴 を組み立てて返す。作れなければ None。"""
    try:
        with open(path, encoding="utf-8") as f:
            text = f.read()
    except OSError:
        return None

    lines = text.split("\n")
    sections, reds = scan_lessons(lines)
    if not sections:
        return None    # 形式が違う → 呼び出し側が「全文を読め」に倒す

    rel = os.path.join("docs", "session", "lessons.md")
    lo, hi = len(text), int(len(text) * 1.15)   # 日本語 md は約1.0〜1.15 token/文字
    out = [
        "",
        f"── lessons.md は全文を読まないこと（全{len(sections)}節・{len(text):,}字 ≒ "
        f"{lo:,}〜{hi:,} tokens）──",
        "下の目次と🔴で判断し、**関係する節だけ** `sed -n 'A,Bp' " + rel + "` で引くこと。",
        "",
        "【目次】",
    ]
    width = max(len(f"L{s[1]}-{s[2]}") for s in sections)
    for name, start, end in sections:
        out.append(f"  {('L%d-%d' % (start, end)).ljust(width)}  {name}")

    if reds:
        total = sum(len(r) for r in reds)
        out.append("")
        out.append(f"【🔴 知らないと事故る教訓 — {len(reds)}件・全文】")
        out.extend(reds)
        if total > RED_WARN_CHARS:
            out.append("")
            out.append(
                f"⚠️ 🔴 が {len(reds)}件・{total:,}字まで増えている（閾値 {RED_WARN_CHARS:,}字）。"
                "毎セッション払うコストなので、印の棚卸しを検討すること。切り捨てはしていない。"
            )
    return "\n".join(out)
```

次に、stdin の JSON を受けて出力する本体。

```python
def main():
    try:
        payload = json.load(sys.stdin)
    except (json.JSONDecodeError, ValueError):
        sys.exit(0)          # フックのバグで作業を止めない（fail-open）

    cwd = payload.get("cwd") or os.getcwd()
    session_dir = os.path.join(cwd, "docs", "session")
    if not os.path.isdir(session_dir):
        sys.exit(0)          # 別プロジェクトでは何も出さない

    lines = []
    present = [n for n in ("next-session.md", "lessons.md", "environment.md")
               if os.path.isfile(os.path.join(session_dir, n))]
    if present:
        lines.append("セッション引き継ぎ文書が存在する: "
                     + "、".join(f"docs/session/{n}" for n in present)
                     + "。作業を始める前に読むこと。")
        lines.append("next-session.md は全文を読む。environment.md は必要になったときだけ引く。")

    # 経過日数は Claude に計算させない（日付の取り違えが起きない）
    last = latest_summary_date(os.path.join(session_dir, "next-session.md"))
    if last:
        gap = (datetime.date.today() - last).days
        lines.append(f"前回の作業サマリーは {last.isoformat()}（{gap} 日前）。")
        if gap >= STALE_DAYS:
            lines.append(f"⚠️ {STALE_DAYS} 日以上空いている。公式 CHANGELOG で差分を確認すること。")

    lessons = os.path.join(session_dir, "lessons.md")
    if os.path.isfile(lessons):
        try:
            brief = lessons_brief(lessons)
        except Exception:
            brief = None
        if brief:
            lines.append(brief)
        else:
            # fail-safe: 索引が作れないなら従来どおり全文を読ませる
            lines.append("⚠️ lessons.md の索引を生成できなかった。**全文を読むこと。**")

    if lines:
        print("\n".join(lines))
    sys.exit(0)


if __name__ == "__main__":
    main()
```

`latest_summary_date()` は `## 作業サマリー（YYYY-MM-DD）` という見出しを正規表現で拾って最新日を返すだけなので省略します。

### 実際の出力

セッション開始時、Claude はこれを受け取ります。

```
セッション引き継ぎ文書が存在する: docs/session/next-session.md、docs/session/lessons.md、
docs/session/environment.md。作業を始める前に読むこと。
前回の作業サマリーは 2026-08-21（0 日前）。

── lessons.md は全文を読まないこと（全31節・36,674字 ≒ 36,674〜42,175 tokens）──
下の目次と🔴で判断し、関係する節だけ `sed -n 'A,Bp' docs/session/lessons.md` で引くこと。

【目次】
  L21-29    スキル管理
  L31-35    WSL
  L37-39    シェル操作（Bashツール）
  ...
  L230-252  Claude Code サンドボックス
  L265-287  Hooks

【🔴 知らないと事故る教訓 — 26件・全文】
- 🔴 pkill -f "<パターン>" は自分自身のシェルを巻き込んで自爆する。...
- 🔴 未追跡ファイルは削除すると git からも復元できない。...
```

行番号が入っているので、Claude は必要になった節を `sed -n '265,287p' docs/session/lessons.md` **一発で**引けます。

## 6. 設計上の3つの約束

このスクリプトで本当に効いているのは、コードそのものより次の3点です。

### ① 索引は手書きしない

目次を `lessons.md` の冒頭に手で書くこともできました。やめた理由は明確です。

**手書きの索引は、本体を編集した瞬間にズレる。しかもズレたことに気づけない。**

フックが毎回その場で走査すれば、節を足しても行番号を直す必要がありません。「記録と実態のズレ」という、このプロジェクトが何度も踏んできた失敗を、構造的に潰しています。

### ② 壊れたら「省略しない側」へ倒す

省略する仕組みを作るときの鉄則です。

- 索引が作れなかったら → **「全文を読め」と出す**（fail-safe）
- フック自体が壊れたら（stdin が JSON でない等）→ **何も出さず exit 0**（fail-open）

この2つは別物として扱っています。**フック障害で全作業が止まるほうが損害が大きい**ので後者は通す。一方、解析の失敗は「静かに教訓を失う」という最悪の失敗モードなので、厳しい側に倒す。

### ③ 切り捨てない

🔴 が増えすぎたときに自動で truncate する実装は**あえて入れていません**。閾値を超えたら警告を出すだけです。

silent truncation は、②と同じ理由で禁止です。黙って消えたものには誰も気づけません。

## 7. ハマったところ

### 印を安売りすると、仕組みごと劣化する

この設計では、🔴 が**荷重部材**になります。🔴 だけが毎回読まれるので、

- 印を付けすぎる → 毎回のコストが膨らみ、分割した意味が消える
- 印を付け忘れる → **その教訓は二度と読まれない**

そこで「🔴 を付ける基準」を明文化しました。**知らないと事故るもの**（手戻り・データ損失・誤った公開・同じ失敗の再発）だけ。この基準を `lessons.md` の冒頭と `CLAUDE.md` の両方に書いています。

なお私の環境の 🔴 は現在 **26件・5,030字**です。閾値 8,000字にはまだ余裕がありますが、放っておけば必ず増えるものなので、警告が出たら棚卸しする運用にしています。

### 目次には節名だけでなく行番号を入れる

最初は節名だけの目次を考えていました。行番号を入れたのは、**`sed -n 'A,Bp'` 一発で引けるから**です。

節名だけだと範囲を切り出す `awk` 式が必要になるうえ、表記ゆれで外します。

### フックの検証は「deny 側」だけでは足りない

これは別のフック（危険なコマンドをブロックするもの）で踏んだ教訓ですが、共通です。

**「全部ブロックする」という壊れ方をしていても、ブロックのテストは全部通ります。**

通るべきものが通ることを必ず実測してください。今回のスクリプトにも回帰テストを13ケース書き、その中には「本番の `lessons.md` の全31節で、生成された行番号が実際の行と一致するか」を検証するケースを入れています。

### `~/.claude/scripts/` は Bash から書けないことがある

Claude Code のサンドボックスが有効な環境では、`~/.claude/scripts/` 配下は書き込み許可リストの外なので、Bash 経由（`cat > file` など）では書けません。

**Edit / Write ツールなら編集できます。** サンドボックスの制限とツールの制限は別物なので、「Bash で弾かれた＝不可能」ではありません。

サンドボックスまわりの制限については、[Claude Code × WSL2 環境構築のハマりポイント集](/posts/claude-code-wsl2-pitfalls)にも書いています。

## まとめ

| | Before | After |
|---|---|---|
| 毎セッションの読み込み | 約36,000字（全文） | **約5,500字**（目次＋🔴） |
| 削減率 | — | **-85%** |
| 「知らないことを知る」経路 | あり | **あり**（目次＋印で維持） |

やったことを一言でまとめると、**「AI に読み方を指示する」のをやめて、「読むものを機械が選んで渡す」に変えた**、ということです。

前者は文章のお願いなので滑ります。後者はコードなので滑りません。`CLAUDE.md` に書いても守られないルールがあるなら、それはフックに移すサインです。

## 関連記事

- [Claude Code × WSL2 環境構築のハマりポイント集](/posts/claude-code-wsl2-pitfalls) — Node.js のバージョン、sudo、Sandbox の書き込み制限など、環境側の落とし穴
- [Claude Code（WSL2）でクリップボードの画像を渡す方法](/posts/claude-code-wsl2-clipboard-image) — 足りない機能をスキルの自作で埋める例
