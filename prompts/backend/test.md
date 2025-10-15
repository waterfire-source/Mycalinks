＝背景＝
現在Next.jsのAPI Routesで定義しているAPIを、api-generator上で定義しているdef.tsを用いつつ、BackendApiTestを使ってAPIの統合自動テストを開発しようとしています

すでに
packages/web-app/src/app/api/store/[store_id]/item/genre/route.test.ts
などのように一部作ってあります

＝指示＝
api-generatorで定義されているすべてのAPIに対しての自動テストを作成してください

＝条件＝
一度に複数のAPIを叩くシナリオテストは作成しないでください
具体的なリソースのIDが必要な場合、
packages/web-app/src/api/backendApi/test/constant.ts
などで取得してください
ここになかったら、リソースのIDを使うようなテストは作成しないでください
