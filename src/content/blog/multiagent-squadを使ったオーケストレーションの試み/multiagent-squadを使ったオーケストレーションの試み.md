---
title: Zellij, Claude Code, Geminiを使ったオーケストレーションの試み
pubDate: 'Feb 22 2026'
published: true
---

年明けにZennに公開されたClaude Codeを使ったマルチエージェント・システム`multiagent-shogun`を読ませてもらいました

https://zenn.dev/shio_shoppaize/articles/5fee11d03a11a1

内容の軽快さもあってめちゃくちゃ面白い。世の中はマルチエージェントで開発チームを構築し運用している利用例を多く見かけるようになりました。<br>
おおよそ見かける形としてはtmuxを利用して画面分割しつつエージェントを複数起動して動かすというのが主流ですが、私の環境ではターミナルマルチプレクサとしてZellijを活用しているため、そのまま利用することはできません。

https://github.com/zellij-org/zellij

そこでZellijでマルチエージェントチームを構築する, **multiagent-squad**を作成しました。

## multiagent-squad

`multiagent-squad`というCLI Toolを作りました。Zellijで指定したマルチエージェント環境を一発で立ち上げます。

https://github.com/satoshin21/multiagent-squad

実際に動かしている様子は↓のような形。

![ウルトラワイドだとまだまだpaneの領域に余裕がありそう](/blog/images/multiagent-squad/multiagent-squad.png)

レイアウトはデフォルトでは以下のような二つのタブが立ち上がるような形になっています

1. `agent-teams`: 実際にタスクをこなすエージェントチームタブ
2. `review`: 人間によるレビューを実施するタブ

### agent-teams tab
agent-teams tabでは以下のようなレイアウトになっています。

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

<p>

##### Chief
Chiefは**このチームにおける指揮官**の役割です。ユーザである私とのコミュニケーションが主な任務です<br>
基本的に私はChiefとコミュニケーションをとりながら作業を進めています。

- このIssueに取り掛かって
- AI LabelがついたIssueを順番に取り掛かって
- 私のPull Requestにアクションが必要なら教えて

のような問いかけに対してタスクの分析と必要な情報の取得、各メンバーへのタスクの割り振りを行う形です。またメンバーからも作業報告を受け取って私に作業報告もしてくれるような形です。

##### Member
Braze, Storm, Frostは**実際に実装その他作業を行うエージェント群**です。最初は6人とかにしていたんですが
- **--dangerously-skip-permissions**をしない今の運用では各メンバーの作業ステータスをおおよそ把握するのはかなり厳しい
- iOS開発で並列でビルドを走らせると3人ぐらいがちょいどいい

ということで3人にしています。

それぞれのメンバーは**独立したworktreeで作業**する形にしています。ただBranchはIssueごとに作成して動かすような形にしているので、各agentは`git switch`の権限は与えつつ与えられたIssueに応じてタスクを実行する形です。

##### Handler
Memberそれぞれには専任のHandlerがGeminiで待機しています。各メンバーの**コードレビューやタスクの分析**が主な任務で、Memberとコミュニケーションするような形になっています。
実装がひと段落終わった時など、良きタイミングでHandlerにコードレビューを依頼する形にしています。<br>
geminiを選択したのはやはりその巨大なコンテキストウィンドウを活かした全体のプロダクトコードベースへの理解が強いと思い一旦選択しています。こちらは今後いろいろと試していきたい

### review tab
こちらはめちゃくちゃシンプルで、ユーザによるレビューを行うタブです。

<table>
  <tbody>
    <tr>
      <td>review</td>
      <td>review claude<br><span>(Claude Code)</span></td>
    </tr>
  </tbody>
</table>

<p>

reviewタブではエージェントチームの成果物を一つ一つ検証を進めるためのタブです。ここでClaudeと二人三脚しながらコードのブラッシュアップを行い、最終的にPull Requestをオープンにしていく作業をしています。

## pane間のメッセージ送受信
pane間のメッセージ送受信に関しては、こちらで紹介されていた`zellij-send-keys`を参考に,`zellij-send-pane-name`というpane nameをキーにメッセージを送受信するscriptを作成して運用しています。

https://zenn.dev/atani/articles/zellij-send-keys-tmux-like-plugin

```bash
send-to-pane-name "braze-handler" "===
from: member-braze
message: コード変更をレビューしてくれ。変更ファイル: src/utils/helper.go
==="
```

pane nameをキーにすることで、paneを今後増やしたくなった時も動的に運用することができるし、pane間のメッセージのやりとりもidに比べて見通しもしやすく仮にメッセージの送受信にミスってたとしてもデバッグがしやすい作りになっています。

メッセージのフォーマットは`===`を区切り線にすることを順守するようinstructionファイルに追加しています。send-to-pane-nameはテキストの送付とエンターキー入力の前に1秒のsleepを入れているのですが、よくいくつかのpaneからメッセージがChiefに同時で送付されることでメッセージが合わさってしまうことがよくありました。区切り線を必須にすることで同時送付されてもメッセージの区切りが担保されるため受け取り側もどこからのメッセージかをハンドリングしやすくなっています。
