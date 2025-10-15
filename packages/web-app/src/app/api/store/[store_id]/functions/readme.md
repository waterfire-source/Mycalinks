# その他処理API一覧

## 定義ファイル

/api/store/[store_id]/functions/api.d.ts

### 画像アップロードAPI

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/functions/upload-image/` |
| メソッド | POST |
| 権限 | corp |
| 処理内容 | ・画像ファイルをアップロードする<br>・アップロード可能な画像形式はJPEG、PNG、GIF、WebP、SVG<br>・アップロードする画像の種類を指定する必要がある（商品、取引、店舗など） |
| 備考 | ・アップロード完了後、画像のURLが返却される |
