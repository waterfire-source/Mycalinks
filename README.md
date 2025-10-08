### 環境構築(本プロジェクトではnpm, nodeのバージョン管理にvoltaを利用しているのでinstallしてない場合はinstallしてください)

```bash
curl https://get.volta.sh | bash
```

```bash
npm i -g pnpm //pnpmの導入

pnpm i
pnpm run build:backend-core // APIサーバーのビルド
pnpm run dev:web-app // フロントエンドのビルド
```

## 困った時

### prisma関連のエラー

- pnpm run prisma:generateをしてみる（最新のスキーマファイルから型などを再生成する）
- devサーバーを閉じて起動し直す
- （一応）pnpm iを実行する
- 齊田（バックエンド担当）に相談する
  - 相談する時は、devサーバーのエラーログを共有していただけると助かります

### API関連のエラー

- devサーバーを再起動し直す
- 齊田（バックエンド担当）に相談する
  - Slackのinfo-myca-errorチャンネルに届いているエラースレッドを参照して報告していただけると助かります🙇

## アクセス

### 顧客公開環境

<https://pos.mycalinks.com/>  
お金を払って契約してくださった顧客が使う用。さらに厳重に扱う必要がある

### 本番環境

<https://pos.mycalinks.io/>  
Myca店舗のみで使う本番環境、厳重に扱う必要がある

### ステージング環境

<https://staging.pos.mycalinks.io/>  
ステージング環境 最悪DBがリセットされても大丈夫

### ローカル環境

<http://localhost:3020/>
`pnpm run dev:web-app` でNext.jsのdevサーバーを起動

＝API定義＝
<http://localhost:3020/docs/api>

## ブランチ

### customer

顧客公開環境
原則このブランチはproductionからのみマージする
マージすると顧客公開環境に自動反映

### production

このブランチにマージすると本番環境に自動反映（20分くらい）  
また、ステージングDBに対して行ったマイグレーションもこのタイミングで実行される

### develop

開発用メインブランチ。このブランチへのプルリクを立てた時に自動でビルドテストが行われる
マージするとステージング環境に自動反映

## スクリプト（pnpm run）

### 依存パッケージの追加

Next.jsに依存パッケージを追加する時、このプロジェクトでは
`pnpm i --filter web-app`

### dev:web-app

開発用ローカルサーバーを起動。3020ポートでアクセス可能（LANならIPv4指定で他のデバイスからも閲覧可能）

### prisma:generate

データベースの型やenumなどをジェネレートするコマンド
データベーススキーマに変更があった後、実行しないといけない

### api:generate

データベースの型からzodスキーマを生成しつつ、一部zodを使って書かれたバックエンドのAPI定義変数から自動でOpenAPI形式のドキュメントを生成
そのドキュメントからフロントエンド用のクライアントコードの生成も行う

```typescript
import { MycaPosApiClient } from 'api-generator';

const client = new MycaPosApiClient();

const someFunc = async () => {
  const res = await client.item.createBundle({
    storeId: 3,
    requestBody: {
      sell_price: 1000,
      init_stock_number: 100,
      display_name: 'テストバンドル',
      expire_at: '2025-05-01',
      start_at: '2025-04-01',
      genre_id: 1,
      image_url: 'https://example.com/image.jpg',
      products: [
        {
          product_id: 1,
          item_count: 1,
        },
      ],
    },
  });

  console.log(res);
};
```

クライアントはこのようにして使う

### migrate

ステージング環境データベースへのマイグレーションスクリプトの作成&実行（ローカル用）  
マイグレーションについては詳しくは後述

### migrateScript

マイグレーションスクリプトだけを作成する。ここで作成されたスクリプトに、マイグレーション時に実行させたいSQLを直接入れる

### migrateFunctions

トリガーやストアドプロシージャだけ更新

## 開発ツール、環境

### Node.js

v23.9.0（Voltaでpin）

### pnpm

v10.10.0（pnpmはvoltaでpinできないのでinstallは以下のコマンド実行）

```bash
volta install pnpm@10.10.0
```

### パッケージ管理

pnpm

## コンフリクト解消手順

1. リモートdevelopブランチをローカルに取り込む
   git fetch origin develop
2. featureブランチに最新のdevelopをマージする
   git merge origin/develop
3. merge後コンフリクトを解消
4. PRからmergeする
5. PRからmergeする

## gitメモ

全てリモートのdevelopブランチ環境に（強制的に）戻す
`git fetch origin develop`
`git reset --hard origin/develop`

コミットリセット
git reset --soft HEAD~

ブランチを削除(マージ済みじゃないものも)
git branch -D ブランチ名

新しいブランチを作成する
git checkout -b ブランチ名

## マイグレーション手順

基本的には最新のマイグレーション履歴を持っているブランチ（ほとんどの場合develop）でpnpm run migrateを行い、名前などを指定するだけでマイグレーションスクリプトを作成可能。

この時に最新のマイグレーション履歴がないと、データベース上の履歴と同期していないとみなされ、一度すべてのデータがリセットされてしまう（警告は出る）ため、そういった場合はリセットするのではなく、最新のdevelopブランチをローカルにプルした上で、  
`git checkout develop -- packages/backend-core/prisma`  
などを行うなどして、マイグレーション履歴を一旦最新のものにする（マージするよりは、checkoutでマイグレーション履歴だけ持ってくる方が良いと思われる）

また、万が一データベース上の履歴と同期できなくなってしまった場合、一度マイグレーション履歴をローカル、データベース共に削除して、0_initマイグレーションを作って強制的にresolvedにすることで、とりあえず同期させることができるためデータの損失は防げる
<https://www.prisma.io/docs/orm/prisma-migrate/getting-started>

