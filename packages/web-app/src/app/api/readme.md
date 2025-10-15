# API一覧

・基本的に、全てのAPIが500番レスポンス（サーバーエラー）や400番レスポンス（クライアントエラー）を持っているが、特殊なものはapi.d.tsでさらに説明してある  
・APIのカテゴリを下に示しているが、詳細なAPI定義についてはそれぞれのディレクトリに格納されているapi.d.tsファイルを参照すること

## レジAPI

### 定義ファイル

/api/store/[store_id]/register/api.d.ts

### 詳細仕様書

[レジAPI詳細仕様書](/src/app/api/store/[store_id]/register/readme.md)

| API名               | メソッド | URL                                                          | 処理内容                             | 詳細                                                                          |
| ------------------- | -------- | ------------------------------------------------------------ | ------------------------------------ | ----------------------------------------------------------------------------- |
| レジ内現金調整API   | PUT      | `/api/store/[store_id]/register/cash/`                       | レジへの入金、出金処理               | [詳細](/src/app/api/store/[store_id]/register/readme.md/#レジ内現金調整API)   |
| レジ情報取得API     | GET      | `/api/store/[store_id]/register/`                            | レジ内の現金情報や売上情報の取得     | [詳細](/src/app/api/store/[store_id]/register/readme.md/#レジ情報取得API)     |
| レジ精算API         | POST     | `/api/store/[store_id]/register/`                            | レジ締め処理、現金量の理論値との調整 | [詳細](/src/app/api/store/[store_id]/register/readme.md/#レジ精算API)         |
| レジ精算詳細取得API | GET      | `/api/store/[store_id]/register/settlement/[settlement_id]/` | 精算詳細と売上関係の詳細情報取得     | [詳細](/src/app/api/store/[store_id]/register/readme.md/#レジ精算詳細取得API) |

## 取引API

### 定義ファイル

/api/store/[store_id]/transaction/api.d.ts

### 詳細仕様書

[取引API詳細仕様書](/src/app/api/store/[store_id]/transaction/readme.md)

| API名                     | メソッド | URL                                                           | 処理内容                                        | 詳細                                                                                     |
| ------------------------- | -------- | ------------------------------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 取引作成API               | POST     | `/api/store/[store_id]/transaction/`                          | 販売/買取の取引レコード作成、在庫調整、決済処理 | [詳細](/src/app/api/store/[store_id]/transaction/readme.md/#取引作成API)                 |
| 取引取得API（店舗別）     | GET      | `/api/store/[store_id]/transaction/`                          | 過去の取引一覧取得、売上まとめの取得            | [詳細](/src/app/api/store/[store_id]/transaction/readme.md/#取引取得API)                 |
| 取引取得API（ID指定）     | GET      | `/api/store/[store_id]/transaction/[transaction_id]/`         | 特定取引のステータスや査定状況の取得            | [詳細](/src/app/api/store/[store_id]/transaction/readme.md/#取引取得API)                 |
| 取引取得API（全店舗）     | GET      | `/api/store/all/transaction/`                                 | 全店舗の取引一覧取得（Mycaアプリ用）            | [詳細](/src/app/api/store/[store_id]/transaction/readme.md/#取引取得API)                 |
| 取引詳細取得API（全店舗） | GET      | `/api/store/all/transaction/[transaction_id]/`                | 特定取引の詳細情報取得（Mycaアプリ用）          | [詳細](/src/app/api/store/[store_id]/transaction/readme.md/#取引取得API)                 |
| 顧客カート更新API         | PUT      | `/api/store/all/transaction/[transaction_id]/customer-cart/`  | 特定取引の顧客カート内容更新（Mycaアプリ用）    | [詳細](/src/app/api/store/[store_id]/transaction/readme.md/#取引取得API)                 |
| 完了済み取引変更API       | PUT      | `/api/store/[store_id]/transaction/[transaction_id]/`         | 完了済み取引の情報更新                          | [詳細](/src/app/api/store/[store_id]/transaction/readme.md/#完了済み取引変更API)         |
| 返品API                   | POST     | `/api/store/[store_id]/transaction/[transaction_id]/return/`  | 取引の返品＆返金処理                            | [詳細](/src/app/api/store/[store_id]/transaction/readme.md/#返品API)                     |
| レシート発行API           | GET      | `/api/store/[store_id]/transaction/[transaction_id]/receipt/` | レシート/領収書用HTML発行                       | [詳細](/src/app/api/store/[store_id]/transaction/readme.md/#レシート領収書用HTML発行API) |
| 取引キャンセルAPI         | POST     | `/api/store/[store_id]/transaction/[transaction_id]/cancel/`  | 取引のキャンセル処理                            | [詳細](/src/app/api/store/[store_id]/transaction/readme.md/#取引キャンセルAPI)           |
| 取引CSV取得API            | GET      | `/api/store/[store_id]/transaction/csv/`                      | 取引一覧のCSVファイル取得                       | [詳細](/src/app/api/store/[store_id]/transaction/readme.md/#取引一覧CSV取得API)          |
| 見積書発行API             | GET      | `/api/store/[store_id]/transaction/estimate/`                 | 見積書用HTML発行                                | [詳細](/src/app/api/store/[store_id]/transaction/readme.md/#見積書用HTML発行API)         |

## 販売/買取用商品API

### 定義ファイル

/api/store/[store_id]/product/api.d.ts

### 詳細仕様書

[商品API詳細仕様書](/src/app/api/store/[store_id]/product/readme.md)

| API名                           | メソッド | URL                                                                 | 処理内容                                     | 詳細                                                                                     |
| ------------------------------- | -------- | ------------------------------------------------------------------- | -------------------------------------------- | ---------------------------------------------------------------------------------------- |
| 商品一覧取得API                 | GET      | `/api/store/[store_id]/product/`                                    | 販売用商品一覧の取得、QRコードによる商品検索 | [詳細](/src/app/api/store/[store_id]/product/readme.md/#商品一覧取得API)                 |
| 商品情報変更API                 | PUT      | `/api/store/[store_id]/product/[product_id]/`                       | 商品情報の更新                               | [詳細](/src/app/api/store/[store_id]/product/readme.md/#商品情報変更API)                 |
| 商品在庫変動履歴取得API         | GET      | `/api/store/[store_id]/product/[product_id]/history/`               | 特定商品の在庫変動履歴取得                   | [詳細](/src/app/api/store/[store_id]/product/readme.md/#商品在庫変動履歴取得API)         |
| 在庫変動履歴取得API             | GET      | `/api/store/[store_id]/product/stock-history/`                      | 店舗の在庫変動履歴取得                       | [詳細](/src/app/api/store/[store_id]/product/readme.md/#在庫変動履歴取得API)             |
| 商品転送API                     | POST     | `/api/store/[store_id]/product/[product_id]/transfer/`              | 商品在庫の転送処理                           | [詳細](/src/app/api/store/[store_id]/product/readme.md/#商品転送API)                     |
| セール確認API                   | GET      | `/api/store/[store_id]/product/[product_id]/sale/`                  | 商品のセール状況確認                         | [詳細](/src/app/api/store/[store_id]/product/readme.md/#セール確認API)                   |
| パック開封API                   | POST     | `/api/store/[store_id]/product/[product_id]/open-pack/`             | パック商品の開封と在庫登録                   | [詳細](/src/app/api/store/[store_id]/product/readme.md/#パック開封API)                   |
| 仕入れ値情報取得API             | GET      | `/api/store/[store_id]/product/[product_id]/wholesale-price/`       | 商品の仕入れ値履歴取得                       | [詳細](/src/app/api/store/[store_id]/product/readme.md/#仕入れ値情報取得API)             |
| タグ作成・更新API               | POST     | `/api/store/[store_id]/product/tag/`                                | タグの作成・更新                             | [詳細](/src/app/api/store/[store_id]/product/readme.md/#タグ作成更新API)                 |
| タグ取得API                     | GET      | `/api/store/[store_id]/product/tag/`                                | タグ一覧の取得                               | [詳細](/src/app/api/store/[store_id]/product/readme.md/#タグ取得API)                     |
| タグ削除API                     | DELETE   | `/api/store/[store_id]/product/tag/[tag_id]/`                       | タグの削除                                   | [詳細](/src/app/api/store/[store_id]/product/readme.md/#タグ削除API)                     |
| タグ紐付けAPI                   | POST     | `/api/store/[store_id]/product/tag/attach/`                         | 商品へのタグ紐付け                           | [詳細](/src/app/api/store/[store_id]/product/readme.md/#タグ紐付けAPI)                   |
| タグ解除API                     | DELETE   | `/api/store/[store_id]/product/[product_id]/tag/[tag_id]/`          | 商品からのタグ解除                           | [詳細](/src/app/api/store/[store_id]/product/readme.md/#タグ解除API)                     |
| セット販売定義API               | POST     | `/api/store/[store_id]/product/set-deal/`                           | セット販売の登録・更新                       | [詳細](/src/app/api/store/[store_id]/product/readme.md/#セット販売定義API)               |
| セット販売削除API               | DELETE   | `/api/store/[store_id]/product/set-deal/[set_deal_id]/`             | セット販売の削除                             | [詳細](/src/app/api/store/[store_id]/product/readme.md/#セット販売削除API)               |
| セット販売取得API               | GET      | `/api/store/[store_id]/product/set-deal/`                           | セット販売定義の取得                         | [詳細](/src/app/api/store/[store_id]/product/readme.md/#セット販売取得API)               |
| セット販売適用チェックAPI       | POST     | `/api/store/[store_id]/product/set-deal/check/`                     | セット割引適用可否の確認                     | [詳細](/src/app/api/store/[store_id]/product/readme.md/#セット販売適用チェックAPI)       |
| 在庫数直接変動API               | POST     | `/api/store/[store_id]/product/[product_id]/adjust-stock/`          | 在庫数の直接調整                             | [詳細](/src/app/api/store/[store_id]/product/readme.md/#在庫数直接変動API)               |
| バンドル解体API                 | POST     | `/api/store/[store_id]/product/[product_id]/release-bundle/`        | バンドル商品の解体                           | [詳細](/src/app/api/store/[store_id]/product/readme.md/#バンドル解体API)                 |
| オリパ解体API                   | POST     | `/api/store/[store_id]/product/[product_id]/release-original-pack/` | オリパの解体処理                             | [詳細](/src/app/api/store/[store_id]/product/readme.md/#オリパ解体API)                   |
| パック開封履歴取得API           | GET      | `/api/store/[store_id]/product/open-pack/`                          | パック開封履歴の取得                         | [詳細](/src/app/api/store/[store_id]/product/readme.md/#パック開封履歴取得API)           |
| パック開封情報サブスクライブAPI | GET      | `/api/store/[store_id]/product/open-pack/[pack_open_history_id]/`   | パック開封更新のリアルタイム取得             | [詳細](/src/app/api/store/[store_id]/product/readme.md/#パック開封情報サブスクライブAPI) |
| 在庫一覧CSV取得API              | GET      | `/api/store/[store_id]/product/csv/`                                | 在庫一覧のCSVファイル取得                    | [詳細](/src/app/api/store/[store_id]/product/readme.md/#在庫一覧CSV取得API)              |

## 仕入れAPI

### 定義ファイル

/api/store/[store_id]/stocking/api.d.ts

### 詳細仕様書

[仕入れAPI詳細仕様書](/src/app/api/store/[store_id]/stocking/readme.md)

| API名                 | メソッド | URL                                                    | 処理内容                          | 詳細                                                                          |
| --------------------- | -------- | ------------------------------------------------------ | --------------------------------- | ----------------------------------------------------------------------------- |
| CSV仕入れAPI          | POST     | `/api/store/[store_id]/stocking/csv/`                  | CSVによる仕入れ処理、仕入れ先登録 | [詳細](/src/app/api/store/[store_id]/stocking/readme.md/#CSV仕入れAPI)        |
| 仕入れ先登録・更新API | POST     | `/api/store/[store_id]/stocking/supplier/`             | 仕入れ先の登録・更新              | [詳細](/src/app/api/store/[store_id]/stocking/readme.md/#仕入れ先登録更新API) |
| 仕入れ先取得API       | GET      | `/api/store/[store_id]/stocking/supplier/`             | 仕入れ先情報の取得                | [詳細](/src/app/api/store/[store_id]/stocking/readme.md/#仕入れ先取得API)     |
| 入荷登録API           | POST     | `/api/store/[store_id]/stocking/`                      | 入荷情報の登録                    | [詳細](/src/app/api/store/[store_id]/stocking/readme.md/#入荷登録API)         |
| 入荷実行API           | POST     | `/api/store/[store_id]/stocking/[stocking_id]/apply/`  | 入荷処理の実行                    | [詳細](/src/app/api/store/[store_id]/stocking/readme.md/#入荷実行API)         |
| 入荷キャンセルAPI     | POST     | `/api/store/[store_id]/stocking/[stocking_id]/cancel/` | 入荷のキャンセル                  | [詳細](/src/app/api/store/[store_id]/stocking/readme.md/#入荷キャンセルAPI)   |
| 入荷情報取得API       | GET      | `/api/store/[store_id]/stocking/`                      | 入荷情報の取得                    | [詳細](/src/app/api/store/[store_id]/stocking/readme.md/#入荷情報取得API)     |

## 棚卸API

### 定義ファイル

/api/store/[store_id]/inventory/api.d.ts

### 詳細仕様書

[棚卸API詳細仕様書](/src/app/api/store/[store_id]/inventory/readme.md)

| API名             | メソッド | URL                                                     | 処理内容               | 詳細                                                                       |
| ----------------- | -------- | ------------------------------------------------------- | ---------------------- | -------------------------------------------------------------------------- |
| 棚登録・更新API   | POST     | `/api/store/[store_id]/inventory/shelf/`                | 棚の登録・更新         | [詳細](/src/app/api/store/[store_id]/inventory/readme.md/#棚登録更新API)   |
| 棚削除API         | DELETE   | `/api/store/[store_id]/inventory/shelf/[shelf_id]/`     | 棚の削除               | [詳細](/src/app/api/store/[store_id]/inventory/readme.md/#棚削除API)       |
| 棚取得API         | GET      | `/api/store/[store_id]/inventory/shelf/`                | 棚情報の取得           | [詳細](/src/app/api/store/[store_id]/inventory/readme.md/#棚取得API)       |
| 棚卸作成・更新API | POST     | `/api/store/[store_id]/inventory/`                      | 棚卸下書きの作成・更新 | [詳細](/src/app/api/store/[store_id]/inventory/readme.md/#棚卸作成更新API) |
| 棚卸実行API       | POST     | `/api/store/[store_id]/inventory/[inventory_id]/apply/` | 棚卸の確定処理         | [詳細](/src/app/api/store/[store_id]/inventory/readme.md/#棚卸実行API)     |
| 棚卸削除API       | DELETE   | `/api/store/[store_id]/inventory/[inventory_id]/`       | 棚卸下書きの削除       | [詳細](/src/app/api/store/[store_id]/inventory/readme.md/#棚卸削除API)     |
| 棚卸取得API       | GET      | `/api/store/[store_id]/inventory/`                      | 棚卸情報の取得         | [詳細](/src/app/api/store/[store_id]/inventory/readme.md/#棚卸取得API)     |

## コンディションAPI

### 定義ファイル

/api/store/[store_id]/condition/api.d.ts

### 詳細仕様書

[コンディションAPI詳細仕様書](/src/app/api/store/[store_id]/condition/readme.md)

| API名                             | メソッド | URL                                                                            | 処理内容                         | 詳細                                                                                       |
| --------------------------------- | -------- | ------------------------------------------------------------------------------ | -------------------------------- | ------------------------------------------------------------------------------------------ |
| コンディション取得API             | GET      | `/api/store/[store_id]/condition/`                                             | コンディション情報の取得         | [詳細](/src/app/api/store/[store_id]/condition/readme.md/#コンディション取得API)           |
| コンディション登録・更新API       | POST     | `/api/store/[store_id]/condition/`                                             | コンディションの登録・更新       | [詳細](/src/app/api/store/[store_id]/condition/readme.md/#コンディション登録更新API)       |
| コンディション削除API             | DELETE   | `/api/store/[store_id]/condition/[condition_id]/`                              | コンディションの削除             | [詳細](/src/app/api/store/[store_id]/condition/readme.md/#コンディション削除API)           |
| コンディション選択肢登録・更新API | POST     | `/api/store/[store_id]/condition/[condition_id]/option/`                       | コンディション選択肢の登録・更新 | [詳細](/src/app/api/store/[store_id]/condition/readme.md/#コンディション選択肢登録更新API) |
| コンディション選択肢削除API       | DELETE   | `/api/store/[store_id]/condition/[condition_id]/option/[condition_option_id]/` | コンディション選択肢の削除       | [詳細](/src/app/api/store/[store_id]/condition/readme.md/#コンディション選択肢削除API)     |

## 商品マスタAPI

### 定義ファイル

/api/store/[store_id]/item/api.d.ts

### 詳細仕様書

[商品マスタAPI詳細仕様書](/src/app/api/store/[store_id]/item/readme.md)

| API名                             | メソッド | URL                                                      | 処理内容                            | 詳細                                                                                   |
| --------------------------------- | -------- | -------------------------------------------------------- | ----------------------------------- | -------------------------------------------------------------------------------------- |
| 商品マスタ一覧取得API             | GET      | `/api/store/[store_id]/item/`                            | 商品マスタ一覧の取得                | [詳細](/src/app/api/store/[store_id]/item/readme.md/#商品マスタ一覧取得API)            |
| 商品マスタCSV取得API              | GET      | `/api/store/[store_id]/item/csv/`                        | 商品マスタのCSVファイル取得         | [詳細](/src/app/api/store/[store_id]/item/readme.md/#商品マスタCSV取得API)             |
| 商品マスタ情報変更API             | PUT      | `/api/store/[store_id]/item/[item_id]/`                  | 商品マスタ情報の変更                | [詳細](/src/app/api/store/[store_id]/item/readme.md/#商品マスタ情報変更API)            |
| 商品マスタ（パック）の中身取得API | GET      | `/api/store/[store_id]/item/[item_id]/open-pack/`        | パック商品の中身取得                | [詳細](/src/app/api/store/[store_id]/item/readme.md/#商品マスタパックの中身取得API)    |
| 商品マスタ（パック）の開封API     | POST     | `/api/store/[store_id]/item/[item_id]/open-pack/`        | パック商品の開封処理                | [詳細](/src/app/api/store/[store_id]/item/readme.md/#商品マスタパックの開封API)        |
| 商品マスタ関連CSVアップロードAPI  | POST     | `/api/store/[store_id]/item/csv/`                        | CSVによる商品マスタの一括登録・更新 | [詳細](/src/app/api/store/[store_id]/item/readme.md/#商品マスタ関連CSVアップロードAPI) |
| 商品マスタ作成API                 | POST     | `/api/store/[store_id]/item/`                            | 商品マスタの新規登録                | [詳細](/src/app/api/store/[store_id]/item/readme.md/#商品マスタ作成API)                |
| 商品マスタ取引情報取得API         | GET      | `/api/store/[store_id]/item/transaction/`                | 商品マスタベースの取引情報取得      | [詳細](/src/app/api/store/[store_id]/item/readme.md/#商品マスタ取引情報取得API)        |
| バンドル商品作成API               | POST     | `/api/store/[store_id]/item/bundle/`                     | バンドル商品の作成                  | [詳細](/src/app/api/store/[store_id]/item/readme.md/#バンドル商品作成API)              |
| オリパ作成API                     | POST     | `/api/store/[store_id]/item/original-pack/`              | オリジナルパックの作成              | [詳細](/src/app/api/store/[store_id]/item/readme.md/#オリパ作成API)                    |
| 商品マスタ情報サブスクライブAPI   | GET      | `/api/store/[store_id]/item/[item_id]/`                  | 商品マスタの更新イベント購読        | [詳細](/src/app/api/store/[store_id]/item/readme.md/#商品マスタ情報サブスクライブAPI)  |
| 部門取得API                       | GET      | `/api/store/[store_id]/item/department/`                 | 部門情報の取得                      | [詳細](/src/app/api/store/[store_id]/item/readme.md/#部門取得API)                      |
| 部門登録API                       | POST     | `/api/store/[store_id]/item/department/`                 | 部門の新規登録                      | [詳細](/src/app/api/store/[store_id]/item/readme.md/#部門登録API)                      |
| 部門更新・削除API                 | PUT      | `/api/store/[store_id]/item/department/[department_id]/` | 部門情報の更新・削除                | [詳細](/src/app/api/store/[store_id]/item/readme.md/#部門更新削除API)                  |
| Mycaアプリのitems取得API          | GET      | `/api/store/[store_id]/myca-item/`                       | Mycaアプリの商品情報取得            | [詳細](/src/app/api/store/[store_id]/item/readme.md/#Mycaアプリのitems取得API)         |

## 顧客API

### 定義ファイル

/api/store/[store_id]/customer/api.d.ts  
/api/store/all/customer/api.d.ts（全てのストア用）

### 詳細仕様書

[顧客API詳細仕様書](/src/app/api/store/[store_id]/customer/readme.md)

| API名                   | メソッド | URL                                                           | 処理内容                 | 詳細                                                                              |
| ----------------------- | -------- | ------------------------------------------------------------- | ------------------------ | --------------------------------------------------------------------------------- |
| 顧客登録&取得API        | POST     | `/api/store/[store_id]/customer/`                             | 顧客の登録・取得         | [詳細](/src/app/api/store/[store_id]/customer/readme.md/#顧客登録取得API)         |
| ストア内顧客一覧取得API | GET      | `/api/store/[store_id]/customer/`                             | ストア内の顧客一覧取得   | [詳細](/src/app/api/store/[store_id]/customer/readme.md/#ストア内顧客一覧取得API) |
| 付与可能ポイント取得API | GET      | `/api/store/[store_id]/customer/[customer_id]/addable-point/` | 付与可能なポイントの計算 | [詳細](/src/app/api/store/[store_id]/customer/readme.md/#付与可能ポイント取得API) |
| 全ストア顧客一覧取得API | GET      | `/api/store/all/customer/`                                    | 全ストアの顧客一覧取得   | [詳細](/src/app/api/store/[store_id]/customer/readme.md/#全ストア顧客一覧取得API) |

## ストア情報API

### 定義ファイル

/api/store/api.d.ts

### 詳細仕様書

[ストア情報API詳細仕様書](/src/app/api/store/readme.md)

| API名             | メソッド | URL                      | 処理内容               | 詳細                                                    |
| ----------------- | -------- | ------------------------ | ---------------------- | ------------------------------------------------------- |
| 店舗作成API       | POST     | `/api/store/`            | 店舗とアカウントの作成 | [詳細](/src/app/api/store/readme.md/#店舗作成API)       |
| 店基本情報変更API | PUT      | `/api/store/[store_id]/` | 店舗の基本情報変更     | [詳細](/src/app/api/store/readme.md/#店基本情報変更API) |
| 店詳細情報取得API | GET      | `/api/store/[store_id]/` | 店舗の詳細情報取得     | [詳細](/src/app/api/store/readme.md/#店詳細情報取得API) |
| 店舗一覧取得API   | GET      | `/api/store/`            | 紐づく店舗一覧の取得   | [詳細](/src/app/api/store/readme.md/#店舗一覧取得API)   |

## ロスAPI

### 定義ファイル

/api/store/[store_id]/loss/api.d.ts

### 詳細仕様書

[ロスAPI詳細仕様書](/src/app/api/store/[store_id]/loss/readme.md)

| API名           | メソッド | URL                                                 | 処理内容             | 詳細                                                                  |
| --------------- | -------- | --------------------------------------------------- | -------------------- | --------------------------------------------------------------------- |
| ロス登録API     | POST     | `/api/store/[store_id]/loss/`                       | ロスの登録と在庫変動 | [詳細](/src/app/api/store/[store_id]/loss/readme.md/#ロス登録API)     |
| ロス区分登録API | POST     | `/api/store/[store_id]/loss/genre/`                 | ロス区分の登録・更新 | [詳細](/src/app/api/store/[store_id]/loss/readme.md/#ロス区分登録API) |
| ロス区分削除API | DELETE   | `/api/store/[store_id]/loss/genre/[loss_genre_id]/` | ロス区分の論理削除   | [詳細](/src/app/api/store/[store_id]/loss/readme.md/#ロス区分削除API) |
| ロス取得API     | GET      | `/api/store/[store_id]/loss/`                       | ロス一覧の取得       | [詳細](/src/app/api/store/[store_id]/loss/readme.md/#ロス取得API)     |

## セールAPI

### 定義ファイル

/api/store/[store_id]/sale/api.d.ts

### 詳細仕様書

[セールAPI詳細仕様書](/src/app/api/store/[store_id]/sale/readme.md)

| API名                   | メソッド | URL                                     | 処理内容                   | 詳細                                                                          |
| ----------------------- | -------- | --------------------------------------- | -------------------------- | ----------------------------------------------------------------------------- |
| セール登録・更新API     | POST     | `/api/store/[store_id]/sale/`           | セールの登録・更新         | [詳細](/src/app/api/store/[store_id]/sale/readme.md/#セール登録更新API)       |
| セール削除API           | DELETE   | `/api/store/[store_id]/sale/[sale_id]/` | セールの削除               | [詳細](/src/app/api/store/[store_id]/sale/readme.md/#セール削除API)           |
| セールステータス更新API | POST     | `/api/store/all/sale/update-status/`    | セールステータスの一括更新 | [詳細](/src/app/api/store/[store_id]/sale/readme.md/#セールステータス更新API) |

## 鑑定API

### 定義ファイル

/api/store/[store_id]/appraisal/api.d.ts

### 詳細仕様書

[鑑定API詳細仕様書](/src/app/api/store/[store_id]/appraisal/readme.md)

| API名           | メソッド | URL                                                      | 処理内容       | 詳細                                                                       |
| --------------- | -------- | -------------------------------------------------------- | -------------- | -------------------------------------------------------------------------- |
| 鑑定作成API     | POST     | `/api/store/[store_id]/appraisal/`                       | 鑑定の新規作成 | [詳細](/src/app/api/store/[store_id]/appraisal/readme.md/#鑑定作成API)     |
| 鑑定結果入力API | POST     | `/api/store/[store_id]/appraisal/[appraisal_id]/result/` | 鑑定結果の登録 | [詳細](/src/app/api/store/[store_id]/appraisal/readme.md/#鑑定結果入力API) |
| 鑑定取得API     | GET      | `/api/store/[store_id]/appraisal/`                       | 鑑定情報の取得 | [詳細](/src/app/api/store/[store_id]/appraisal/readme.md/#鑑定取得API)     |

## アカウントAPI

### 定義ファイル

/api/account/api.d.ts

### 詳細仕様書

[アカウントAPI詳細仕様書](/src/app/api/account/readme.md)

| API名                 | メソッド | URL                          | 処理内容             | 詳細                                                          |
| --------------------- | -------- | ---------------------------- | -------------------- | ------------------------------------------------------------- |
| アカウント情報取得API | GET      | `/api/account/`              | アカウント情報の取得 | [詳細](/src/app/api/account/readme.md/#アカウント情報取得API) |
| アカウント情報更新API | PUT      | `/api/account/[account_id]/` | アカウント情報の更新 | [詳細](/src/app/api/account/readme.md/#アカウント情報更新API) |
| アカウント削除API     | DELETE   | `/api/account/[account_id]/` | アカウントの論理削除 | [詳細](/src/app/api/account/readme.md/#アカウント削除API)     |

## 法人API

### 定義ファイル

/api/corporation/api.d.ts

### 詳細仕様書

[法人API詳細仕様書](/src/app/api/corporation/readme.md)

| API名       | メソッド | URL                                  | 処理内容       | 詳細                                                    |
| ----------- | -------- | ------------------------------------ | -------------- | ------------------------------------------------------- |
| 法人更新API | PUT      | `/api/corporation/[corporation_id]/` | 法人情報の更新 | [詳細](/src/app/api/corporation/readme.md/#法人更新API) |

## アプリ広告API

### 定義ファイル

/api/store/[store_id]/app-advertisement/def.ts

### 詳細仕様書

[アプリ広告API詳細仕様書](/src/app/api/store/[store_id]/app-advertisement/readme.md)

| API名                   | メソッド | URL                                                               | 処理内容               | 詳細                                                                                     |
| ----------------------- | -------- | ----------------------------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------- |
| アプリ広告取得API       | GET      | `/api/store/[store_id]/app-advertisement/`                        | アプリ広告の取得       | [詳細](/src/app/api/store/[store_id]/app-advertisement/readme.md/#アプリ広告取得API)     |
| アプリ広告作成・更新API | POST     | `/api/store/[store_id]/app-advertisement/`                        | アプリ広告の作成・更新 | [詳細](/src/app/api/store/[store_id]/app-advertisement/readme.md/#アプリ広告作成更新API) |
| アプリ広告論理削除API   | DELETE   | `/api/store/[store_id]/app-advertisement/[app_advertisement_id]/` | アプリ広告の論理削除   | [詳細](/src/app/api/store/[store_id]/app-advertisement/readme.md/#アプリ広告論理削除API) |

## Square関連

### 定義ファイル

/api/square/def.ts

### 詳細仕様書

[Square関連API詳細仕様書](/src/app/api/square/readme.md)

| API名                   | メソッド | URL                      | 処理内容                      | 詳細                                                           |
| ----------------------- | -------- | ------------------------ | ----------------------------- | -------------------------------------------------------------- |
| OAuth同意画面URL取得API | GET      | `/api/square/oauth/url/` | Square OAuthの同意画面URL発行 | [詳細](/src/app/api/square/readme.md/#OAuth同意画面URL取得API) |

## その他処理API

### 定義ファイル

/api/store/[store_id]/functions/api.d.ts

### 詳細仕様書

[その他処理API詳細仕様書](/src/app/api/store/[store_id]/functions/readme.md)

| API名               | メソッド | URL                                             | 処理内容           | 詳細                                                                           |
| ------------------- | -------- | ----------------------------------------------- | ------------------ | ------------------------------------------------------------------------------ |
| 画像アップロードAPI | POST     | `/api/store/[store_id]/functions/upload-image/` | 画像のアップロード | [詳細](/src/app/api/store/[store_id]/functions/readme.md/#画像アップロードAPI) |

## 認証API

・ログイン/ログアウト、認証トークンの取得などを行うAPI

### パス

/api/auth/~ (NextAuth利用)
