# 棚卸API一覧

## 定義ファイル

/api/store/[store_id]/inventory/api.d.ts

### 棚登録・更新API

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/inventory/shelf/` |
| メソッド | POST |
| 権限 | corp |
| 処理内容 | ・棚を登録できる<br>・IDを指定することで更新も可能 |
| 備考 | |

### 棚削除API

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/inventory/shelf/[shelf_id]/` |
| メソッド | DELETE |
| 権限 | corp |
| 処理内容 | ・棚の削除（物理削除） |
| 備考 | |

### 棚取得API

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/inventory/shelf/` |
| メソッド | GET |
| 権限 | corp |
| 処理内容 | ・棚の取得 |
| 備考 | |

### 棚卸作成・更新API

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/inventory/` |
| メソッド | POST |
| 権限 | corp |
| 処理内容 | ・棚卸しの下書きの作成と下書きの更新を行える<br>・棚卸しを完了させる時は棚卸実行APIを利用するため、いかなる時でも一度下書きを作る必要がある |
| 備考 | |

### 棚卸実行API

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/inventory/[inventory_id]/apply/` |
| メソッド | POST |
| 権限 | corp |
| 処理内容 | ・棚卸の確定ができる<br>・確定時の販売価格を使って実際の在庫の合計販売価格・在庫数と理論上の在庫の合計販売価格・在庫数を算出し、Inventoryのテーブルに格納する |
| 備考 | |

### 棚卸削除API

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/inventory/[inventory_id]/` |
| メソッド | DELETE |
| 権限 | corp |
| 処理内容 | ・棚卸の削除ができる<br>・ステータスが下書きのものに限る<br>・物理削除 |
| 備考 | |

### 棚卸取得API

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/inventory/` |
| メソッド | GET |
| 権限 | corp |
| 処理内容 | ・棚卸しの情報を取得できる |
| 備考 | |
