# EC問い合わせ管理

## 目的
EC注文に関する顧客からの問い合わせを管理するページ

## 実装されている機能

### メインページ (page.tsx - 71行)
- **問い合わせ一覧表示**: InquiryContentコンポーネントで問い合わせ一覧を表示
- **詳細モーダル**: InquiryModalで個別問い合わせの詳細表示・対応
- **検索・フィルタ**: useInquirySearchフックによる問い合わせ検索機能
- **リアルタイム更新**: 問い合わせ対応後の自動リフレッシュ

### 問い合わせ管理の詳細機能
- **ステータス管理**: 未読・対応中・完了の3段階管理
- **種類別分類**: 注文内容・支払い関連・配送関連・返品交換・その他
- **タブ切り替え**: ステータス別の問い合わせ表示
- **並び替え**: 日付・注文番号での並び替え

## ファイル構成
```
inquiry/
└── page.tsx    # 問い合わせ管理メインページ（71行）
```

## 技術実装詳細

### 状態管理
```typescript
// 問い合わせ検索状態
const { inquiries, searchState, setSearchState, performSearch } = useInquirySearch();

// 選択された問い合わせ
const [selectedInquiry, setSelectedInquiry] = useState<
  Inquiry['orderContacts'][0] | null
>(null);

// モーダル表示状態
const [isOpen, setIsOpen] = useState(false);
```

### 問い合わせステータス定義
```typescript
// EcOrderContactStatus enum使用
export const InquiryStatus: Record<string, InquiryStatusType> = {
  UNREAD: {
    key: EcOrderContactStatus.UNREAD,
    label: '未読',
    color: theme.palette.primary.main,
  },
  ADDRESSING: {
    key: EcOrderContactStatus.ADDRESSING,
    label: '対応中',
    color: theme.palette.secondary.main,
  },
  SOLVED: {
    key: EcOrderContactStatus.SOLVED,
    label: '完了',
    color: theme.palette.grey[500],
  },
};
```

### 問い合わせ種類定義
```typescript
export const OrderKind = {
  ORDER_CONTENT: '注文内容',
  PAYMENT_RELATED: '支払い関連',
  DELIVERY_RELATED: '配送関連',
  RETURN_EXCHANGE: '返品・交換',
  OTHER: 'その他',
} as const;
```

## 使用している主要コンポーネント

### InquiryContent (feature/ec/inquiry/components/)
- **CustomTab**: タブ切り替え機能
- **InquiryTabHeader**: 検索・フィルタヘッダー
- **InquiryTabTable**: 問い合わせ一覧テーブル
- **ColumnDef**: テーブル列定義（注文番号・ステータス・種類・件名・日付）

### InquiryModal (feature/ec/inquiry/components/)
- **問い合わせ詳細表示**: 個別問い合わせの詳細情報
- **対応機能**: 問い合わせへの返信・ステータス変更
- **顧客情報**: 注文者情報・注文詳細の表示

## 使用パターン
1. **問い合わせ一覧確認**: ステータス別タブで問い合わせを確認
2. **詳細確認**: 問い合わせ行をクリックしてモーダルで詳細表示
3. **対応処理**: モーダル内で返信・ステータス変更
4. **検索・フィルタ**: 注文番号・種類・ステータスでの絞り込み

## データフロー
```typescript
// 初期データ取得
useEffect(() => {
  performSearch();
}, [searchState.orderId, searchState.code, searchState.kind, ...]);

// 対応完了後のリフレッシュ
useEffect(() => {
  if (!refreshInquiry) return;
  performSearch();
  setRefreshInquiry(false);
}, [refreshInquiry, performSearch]);
```

## 関連ディレクトリ
- `/feature/ec/inquiry/`: 問い合わせ機能の実装
  - `components/`: 問い合わせ関連コンポーネント（14個）
  - `hooks/`: useInquirySearch、useInquiry等のフック
  - `const.ts`: ステータス・種類定義
- `../transaction/`: 取引管理との連携
- `/components/tabs/`: CustomTab、CustomTabTable

## 開発ノート
- **Prisma連携**: EcOrderContactStatusによる型安全な状態管理
- **リアルタイム更新**: 問い合わせ対応後の自動データ更新
- **ユーザビリティ**: タブ切り替え・検索機能による効率的な問い合わせ管理
- **カラーコーディング**: ステータス別の色分け表示で視認性向上 