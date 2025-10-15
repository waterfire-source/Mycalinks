# Mycalink HTTP API 仕様書

本書は `Mycalinks` が提供する HTTP API の仕様を定義した開発者向けマニュアルです。  
レシートプリンター（EPSON）およびラベルプリンター（Brother）に対する印刷、ドロワー制御、状態取得、オンライン判定を提供します。  
また、、バーコードリーダー、ラインディスプレイ（Epson DM-D30）への機能を追加しました。

---

## 基本情報

- **ベースURL**: `http://localhost:<port>`  
  `<port>` は `詳細設定画面のe-POS受信サーバー　待ち受けポート番号` で設定
- **エンコード**: UTF-8
- **レスポンス形式**: JSON
- **CORS**: 有効
  - `Access-Control-Allow-Origin: *`
  - `Access-Control-Allow-Methods: POST, GET, OPTIONS`
  - `Access-Control-Allow-Headers: Content-Type`

---

## 対応機種
- **レシートプリンター**: EPSON TM-m30III-H
- **ラベルプリンター**: BROTHER QL-820NWBc、
- **キャッシュドロワー**: EPSON  CD-A3336W、和信テック キャッシュドロワー WS-330　ホワイト
- **バーコードリーダー**: BUSICOM BC-BR1000U　ホワイト、NETUM　NT-1228BC、FKsystem　FK-800V-UW、(他HIDキーボードとして認識すれば)
- **ラインディスプレイ**: EPSON DM-D30

---

## エンドポイント一覧

| Method   | Path            | 機能 |
|----------|-----------------|------|
| `POST`   | `/api/receipt`  | レシート印刷・ドロワー開・ステータス取得 |
| `GET`    | `/api/receipt`  | オンライン確認（`?check=online`） |
| `POST`   | `/api/label`    | ラベル印刷 |
| `GET`    | `/api/label`    | オンライン確認（`?check=online`） |
| `GET`    | `/api/barcode`  | バーコードリーダー文字列を SSE で送信 |
| `POST`   | `/api/line`     | ラインディスプレイ表示制御 |
| `GET`    | `/api/line`     | オンライン確認（`?check=online`） |
| `OPTIONS`| 上記全て         | CORS プリフライト応答 |

---

## 共通レスポンス

- **Content-Type**: `application/json; charset=utf-8`
- **HTTP ステータスコード**
  - `200 OK`: 成功
  - `400 Bad Request`: リクエスト不正（必須項目不足等）
  - `404 Not Found`: エンドポイント未定義
  - `500 Internal Server Error`: サーバ内部エラー

---

## レシートプリンター API

### 印刷

```http
POST /api/receipt
Content-Type: application/json

{
  "command": "print",
  "contents": "<feed unit=\"10\"/>\n<text>サンプル印字</text>"
}
```

**Response**

```json
{ "command":"print", "status":"ok", "message":"印刷完了" }
```

---

### キャッシュドロワー開

```http
POST /api/receipt
Content-Type: application/json

{ "command": "open" }
```

**Response**

```json
{ "command":"open", "status":"ok", "message":"ドロワーを開きました" }
```
### 状態取得

```http
POST /api/receipt
Content-Type: application/json

{ "command": "status" }
```

**動作**  
`EPSONレシートプリンターの状態` について、EPSON Status API DLL を使用して状態を確認します。
EPSON Status API DLLは、詳細設定画面｜レシートプリンターの画面にある「状態取得用DLL」にて設定します。

**Response**

```json
{ "command":"status", "status":"ok", "message":"レシートプリンターは接続できています。" }
```

---

### オンライン確認（レシート）

```http
GET /api/receipt?check=online
```

**Response**

```json
{ "status":"online" }
```

または

```json
{ "status":"offline" }
```

---

## ラベルプリンター API

### 印刷

```http
POST /api/label
Content-Type: application/json
```

**リクエストボディ**  
`printType` に応じて必要なフィールドが異なります。

#### 1. 商品ラベル印刷（`printType: "product"`）

```json
{
  "autoCut": true,
  "templateFileURL": "https://pos.mycalinks.com/templates/lbx/product/29x42.lbx",
  "printType": "product",
  "productCode": "10801",
  "displayNameWithMeta": "聖闘士星矢　アリオロス",
  "conditionOptionDisplayName": "Gold Saint アリオロス",
  "productPrice": "550",
  "taxKind": "税込"
}
```

#### 2. 店員ラベル印刷（`printType: "staff"`）

```json
{
  "autoCut": false,
  "templateFileURL": "https://pos.mycalinks.com/templates/lbx/staff/29x42.lbx",
  "printType": "staff",
  "staffCode": "20101",
  "staffName": "田中達郎"
}
```

#### 3. 顧客ラベル印刷（`printType: "customer"`）

```json
{
  "autoCut": true,
  "templateFileURL": "https://pos.mycalinks.com/templates/lbx/customer/29x42.lbx",
  "printType": "customer",
  "customerCode": "80345"
}
```

**Response**

```json
{ "printType":"<product|staff|customer>", "status":"ok", "message":"印刷完了" }
```

---

### オンライン確認（ラベル）

```http
GET /api/label?check=online
```

**Response**

```json
{ "status":"online" }
```

または

```json
{ "status":"offline" }
```

---

## エラーレスポンス例

- 不正 JSON
```json
{ "command":"unknown", "status":"error", "message":"Invalid JSON object" }
```

- 必須フィールド不足
```json
{ "command":"print", "status":"error", "message":"Missing \"contents\"" }
```

- 内部例外
```json
{ "command":"status", "status":"error", "message":"プリンター接続エラー" }
```

---

### バーコードリーダー API

### SSE によるリアルタイム読取

```http
GET /api/barcode
Accept: text/event-stream
```
**動作**

- サーバーからクライアントへ、バーコードスキャナで読み取った文字列を Server-Sent Events (SSE) で逐次送信

**クライアント例**
```js
const es = new EventSource('http://localhost:8080/api/barcode');
es.onmessage = e => {
  console.log('バーコード:', e.data);
};
```

**サンプル受信データ**
```js
data: 4901234567890
```

---

### ラインディスプレイ API

### 表示

```http
POST /api/line
Content-Type: application/json
```

**リクエストボディ**  
`command` に応じて必要なフィールドが異なります。

#### 1. 商品表示（`command: "product"`）

```json
{
  "command": "product",
  "productName": "遊戯王セット",
  "unitPrice": 1250,
  "saleName": "生誕祭",
  "saveDiscountPrice": 1000
}
```

#### 2. 価格表示（`command: "price"`）

```json
{
  "command": "price",
  "price": 1340,
  "change": 100
}
```

#### 3. クリア表示（`command: "clear"`）

```json
{
  "command": "clear"
}
```

#### 4. テキスト表示（`command: "text"`）

```json
{
  "command": "text",
  "singleText": "いらっしゃいませ"
}
```

**Response**

```json
{  "command":"<product|price|clear>", "status":"ok", "message":"表示完了" }
```

---

### オンライン確認（ライン）

```http
GET /api/label?check=online
```

**Response**

```json
{ "status":"online" }
```

または

```json
{ "status":"offline" }
```

---

