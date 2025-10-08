# System API

## 概要
システム管理・監視のためのAPI。ヘルスチェック、システムメトリクス、API仕様書提供など、システム全体の運用に関わる機能を提供する。

## エンドポイント一覧

- `GET /api/system/health-check` - ヘルスチェック
- `GET /api/system/docs/openapi` - OpenAPI仕様書
- `GET /api/system/report/metrics/graph` - メトリクスグラフ

## API詳細

### ヘルスチェック
```typescript
GET /api/system/health-check
```

**権限**: なし（公開）

**レスポンス**:
```typescript
{
  data: {
    prisma: 'ok',    // データベース接続状態
    redis: 'ok',     // Redis接続状態
    sse: 'ok'        // SSE（Server-Sent Events）状態
  }
}
```

**チェック項目**:
1. **データベース接続**
   - Prismaクライアントの接続確認
   - 店舗数のカウントクエリ実行

2. **Redis接続**
   - Redis接続の確認
   - Pub/Sub機能の確認

3. **SSE接続**
   - SSEクライアント管理オブジェクトの確認
   - Redisサブスクリプションの確認

**エラーレスポンス**:
- `500`: いずれかのコンポーネントに問題がある場合
- Bot検出時は特別なエラーを返す

### OpenAPI仕様書
```typescript
GET /api/system/docs/openapi
```

**権限**: なし（開発環境のみ）

**レスポンス**:
- OpenAPI 3.0形式のAPI仕様書（JSON）
- Swagger UIで表示可能

**用途**:
- API仕様の確認
- クライアントコード生成
- APIテスト

### メトリクスグラフ
```typescript
GET /api/system/report/metrics/graph
```

**権限**: admin

**クエリパラメータ**:
- `type`: グラフタイプ
- `period`: 期間（daily, weekly, monthly）
- `store_id`: 店舗ID（オプション）

**レスポンス**:
```typescript
{
  data: {
    labels: string[];     // X軸ラベル
    datasets: [{
      label: string;      // データセット名
      data: number[];     // 値の配列
    }]
  }
}
```

## システム監視

### ヘルスチェックの活用
1. **外部監視サービス連携**
   - AWS CloudWatch
   - Datadog
   - New Relic

2. **ロードバランサー連携**
   - ALBのヘルスチェック
   - 自動スケーリングトリガー

3. **アラート設定**
   - 連続失敗時の通知
   - 自動復旧スクリプト

### 監視項目

#### インフラレベル
- CPU使用率
- メモリ使用率
- ディスク容量
- ネットワーク帯域

#### アプリケーションレベル
- レスポンスタイム
- エラー率
- 同時接続数
- キューサイズ

#### ビジネスレベル
- 取引数
- 売上金額
- アクティブユーザー数
- 在庫回転率

## メトリクス収集

### データソース
1. **アプリケーションログ**
   - アクセスログ
   - エラーログ
   - 監査ログ

2. **データベース**
   - クエリ実行時間
   - 接続プール状態
   - デッドロック検出

3. **外部サービス**
   - 決済Gateway応答時間
   - API呼び出し回数
   - エラー率

### メトリクス種類

#### パフォーマンスメトリクス
```typescript
{
  response_time_p50: number;    // 中央値
  response_time_p95: number;    // 95パーセンタイル
  response_time_p99: number;    // 99パーセンタイル
  throughput: number;           // スループット（req/s）
  error_rate: number;           // エラー率（%）
}
```

#### ビジネスメトリクス
```typescript
{
  transactions_count: number;   // 取引数
  sales_amount: number;        // 売上金額
  average_basket_size: number; // 平均単価
  conversion_rate: number;     // コンバージョン率
}
```

## システム診断

### 自動診断機能
1. **接続性チェック**
   - データベース接続プール
   - Redis接続
   - 外部API疎通確認

2. **パフォーマンス診断**
   - スロークエリ検出
   - メモリリーク検出
   - デッドロック検出

3. **設定診断**
   - 環境変数チェック
   - 権限設定確認
   - SSL証明書有効期限

## ログ管理

### ログレベル
- `ERROR`: エラー情報
- `WARN`: 警告情報
- `INFO`: 一般情報
- `DEBUG`: デバッグ情報

### ログ出力先
- CloudWatch Logs
- ローカルファイル（開発環境）
- Syslog（オプション）

### ログローテーション
- 日次ローテーション
- サイズベースローテーション
- 保存期間: 90日

## 障害対応

### 自動復旧
1. **プロセス再起動**
   - OOMキラー対応
   - デッドロック解消
   - 接続プール再作成

2. **フェイルオーバー**
   - データベース切り替え
   - Redisレプリカ昇格
   - CDN切り替え

### 手動対応手順
1. ヘルスチェック確認
2. ログ調査
3. メトリクス確認
4. 原因特定・対処
5. 事後レポート作成

## セキュリティ

### アクセス制限
- ヘルスチェック: 公開（Bot除外）
- メトリクス: 管理者のみ
- ログ: 権限による制限

### 情報漏洩対策
- センシティブ情報のマスキング
- 最小限の情報開示
- rate limiting

## 開発支援

### API仕様書
- 自動生成されるOpenAPI仕様
- インタラクティブなSwagger UI
- 型定義の自動生成

### デバッグ機能
- リクエスト/レスポンスログ
- SQLクエリログ
- パフォーマンストレース

## 今後の拡張予定

1. **AIによる異常検知**
   - 機械学習による異常パターン検出
   - 予測的アラート
   - 自動チューニング

2. **分散トレーシング**
   - OpenTelemetry導入
   - サービス間の依存関係可視化
   - ボトルネック特定

3. **カオスエンジニアリング**
   - 障害注入テスト
   - 復旧時間測定
   - 耐障害性向上

## 関連機能

- [監視設定](/monitoring/CLAUDE.md)
- [ログ管理](/logging/CLAUDE.md)
- [パフォーマンス](/performance/CLAUDE.md)
- [セキュリティ](/security/CLAUDE.md)