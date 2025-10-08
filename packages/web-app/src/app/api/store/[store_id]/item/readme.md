# 商品マスタAPI一覧

## 定義ファイル

/api/store/[store_id]/item/api.d.ts

### 商品マスタ一覧取得API

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/item/` |
| メソッド | GET |
| 権限 | corp |
| 処理内容 | ・商品マスタ情報を取得できる<br>・検索条件を指定して絞り込みができる<br>・在庫情報も同時に取得可能 |
| 備考 | |

### 商品マスタCSV取得API

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/item/csv/` |
| メソッド | GET |
| 権限 | corp |
| 処理内容 | ・商品マスタ情報をCSVファイルで取得できる |
| 備考 | |

### 商品マスタ情報変更API

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/item/[item_id]/` |
| メソッド | PUT |
| 権限 | corp |
| 処理内容 | ・商品マスタの情報を更新できる |
| 備考 | |

### 商品マスタ登録API

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/item/` |
| メソッド | POST |
| 権限 | corp |
| 処理内容 | ・商品マスタを新規登録できる<br>・登録と同時に在庫情報も生成される |
| 備考 | |

### 商品マスタCSVアップロードAPI

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/item/csv/` |
| メソッド | POST |
| 権限 | corp |
| 処理内容 | ・CSVファイルで商品マスタを一括登録/更新できる<br>・価格更新も可能 |
| 備考 | |

### オリジナルパック作成API

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/item/original-pack/` |
| メソッド | POST |
| 権限 | corp |
| 処理内容 | ・オリジナルパックを作成できる<br>・商品マスタと在庫情報が同時に生成される |
| 備考 | |

### バンドル商品作成API

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/item/bundle/` |
| メソッド | POST |
| 権限 | corp |
| 処理内容 | ・複数商品をまとめたバンドル商品を作成できる |
| 備考 | |

### 部門取得API

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/item/department/` |
| メソッド | GET |
| 権限 | corp |
| 処理内容 | ・商品マスタの部門情報を取得できる |
| 備考 | |

### 部門登録API

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/item/department/` |
| メソッド | POST |
| 権限 | corp |
| 処理内容 | ・商品マスタの部門を新規登録できる |
| 備考 | |

### 部門更新・削除API

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/item/department/[department_id]/` |
| メソッド | PUT |
| 権限 | corp |
| 処理内容 | ・部門情報の更新、削除ができる |
| 備考 | |
