# セールAPI一覧

## 定義ファイル

/api/store/[store_id]/sale/api.d.ts

### セール登録・更新API

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/sale/` |
| メソッド | POST |
| 権限 | corp |
| 処理内容 | ・セールを作成・更新できる<br>・IDを指定することで更新が可能<br>・セール名、開始/終了日時、割引量、商品/部門の指定などが可能<br>・繰り返し設定も可能 |
| 備考 | |

### セール削除API

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/sale/[sale_id]/` |
| メソッド | DELETE |
| 権限 | corp |
| 処理内容 | ・指定したセールを削除する |
| 備考 | |

### セール取得API

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/sale/` |
| メソッド | GET |
| 権限 | corp |
| 処理内容 | ・セール情報を取得する<br>・ID、ステータス、中止状態などで絞り込み可能<br>・商品情報、部門情報も含めて取得可能 |
| 備考 | |

### セールステータス更新API

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/all/sale/update-status/` |
| メソッド | POST |
| 権限 | bot |
| 処理内容 | ・全セールのステータスを確認し必要な更新を行う<br>・AWS EventBridgeによる定期実行を想定 |
| 備考 | |
