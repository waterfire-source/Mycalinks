# 商品API一覧

## 定義ファイル

/api/store/[store_id]/product/api.d.ts

### 商品一覧取得API

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/product/` |
| メソッド | GET |
| 権限 | なし |
| 処理内容 | ・Productモデルベースで販売用商品一覧を取得することができる<br>・qrTokenパラメータを使うことで、QRコードを入力して特定の商品の情報を取得することもできる<br>・商品にセール情報が結び付けられている場合、有効なセール（期間内）をsalesプロパティにまとめる |
| 備考 | |

### 商品情報変更API

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/product/[product_id]/` |
| メソッド | PUT |
| 権限 | corp |
| 処理内容 | ・idによって商品情報を変更することができる<br>・変更できるフィールドには制限があるため、api.d.tsを要確認 |
| 備考 | |

### 商品在庫変動履歴取得API

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/product/[product_id]/history/` |
| メソッド | GET |
| 権限 | corp |
| 処理内容 | ・idによって特定商品の在庫変動履歴を取得することができる<br>・条件として日時や種類などを指定可能<br>・在庫変動履歴取得APIに統合するかもしれない |
| 備考 | |

### 在庫変動履歴取得API

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/product/stock-history/` |
| メソッド | GET |
| 権限 | corp |
| 処理内容 | ・条件などを指定して、特定のストアの在庫変動履歴を取得することができる |
| 備考 | |

### 商品転送API

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/product/[product_id]/transfer/` |
| メソッド | POST |
| 権限 | corp |
| 処理内容 | ・ある商品の在庫をある商品の在庫に転送することができる<br>・現状仕入れと結び付けているなどはなく、在庫変動履歴に残る形 |
| 備考 | |

### セール確認API

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/product/[product_id]/sale/` |
| メソッド | GET |
| 権限 | なし |
| 処理内容 | ・ある商品がセール中かを確認することができる<br>・セール中だったら、何円になるのかを帰り値で判断することができる<br>・セール中だったら、あと何個その商品にそのセールを適用することができるのか判断することができる（特に個数制限がかけられていない場合は-1が帰ってくる） |
| 備考 | |

### パック開封API

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/product/[product_id]/open-pack/` |
| メソッド | POST |
| 権限 | corp |
| 処理内容 | ・Mycaのデータベース上のPackに紐づけられている商品、かつ在庫が十分にあったら開封してその内容を他の在庫として登録できる<br>・未登録商品の処理も行うことができる<br>・下書きを作成することもできる<br>・スマホからの追加送信にも対応 |
| 備考 | |

### 仕入れ値情報取得API

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/product/[product_id]/wholesale-price/` |
| メソッド | GET |
| 権限 | corp |
| 処理内容 | ・仕入れ値の履歴などを取得できる<br>・店で設定された方法によって仕入れ値を指定した個数だけ取り出して算出できる（現在は平均値） |
| 備考 | |

### タグ作成・更新API

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/product/tag/` |
| メソッド | POST |
| 権限 | corp |
| 処理内容 | ・タグの作成が行える<br>・IDを指定することで更新もできる<br>・genre1やgenre2などの指定もできる |
| 備考 | |

### タグ取得API

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/product/tag/` |
| メソッド | GET |
| 権限 | corp |
| 処理内容 | ・タグの取得ができる<br>・それぞれのタグに商品がいくつ紐づいているかも含めて取得することができる |
| 備考 | |

### タグ削除API

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/product/tag/[tag_id]/` |
| メソッド | DELETE |
| 権限 | corp |
| 処理内容 | ・タグの削除ができる<br>・物理削除 |
| 備考 | |

### タグ紐付けAPI

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/product/tag/attach/` |
| メソッド | POST |
| 権限 | corp |
| 処理内容 | ・タグを紐づけられる |
| 備考 | |

### タグ解除API

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/product/[product_id]/tag/[tag_id]/` |
| メソッド | DELETE |
| 権限 | corp |
| 処理内容 | ・タグを外せる |
| 備考 | |

### セット販売定義API

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/product/set-deal/` |
| メソッド | POST |
| 権限 | corp |
| 処理内容 | ・セット販売の定義を登録、更新することができる |
| 備考 | |

### セット販売削除API

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/product/set-deal/[set_deal_id]/` |
| メソッド | DELETE |
| 権限 | corp |
| 処理内容 | ・セット販売の削除 |
| 備考 | |

### セット販売取得API

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/product/set-deal/` |
| メソッド | GET |
| 権限 | corp |
| 処理内容 | ・セット販売の定義を取得することができる |
| 備考 | |

### セット販売適用チェックAPI

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/product/set-deal/check/` |
| メソッド | POST |
| 権限 | corp |
| 処理内容 | ・特定の組み合わせの商品について、いずれかのセット割引を適用することができるかどうか判断する<br>・一度に複数のセット割引を適用することができるパターンもあるため、セールのチェックの時みたいに結果は配列形式で返ってくる |
| 備考 | |

### 在庫数直接変動API

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/product/[product_id]/adjust-stock/` |
| メソッド | POST |
| 権限 | corp |
| 処理内容 | ・特定の在庫の数量を仕入れ値などを指定して直接変動させる |
| 備考 | |

### バンドル解体API

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/product/[product_id]/release-bundle/` |
| メソッド | POST |
| 権限 | corp |
| 処理内容 | ・バンドル商品の解体を行うことができる |
| 備考 | |

### オリパ解体API

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/product/[product_id]/release-original-pack/` |
| メソッド | POST |
| 権限 | corp, staff |
| 処理内容 | ・オリパの解体を行うことができる<br>・一度に全て解体することしかできない<br>・下書きを作成することもできる<br>・スマホからの追加送信にも対応 |
| 備考 | |

### パック開封履歴取得API

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/product/open-pack/` |
| メソッド | GET |
| 権限 | corp |
| 処理内容 | ・パック開封の履歴を取得することができる<br>・IDなどで絞り込み可能<br>・パック開封（ボックス開封・オリパ解体）を再開するときなどに利用する |
| 備考 | |

### パック開封情報サブスクライブAPI

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/product/open-pack/[pack_open_history_id]/` |
| メソッド | GET |
| 権限 | corp |
| 処理内容 | ・特定のパック開封の更新イベントをサブスクライブできるリアルタイムAPI |
| 備考 | |

### 在庫一覧CSV取得API

| 項目 | 値 |
|-----|-----|
| URL | `/api/store/[store_id]/product/csv/` |
| メソッド | GET |
| 権限 | corp |
| 処理内容 | ・在庫一覧のCSVファイルを取得することができるAPI<br>・今後条件を指定する機能などもつける予定<br>・S3にアップロードされたあとそのURLが返される形だが、セキュリティ対策は特にできていない（一応UUIDを使う様にはしているが） |
| 備考 | |
