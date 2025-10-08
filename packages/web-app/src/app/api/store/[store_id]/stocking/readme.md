# 仕入れAPI一覧

## 定義ファイル

/api/store/[store_id]/stocking/api.d.ts

### CSV仕入れAPI

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/stocking/csv/` |
| メソッド | POST |
| 権限 | corp |
| 処理内容 | ・CSVファイルを使って仕入れを行うことができる<br>・仕入れレコードは作成せず、在庫変動履歴のみ残る<br>・仕入れ先の登録も可能 |
| 備考 | |

### 仕入れ先登録・更新API

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/stocking/supplier/` |
| メソッド | POST |
| 権限 | corp |
| 処理内容 | ・仕入れ先の登録、更新を行うことができる<br>・IDを指定することで更新処理となる |
| 備考 | |

### 仕入れ先取得API

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/stocking/supplier/` |
| メソッド | GET |
| 権限 | corp |
| 処理内容 | ・ID、表示名、有効/無効などで仕入れ先を検索できる |
| 備考 | |

### 入荷登録API

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/stocking/` |
| メソッド | POST |
| 権限 | corp |
| 処理内容 | ・入荷情報の登録、更新を行うことができる<br>・IDを指定することで更新処理となる |
| 備考 | |

### 入荷実行API

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/stocking/[stocking_id]/apply/` |
| メソッド | POST |
| 権限 | corp |
| 処理内容 | ・入荷を実行することができる<br>・担当者ID、実際の入荷日、実際の入荷個数などの入力が必要 |
| 備考 | |

### 入荷キャンセルAPI

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/stocking/[stocking_id]/cancel/` |
| メソッド | POST |
| 権限 | corp |
| 処理内容 | ・入荷をキャンセルすることができる |
| 備考 | |

### 入荷情報取得API

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/stocking/` |
| メソッド | GET |
| 権限 | corp |
| 処理内容 | ・ステータスや商品名などの条件を指定して入荷情報を取得できる |
| 備考 | |
