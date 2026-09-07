<p align="center"><img src="https://img.shields.io/badge/license-Apache--2.0-blue.svg" alt="License: Apache-2.0"></p>

<p align="center"><a href="README.md">简体中文</a> · <a href="README.en.md">English</a> · <a href="README.ja.md">日本語</a></p>

# 🌱 Planto

*計画が根を張り、一歩ずつ育っていく。*

**「計画倒れ」しがちな人のための実行支援ツール。**

目標を**順番通りに進めなければならない**一連のキーイベントに分解し、1つ終える
たびに次が解放されます。時間ブロックを完了するとリアルタイムでポイントが貯まり、
自分で設定したご褒美リストと交換できます。「大量の ToDo リスト＋三日坊主」を
「大枠のフレーム＋即時フィードバック」に置き換える発想で、厳格な計画に縛られたく
ないけれど、少し背中を押してほしい人に向いています。

## ✨ 主な機能

- 🗓️ **カレンダー** —— 日 / 週 / 月 / 年ビュー、ドラッグ操作、繰り返しイベント、重なるイベントの自動横並び表示
- 📋 **計画（Plan）**：目標を順序付きのキーイベントに分解し、必ず順番に解放・完了する仕組み。同時に手を広げず、常に「今やるべき一つ」に集中できる
- 🎯 **興味リスト（Activity）**：自分で管理する個人用の参考資料（リンク／画像／メモ）。自動でスケジュールに組み込まれることはなく、あくまで自分で選んで使う
- 🏆 **ポイント報酬**：完了した時間ブロックがリアルタイムでポイントに変換され、自分で決めたご褒美リストと交換できる
- 🔁 **週間プラン自動生成**（任意）：年間を4フェーズに分けたリズム＋スマートスケジューリング
- 🔗 **Google カレンダー連携**（任意）：空き状況の取得、生成した計画のカレンダーへの反映
- 🌍 **中国語 / 英語 / 日本語** 対応

## 🔒 データとプライバシー

- ローカルファースト：実データはブラウザの OPFS 内にある SQLite ファイルに保存され、アカウント登録もバックエンドも不要
- ワンクリックで JSON バックアップの書き出し／読み込みが可能
- ブラウザのデータを消去するとローカルの記録は失われるため、事前にバックアップを書き出してください。端末を変える場合は手動でのインポートが必要
- ネットワーク通信が発生するのは任意の Google カレンダー連携のみ。設定しなければ通信は一切発生しない

## 🛠️ 技術スタック

[Vue 3](https://vuejs.org) + [Vite](https://vitejs.dev) · [Naive UI](https://www.naiveui.com) ·
[vue-i18n](https://vue-i18n.intlify.dev) · [sqlite-wasm](https://github.com/sqlite/sqlite-wasm)（OPFS 上で動くブラウザ内 SQLite、バックエンド不要）

## 🚀 クイックスタート

```bash
git clone https://github.com/yiran201/Planto.git
cd Planto
npm install
npm run dev      # ローカル開発、固定で http://localhost:6060
npm run build    # 本番ビルド、成果物は dist/ に出力
```

Windows では [`start-planto.bat`](start-planto.bat) をダブルクリック、macOS / Linux では
`chmod +x start-planto.sh && ./start-planto.sh` を実行してください。初回は自動で依存関係を
インストールし、そのまま開発サーバーを起動します。

> 独自の静的ホスティングにデプロイする場合、OPFS データベースに必要な COOP/COEP/CORP
> レスポンスヘッダーの設定が必要です。詳細は [`vite.config.js`](vite.config.js) を参照してください。
> [Releases](../../releases) ページにビルド済みの `dist/` と、これらのヘッダーを
> 自前で付与する依存ゼロの [`serve-dist.cjs`](serve-dist.cjs) を用意しています。
> ダウンロードして解凍し `node serve-dist.cjs` を実行するだけで、追加の依存関係や
> ビルド作業なしにそのまま動作します。リポジトリには GitHub Pages 自動デプロイ用の
> ワークフロー（`.github/workflows/deploy-pages.yml`）も含まれています——静的
> ホスティングではカスタムヘッダーを設定できないため、代わりに Service Worker
> シム（`coi-serviceworker.js`）でブラウザ側からヘッダーを付与します。リポジトリの
> Settings → Pages でソースを「GitHub Actions」に設定すれば、`master` への push
> のたびに自動でビルド・デプロイされます。自前の Nginx/Apache/Tomcat/Node への
> デプロイ設定例は [`DEPLOYMENT.md`](DEPLOYMENT.md)（現時点では中国語のみ）を
> 参照してください。

## 🔗 Google カレンダー連携（任意）

1. [Google Cloud Console](https://console.cloud.google.com/) でプロジェクトを作成し、**Calendar API** を有効化
2. OAuth クライアント ID（ウェブアプリケーション）を作成し、ローカルの実行アドレスを承認済み生成元に設定
3. 取得した Client ID を Planto の「設定 → Google 同期」パネルに貼り付けてログイン

アプリ内の同パネルにも同じ手順のガイドとワンクリックコピーが用意されているため、
ドキュメントを別途確認する必要はありません。

## 📖 ドキュメント

モジュール構成は [`docs/MODULES.md`](docs/MODULES.md)、開発ルール・タスク履歴・変更履歴は
[`docs/AGENTS.md`](docs/AGENTS.md) / [`docs/REQUESTS.md`](docs/REQUESTS.md) /
[`docs/CHANGELOG.md`](docs/CHANGELOG.md) を参照してください（現時点では中国語で管理されています）。

## 📄 ライセンス

[Apache License 2.0](LICENSE)

## 🤝 コントリビュート

Issue や Pull Request を歓迎します。役に立ったらぜひ ⭐️ をお願いします。
