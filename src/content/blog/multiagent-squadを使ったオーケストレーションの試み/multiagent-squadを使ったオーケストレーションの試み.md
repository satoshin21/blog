---
title: Zellij, Claude Code, Geminiを使ったオーケストレーションの試み
pubDate: 'Feb 22 2026'
published: true
---

年明けにZennで公開された Claude Code を使ったマルチエージェント・システム `multiagent-shogun` を読ませてもらいました。

https://zenn.dev/shio_shoppaize/articles/5fee11d03a11a1

内容の軽快さもあってめちゃくちゃ面白い。世の中はマルチエージェントで開発チームを構築し運用している利用例を多く見かけるようになりました。<br>
だいたい tmux で画面分割しつつエージェントを複数起動して動かす形が主流なんですが、自分の環境ではターミナルマルチプレクサに Zellij を使ってるのでそのままでは使えませんでした。

https://github.com/zellij-org/zellij

そこで完全に個人用で Zellij 上でマルチエージェントチームを組める **multiagent-squad** を作りました。

## multiagent-squad

`multiagent-squad` は Zellij で指定したマルチエージェント環境を一発で立ち上げられます。

https://github.com/satoshin21/multiagent-squad

実際に動かしてる様子はこんな感じです。

![ウルトラワイドだとまだまだpaneの領域に余裕がありそう](/blog/images/multiagent-squad/multiagent-squad.png)

実装を始めるときは作業したいディレクトリで以下をたたくだけです。

```bash
multiagent --force
```

デフォルトだと次の2つのタブが立ち上がるレイアウトになってます。

1. **agent-teams**: タスクをこなすエージェントチーム用タブ
2. **review**: 人間がレビューする用のタブ

### agent-teams タブ

agent-teams タブはだいたいこんなレイアウトになってます。

<table>
  <tbody>
    <tr>
      <td rowspan="3">chief<br><span>(Claude Code)</span></td>
      <td>member-braze<br><span>(Claude Code)</span></td>
      <td>braze-handler<br><span>(Gemini)</span></td>
    </tr>
    <tr>
      <td>member-storm<br><span>(Claude Code)</span></td>
      <td>storm-handler<br><span>(Gemini)</span></td>
    </tr>
    <tr>
      <td>member-frost<br><span>(Claude Code)</span></td>
      <td>frost-handler<br><span>(Gemini)</span></td>
    </tr>
  </tbody>
</table>

#### Chief

Chief は **このチームの指揮官** です。主な任務は自分とのやりとりで、基本的に自分は Chief と話しながら作業を進めてます。

- この Issue に取り掛かって
- AI Label がついた Issue を順番にやって
- 自分の Pull Request にアクションが必要なら教えて

みたいな依頼をするとタスクの分析や必要情報の取得・各メンバーへの割り振りをやってくれます。メンバーからの作業報告も受け取って自分に報告してくれる感じです。

#### Member

Braze, Storm, Frost は **実装とか実際の作業をするエージェント** です。最初は6人にしてたんですが、
- **--dangerously-skip-permissions** を付けない今の運用だと、各メンバーの作業状況を把握するのがかなり厳しい
- iOS 開発で並列にビルドを走らせると、3人くらいがちょうどいい

という理由で、いまは3人にしてます。

各メンバーは **独立した worktree で作業** する形にしてます。ブランチは Issue ごとに作って運用してるので各エージェントには `git switch` の権限を渡しつつ、与えられた Issue に応じてタスクをこなす形です。

#### Handler

各 Member には専任の Handler が Gemini で待機してます。主な任務は **コードレビューとタスク分析** で Member とコミュニケーションする形です。実装がひと段落したタイミングで Handler にコードレビューを依頼する運用にしてます。<br>
Gemini にしたのはやっぱりあの巨大なコンテキストウィンドウでプロダクト全体のコードベースを理解させるのに向いてると思ったからです。ここは今後いろいろ試していきたいです。

### review タブ

自分がレビューする用のシンプルなタブです。

<table>
  <tbody>
    <tr>
      <td>review</td>
      <td>review claude<br><span>(Claude Code)</span></td>
    </tr>
  </tbody>
</table>

review タブではエージェントチームの成果物をひとつずつ検証していきます。ここで Claude と二人三脚でコードをブラッシュアップして最終的に Pull Request をオープンするまでやってます。持っていきます。

## pane 間のメッセージ送受信