なお、マイグレーション履歴が消えてしまうため、そもそもそうならないように気をつける必要がある

本番環境へのデプロイについては、productionへのマージ時に自動的に行われる

## デプロイについて

このプロジェクトではdevelopブランチにマージすることでステージング環境へ自動デプロイされ、
productionブランチにマージすることで本番環境へ自動デプロイ（and マイグレーション）することができる

基本的にcopilot-cli（v1.34）をローカルにインストールして認証を行ったらデプロイ関連の一通りのコマンドが使える

デプロイ
`copilot deploy`

環境デプロイ
`copilot env deploy`

パイプラインのデプロイ
`copilot pipeline deploy`

実行中コンテナへのログイン
実行中コンテナへのログイン（複数タスクが立ち上がっている時はそのうちの一つにログイン）  
`copilot svc exec`

パイプラインの進捗状況についてはコンソール画面から確認できる
<https://ap-northeast-1.console.aws.amazon.com/codesuite/codepipeline/pipelines/pipeline-pos-staging-Pipeline-nLnXI9ziHXpD/view?region=ap-northeast-1>

もしくは
`copilot pipeline status`
でCIから確認もできる

ローカルでのサービスの確認
`copilot run local`
で環境を選択して実行（productionにすると本番dbマイグレーションが走るため注意）
なお、ローカルでの確認時、基本的にホットリロードされるdevサーバーを立ち上がるようにはしてないので、開発では使わない（サービス設定に誤りがないかなどを確認する時に使う）

Lambda関数についてはcopilotではなくsamを利用しているが、
copilotで定義しているpipelineに同梱しているため同時にデプロイされるようになっている

## ゴールデンルール（とりあえずこれは守りましょう）

- production, developに直接プッシュしない
- stagingにあげた後15分ほど待ってから必ず動作確認し、その後productionブランチへマージ
- 変数名はキャメルケース
- ファイル名はコンポーネント.tsx以外はキャメルケース。コンポーネント.tsxはパスカルケース
- クラス名はパスカルケース
- page.tsxはdefault export, それ以外のコンポーネントは基本的にnamed export
- 高凝集、疎結合になるように意識する
- eslint, prettierがちゃんと動くように設定する
- 原則として一度リリースした機能関連のテーブルのカラムは削除しない（影響範囲が未知数なため） 削除したい場合はチーム全体に確認する

## インフラ

インフラ図 202504時点
<https://drive.google.com/file/d/1ywAtPoaxoQev6dl0x-JBQrecK1XgdxGc/view?usp=drive_link>

NAT
EIP 本番→52.199.36.225 ステージング→54.178.193.202

## MRN

mycaのresource name
ログなど、リソースを一元的に扱うような場面での識別子として使いたい

myca:（サービスの種類 pos|app）:（リソースの種類 item|product|account...etc）:（リソースの識別子 整数|文字列）@corporation:（corporation所有のものの場合そのID）:store:（store所有のものの場合、そのID）

例）
mrn:myca:pos:product:1234@corporation:1:store:1

つまり@までは確実に入るとして、@以降は任意（なくても特定は一応できる）
@以降が無くても、@自体の記述は必要

## フロントエンドディレクトリ構成

### 構造

```plaintext
web-app/
├ .next/
├ node_modules/
├ public/
│   └ …
├ src/
│   ├ app/
│   │   ├ layout.tsx            # アプリ共通レイアウト (ヘッダー・フッター)
│   │   ├ page.tsx              # トップページ
│   │   ├ dashboard/
│   │   │   ├ page.tsx          # Dashboard ページ
│   │   │   ├ components/      # ページ固有コンポーネント
│   │   │   │   └ DashboardWidget.tsx
│   │   │   └ hooks/           # ページ固有フック
│   │   │       └ useDashboardData.ts
│   ├ common/
│   │   └ utils/               # 全体共通ユーティリティ関数
│   │       ├ dateUtils.ts
│   │       └ stringUtils.ts
│   ├ feature/                 # ドメイン機能ごと
│   │   ├ account/
│   │   │   ├ components/
│   │   │   │   ├ AccountList.tsx
│   │   │   │   └ AccountForm.tsx
│   │   │   └ hooks/
│   │   │       └ useAccount.ts
│   │   └ product/
│   │       ├ components/
│   │       └ hooks/
│   ├ components/          # 全体共通UIコンポーネント
│   │   └ buttons/
│   │        └ PrimaryButton.tsx
│   ├ frontend/
│   │   └ api/
│   │       ├ implement.ts       # API呼び出し統括、旧APIでつかわれている
│   │       └ account/
│   │           └ implement.ts    # getAccount, createAccountなど
├ tsconfig.json
├ next.config.js
└ package.json
```

### 役割

- **src/app/layout.tsx**
  アプリ全体共通レイアウト (ヘッダー・フッター・ナビ)

- **src/app/**
  ページごとにフォルダを分け、`page.tsx`に画面コンポーネントを配置。
  ページ固有の`components`, `hooks`を同階層にまとめる。

- **src/components**
  全体共通UIコンポーネント (例: Button, Modal)

- **src/common/utils**
  共通ユーティリティ関数 (日付計算、文字列加工)

- **src/feature/**
  ドメイン機能ごとにフォルダを作成し、`components`, `hooks`をまとめる。

- **src/frontend/api/**

  - `implement.ts`: 各ドメインAPI呼び出しの統括入口
  - `account/implement.ts`: `getAccount`, `createAccount`などのAPI呼び出しロジック(openAPIにより自動生成されるではimplement)
