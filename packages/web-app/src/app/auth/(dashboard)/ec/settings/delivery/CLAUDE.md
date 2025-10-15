# EC配送設定詳細管理

## 目的
ECサイトの配送方法・配送料金の詳細設定を管理するページ

## 実装されている機能

### メインページ (page.tsx - 72行)
- **2分割レイアウト**: 左側リスト（60%）+ 右側詳細（40%）
- **配送方法管理**: 配送方法の一覧表示・選択・詳細編集
- **新規追加**: 新規配送方法の追加機能
- **リアルタイム更新**: 選択・編集後の自動データ更新

### 配送方法の種類
1. **全国一律送料**: 全国一律の配送料金
2. **地域別送料**: 地域ごとの配送料金設定
3. **サイズ別送料**: 重量・サイズによる配送料金設定

## ファイル構成
```
delivery/
├── page.tsx                              # メインページ（72行）
└── /feature/ec/setting/delivery/components/
    ├── DeliverySettingsList.tsx         # 配送方法一覧（92行）
    ├── DeliverySettingsDetail.tsx       # 配送設定詳細（390行）
    ├── AddDeliveryMethodModal.tsx       # 新規配送方法追加（349行）
    ├── DeliveryMethodCreateContent.tsx  # 配送方法作成（163行）
    ├── DeliveryMethodEditContent.tsx    # 配送方法編集（237行）
    ├── DeleteDeliveryMethodModal.tsx    # 配送方法削除（71行）
    ├── FlatPostage.tsx                  # 全国一律送料（40行）
    ├── AreaPostage.tsx                  # 地域別送料（200行）
    ├── SizePostage.tsx                  # サイズ別送料（82行）
    └── SizePostageSettingUpdateModal.tsx # サイズ別送料設定（432行）
```

## 技術実装詳細

### 配送方法データ構造
```typescript
interface DeliveryMethod {
  id: number;
  displayName: string;                    // 配送方法名
  enabledTracking: boolean;               // 追跡機能
  enabledCashOnDelivery: boolean;         // 代金引換
  regions?: {                             // 地域別設定
    regionHandle: string;
    fee: number;
  }[];
  weights?: {                             // サイズ別設定
    displayName: string;
    weightGte: number;
    weightLte: number;
    regions: {
      regionHandle: string;
      fee: number;
    }[];
  }[];
}
```

### 配送方法リスト表示
```typescript
// CustomTableによる一覧表示
const columns: ColumnDef[] = [
  {
    header: '配送方法名',
    key: 'display_name',
    render: (row) => row.display_name,
  },
  {
    header: '送料',
    key: 'deliveryFee',
    render: (row) => {
      if (row.weights?.length) {
        return 'サイズ別送料';
      } else if (row.regions?.[0].region_handle === '全国一律') {
        return '全国一律';
      } else if (row.regions?.length) {
        return '地域別送料';
      }
    },
  },
  {
    header: '',
    render: () => <ChevronRightIcon />,
  },
];
```

### 配送方法選択・編集
```typescript
// 配送方法選択時の処理
const onRowClick = (row: DeliveryMethod) => {
  setSelectedDeliveryMethod({
    id: row.id,
    displayName: row.display_name,
    enabledTracking: row.enabled_tracking,
    enabledCashOnDelivery: row.enabled_cash_on_delivery,
    regions: row.regions?.length && row.weights?.length === 0
      ? row.regions?.map((region) => ({
          regionHandle: region.region_handle,
          fee: region.fee,
        }))
      : undefined,
    weights: row.weights?.length
      ? row.weights?.map((weight) => ({
          displayName: weight.display_name,
          weightGte: weight.weight_gte,
          weightLte: weight.weight_lte,
          regions: weight.regions?.map((region) => ({
            regionHandle: region.region_handle,
            fee: region.fee,
          })) || undefined,
        }))
      : undefined,
  });
};
```

### レイアウト設計
```typescript
// 2分割レイアウト
<Stack direction="row" gap="10px" overflow="auto">
  <Stack sx={{ width: '60%', overflowY: 'auto' }}>
    <DeliverySettingsList
      deliveryMethods={deliveryMethods}
      selectedDeliveryMethod={selectedDeliveryMethod}
      setSelectedDeliveryMethod={setSelectedDeliveryMethod}
    />
  </Stack>
  <Stack sx={{ flex: 1, overflowY: 'auto' }}>
    <DeliverySettingsDetail
      selectedDeliveryMethod={selectedDeliveryMethod}
      setSelectedDeliveryMethod={setSelectedDeliveryMethod}
      fetchDeliveryMethods={fetchDeliveryMethods}
    />
  </Stack>
</Stack>
```

## 主要コンポーネント

### DeliverySettingsList (92行)
- **配送方法一覧**: CustomTableによる配送方法の一覧表示
- **選択機能**: 行クリックによる配送方法選択
- **送料種別表示**: 全国一律・地域別・サイズ別の判定表示
- **選択状態**: 選択中の配送方法のハイライト

### DeliverySettingsDetail (390行)
- **詳細表示**: 選択された配送方法の詳細情報表示
- **編集機能**: 配送方法の編集・更新
- **削除機能**: 配送方法の削除
- **設定切り替え**: 追跡機能・代金引換の有効/無効切り替え

### AddDeliveryMethodModal (349行)
- **新規作成**: 新しい配送方法の作成
- **種別選択**: 全国一律・地域別・サイズ別の選択
- **設定入力**: 配送方法名・料金・オプションの入力
- **バリデーション**: 入力値の検証

### 送料設定コンポーネント
- **FlatPostage (40行)**: 全国一律送料の設定
- **AreaPostage (200行)**: 地域別送料の設定
- **SizePostage (82行)**: サイズ別送料の設定
- **SizePostageSettingUpdateModal (432行)**: サイズ別送料の詳細設定

## 使用パターン
1. **配送方法確認**: 左側リストで既存の配送方法を確認
2. **詳細編集**: 配送方法をクリック→右側で詳細編集
3. **新規追加**: 「新規配送方法追加」ボタン→モーダルで新規作成
4. **料金設定**: 全国一律・地域別・サイズ別から選択して料金設定
5. **オプション設定**: 追跡機能・代金引換の有効/無効設定

## 関連する主要フック
- **useDeliveryMethod**: 配送方法の取得・管理
- **useStore**: 店舗情報の取得

## 関連ディレクトリ
- `/feature/ec/setting/delivery/`: 配送設定関連機能
- `../`: EC設定メイン
- `../../external/`: 外部EC連携での配送設定
- `/components/tables/CustomTable`: テーブル表示

## 開発ノート
- **2分割UI**: 左側リスト・右側詳細の効率的なレイアウト
- **リアルタイム更新**: 選択・編集後の即座なデータ更新
- **送料種別判定**: regions/weightsの有無による自動判定
- **モーダル管理**: 新規作成・編集・削除の統一的なモーダル管理
- **CustomTable活用**: 選択状態・行クリック処理の実装 