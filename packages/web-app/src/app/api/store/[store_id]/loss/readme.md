# ロスAPI一覧

## 定義ファイル

/api/store/[store_id]/loss/api.d.ts

### ロス登録API

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/loss/` |
| メソッド | POST |
| 権限 | corp |
| 処理内容 | ・商品や個数、理由などを指定してロスを登録できる<br>・在庫変動も同時に行われる |
| 備考 | |

### ロス区分登録API

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/loss/genre/` |
| メソッド | POST |
| 権限 | corp |
| 処理内容 | ・ロス区分を登録できる<br>・IDを指定することで名前を変更可能 |
| 備考 | |

### ロス区分削除API

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/loss/genre/[loss_genre_id]/` |
| メソッド | DELETE |
| 権限 | corp |
| 処理内容 | ・ロス区分を論理削除できる |
| 備考 | |

### ロス取得API

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/loss/` |
| メソッド | GET |
| 権限 | corp |
| 処理内容 | ・登録されているロスの一覧を取得できる<br>・ロス対象の商品IDや関連するロス区分の情報も取得可能 |
| 備考 | |