pane 間のメッセージ送受信は以下の記事で紹介されてた `zellij-send-keys` を参考に、pane 名をキーにメッセージを送受信する `zellij-send-pane-name` というスクリプトを作って運用してます。

https://zenn.dev/atani/articles/zellij-send-keys-tmux-like-plugin

```bash
send-to-pane-name "braze-handler" "===
from: member-braze
message: コード変更をレビューしてくれ。変更ファイル: src/utils/helper.go
==="
```

pane 名をキーにしておくと後から pane を増やしたくなったときも動的に運用できるし、pane 間のメッセージのやりとりも ID より見通しがよいので送受信をミスったときもデバッグしやすい作りになってます。

メッセージのフォーマットは区切り線に `===` を使うことを instruction ファイルで必須にしてます。`send-to-pane-name` はテキスト送付と Enter の前に1秒 sleep 入れてるんですが、複数の pane から Chief に同時に送るとメッセージがくっついてしまうことがよくありました。区切り線を必須にしたおかげで同時送信されてもメッセージの境目が分かるので受け取り側もどこから来たメッセージか扱いやすくなってます。

## Instruction ファイル

`multiagent init` を実行すると `.config` にだいたいこんな感じで instruction ファイル一式が生成されます。

```
multiagent-squad
 ├── instruction_leader.md # Chief用の指示
 ├── instruction_member.md # Member用の指示
 └── teams.kdl # Zellijのレイアウト
```

Zellij のいいところのひとつが事前に作った KDL ファイルを読み込んで一発でレイアウトをセットアップできることです。後で pane を追加したくなったときもレイアウトの変更が簡単にできます。

<script src="https://emgithub.com/embed-v2.js?target=https%3A%2F%2Fgithub.com%2Fsatoshin21%2Fmultiagent-squad%2Fblob%2Fmain%2Finternal%2Fembed%2Fsquad.kdl&style=default&type=code&showBorder=on&showLineNumbers=on&showFileMeta=on&showFullPath=on&showCopy=on"></script>


## 運用方針と人間の役割

チームの運用はだいたいこんなフローで回してます。

1. 自分から Chief に指示を出す（例: AI Label がついたやつを優先順位通りにとりかかって）
2. Chief がタスクを軽く理解して prompt を作成する
3. Chief が暇なメンバーに `send-to-pane-name` でタスクを割り振る
4. メンバーが実装とテストを実行
5. 実装がひと段落したら Handler にレビューを依頼して修正があれば再実装する
6. 完了したら Draft PR を作成
7. Draft PR になった PR を review タブで checkout して検証して Open まで持っていく

Chief とメンバーは `--dangerously-skip-permissions` を **有効にしていない** ので push や commit・rm のたびに確認依頼が飛んできてそれを念の為みながら作業をしています<br>人間の役割は最終チェックもしつつ実装中にもちょっかいをかけてくる **めちゃくちゃマイクロマネジメントしてくる外部のステークホルダー** みたいな立ち位置です。なかなか厄介だ……。

### Tips 1: worktree はブランチごとに作らない

worktree は作らず基本的に各メンバーをそれぞれ専用の worktree に移動させるだけにしてます。

- team-member/chief
- team-member/braze
- team-member/storm
- team-member/frost
- review

Claude Code をいじり始めた頃はブランチごとに worktree を作ってたんですが、毎回セットアップに時間かかるし、都度 Claude のインスタンスを開始しなきゃいけなくて結構面倒でした。<br>
ブランチの switch 権限を各メンバーに渡して作業を切り替えさせたほうが個人的には快適にすごせてます。

### Tips 2: Claude Code の allow-tools を同期する

`--dangerously-skip-permissions` を付けていない以上、`~/.claude/settings.json` の allow-tools をどう更新して各メンバーと揃えるかがスピードに直結します。`.claude/settings.local.json` と `~/.claude/settings.json` を定期的に同期する skill を作って定期的に同期する仕組みを入れておくとだんだん快適になっていきます。

## 実際に運用してみて

とりあえず雑にタスクを依頼してもチームメンバーの進捗を管理しつつそれぞれのメンバーに割り振って作業を進めてくれるのでありがたいです。

ただ前述のとおりお仕事ではまだ安心して任せきれてないのとレビューコストが大きいので最高速が出せてる感覚はあんまりないです。与えてるコンテキストやガイドライン・ガードレールを定期的に育てていくことで解消していけるかなーとも思ってます。子供と一緒、ゆっくり育てていこう。