＝背景＝
現在、
packages/web-app/src/app/api/store/[store_id]/item/def.ts
で定義されているようなAPI定義書を
packages/api-generator/src/defs/item/def.ts
で定義されているようなAPI定義書（zodを使ったOpenAPIに合わせた形式）に変換しようと思っています

item関連のAPIはすでにいくつか変換しており、付随してAPIのルーター（route.ts）も一部書き換えています

＝指示＝
同様にして、このプロジェクトの中のすべてのdef.tsの定義書をOpenAPIのものに変換してください

＝条件＝
api-generator内で定義している分野（OpenAPIのtagとして利用しているもの）についても適切に定義してください。なお、分野はネストしないでください

また、route.tsの中でAPI定義書の型を抽出（typeof）している場面がいくつかありますが、そこではapi-generatorからインポートできるApiResponseというジェネリクス型を使って型を抽出してください

TypeScriptのエラーが出ないようにしてください
