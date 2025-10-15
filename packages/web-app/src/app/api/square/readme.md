# Square関連API一覧

## 定義ファイル

/api/square/def.ts

### OAuth同意画面URL取得API

| 項目 | 値 |
|-----|-----|
| URL | `/api/square/oauth/url/` |
| メソッド | GET |
| 権限 | corp |
| 処理内容 | ・OAuthのトークンを発行するための同意画面にアクセスするためのURLを発行する<br>・セキュリティ対策のための「state」も自動で生成され、クッキーにセットされる<br>・OAuthの同意後、コールバックURLは/api/square/oauth/callback/に設定されているが、そのAPIでトークンを算出してデータベースに格納後、自動でリダイレクトされる |
| 備考 | ・すでにSquare連携設定が済んでいる法人の場合はエラーとなる |
