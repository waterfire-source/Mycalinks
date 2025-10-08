# アプリ広告API一覧

## 定義ファイル

/api/store/[store_id]/app-advertisement/def.ts

### アプリ広告取得API

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/app-advertisement/` |
| メソッド | GET |
| 権限 | corp |
| 処理内容 | ・指定されたストアのアプリ広告のリストを取得することができる<br>・ステータスなどで絞り込むことができる |
| 備考 | |

### アプリ広告作成・更新API

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/app-advertisement/` |
| メソッド | POST |
| 権限 | corp |
| 処理内容 | ・アプリ広告を新しく作成することができる<br>・IDを指定することで既存の広告を更新することができる<br>・ステータスがFINISHEDであるものは編集できない（※確認中）<br>・作成、更新後にこのストアのアプリ広告のステータス更新関数を実行する |
| 備考 | |

### アプリ広告削除API

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/app-advertisement/[app_advertisement_id]/` |
| メソッド | DELETE |
| 権限 | corp |
| 処理内容 | ・指定されたアプリ広告を論理削除することができる<br>・どんな状態の広告でも論理削除できる（※確認中） |
| 備考 | |
