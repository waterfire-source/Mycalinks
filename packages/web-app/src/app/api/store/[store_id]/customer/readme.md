# 顧客API一覧

## 定義ファイル

/api/store/[store_id]/customer/api.d.ts  
/api/store/all/customer/api.d.ts（全てのストア用）  

### 顧客登録&取得API

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/customer/` |
| メソッド | POST |
| 権限 | corp |
| 処理内容 | ・Mycaアプリの会員情報を使って顧客登録/取得ができる<br>・POS会員バーコードでも顧客情報を取得可能<br>・新規POS会員の登録も可能 |
| 備考 | |

### 顧客一覧取得API

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/customer/` |
| メソッド | GET |
| 権限 | corp |
| 処理内容 | ・顧客情報を取得できる<br>・IDなどで条件を指定して絞り込み可能<br>・取引の統計情報も同時に取得可能 |
| 備考 | |

### 付与可能ポイント取得API

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/customer/[customer_id]/addable-point/` |
| メソッド | GET |
| 権限 | corp |
| 処理内容 | ・お会計金額から付与できるポイントを計算できる |
| 備考 | |
