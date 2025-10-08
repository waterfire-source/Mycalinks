# EC Deck - ECデッキ購入オプション機能

## 目的
トレーディングカードゲームのデッキ購入における柔軟な商品選択オプションを提供し、デッキ構築に必要なカードの効率的な購入を支援

## 機能概要
- **デッキ購入オプション**: カード番号・レアリティ・状態・優先度の選択
- **在庫自動検索**: 指定条件に基づく利用可能商品の自動検索
- **カート連携**: 選択された商品の自動カート追加
- **在庫不足対応**: 不足商品のモーダル表示・代替案提示

## 内容概要
```
packages/web-app/src/app/ec/deck/
└── page.tsx                    # デッキ購入オプション画面 (26行)
```

## 重要ファイル
- `page.tsx`: デッキ購入オプション画面 - URLパラメータ処理・DeckPurchaseOption統合

## 主要機能実装

### 1. デッキ購入オプション画面
```typescript
// packages/web-app/src/app/ec/deck/page.tsx
export default function DeckPurchaseOptionPage() {
  const searchParams = useSearchParams();
  const deckId = searchParams.get('deckId') 
    ? Number(searchParams.get('deckId')) 
    : undefined;
  const deckCode = searchParams.get('code') // 'deckCode'ではなく'code'で受け取る
    ? String(searchParams.get('code')) 
    : undefined;

  return (
    <Container maxWidth="md">
      <Box>
        <Typography variant="h2" textAlign="center" py={2}>
          デッキ購入オプション
        </Typography>
        <DeckPurchaseOption deckId={deckId} deckCode={deckCode} />
      </Box>
    </Container>
  );
}
```

### 2. デッキ購入オプション選択
```typescript
// DeckPurchaseOption.tsx (208行)
export const DeckPurchaseOption = ({ deckId, deckCode }: DeckPurchaseOptionProps) => {
  const { methods, onSubmit, isLoading } = useDeckPurchaseOptionForm(deckId, deckCode);

  return (
    <FormProvider {...methods}>
      <FormFields />
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
        <PrimaryButton onClick={onSubmit} loading={isLoading}>
          カートに入れる
        </PrimaryButton>
      </Box>
    </FormProvider>
  );
};

// フォームフィールド構成
const FormFields = () => (
  <Stack spacing={3}>
    {/* 型番選択 */}
    <FormSection title="型番">
      <RadioGroup>
        <FormControlLabel value="true" label="型番を問わない" />
        <FormControlLabel value="false" label="デッキリストと同じ" />
      </RadioGroup>
    </FormSection>

    {/* レアリティ選択 */}
    <FormSection title="レアリティ">
      <RadioGroup>
        <FormControlLabel value="true" label="レアリティを問わない" />
        <FormControlLabel value="false" label="デッキリストと同じ" />
      </RadioGroup>
    </FormSection>

    {/* 状態選択（複数選択可） */}
    <FormSection title="状態(複数選択可)">
      <FormGroup>
        {cardCondition.map((condition) => (
          <FormControlLabel key={condition.value} control={<Checkbox />} label={condition.label} />
        ))}
      </FormGroup>
    </FormSection>

    {/* 優先度選択 */}
    <FormSection title="その他">
      <RadioGroup>
        <FormControlLabel value="COST" label="安いものを優先" />
        <FormControlLabel value="SHIPPING_DAYS" label="発送日の早いショップを優先する" />
      </RadioGroup>
    </FormSection>
  </Stack>
);
```

### 3. デッキ購入フォームロジック
```typescript
// useDeckPurchaseOptionForm.ts (134行)
export const useDeckPurchaseOptionForm = (deckId?: number, code?: string) => {
  const { setAlertState } = useAlert();
  const [isLoading, setIsLoading] = useState(false);
  const { addToCart } = useEcOrder();
  const { getEcDeckAvailableProducts } = useEcDeck();

  // デフォルト値設定
  const defaultValues: DeckOptionFormType = {
    anyCardNumber: false,
    anyRarity: false,
    conditionOption: [],
    priorityOption: DeckAvailableProductsPriorityOption.COST,
  };

  // 利用可能商品取得
  const fetchDeckAvailableProducts = useCallback(async (data: DeckOptionFormType) => {
    const { anyRarity, anyCardNumber, conditionOption, priorityOption } = data;
    
    const response = await getEcDeckAvailableProducts(
      anyRarity, anyCardNumber, deckId, deckId ? undefined : code,
      conditionOption.join(','), priorityOption
    );
    return response?.deckItems;
  }, [deckId, code, getEcDeckAvailableProducts]);

  // 店舗別商品整理
  const organizeProductsByStore = useCallback((deckItems: DeckItems): CartStore[] => {
    const storeMap = new Map<number, CartStore>();
    
    deckItems.forEach((item) => {
      item.availableProducts.forEach((product) => {
        const storeId = product.store.id;
        if (!storeMap.has(storeId)) {
          storeMap.set(storeId, {
            storeId,
            shippingMethodId: undefined,
            products: [],
          });
        }

        storeMap.get(storeId)?.products.push({
          productId: product.id,
          originalItemCount: item?.needItemCount || 0,
        });
      });
    });

    return Array.from(storeMap.values());
  }, []);

  // カート追加処理
  const processCartAddition = useCallback(async (deckItems: DeckItems) => {
    const cartStores = organizeProductsByStore(deckItems);
    await addToCart({ cartStores });
    router.push(PATH.CART);
  }, [addToCart, organizeProductsByStore, router]);

  // フォーム送信処理
  const onSubmit = handleSubmit(async (data: DeckOptionFormType) => {
    setIsLoading(true);
    
    const deckItems = await fetchDeckAvailableProducts(data);
    if (!deckItems) {
      setIsLoading(false);
      return;
    }

    await processCartAddition(deckItems);
    setIsLoading(false);
  });

  return { methods, onSubmit, isLoading };
};
```

### 4. フォームスキーマ・バリデーション
```typescript
// form-schema.ts (26行)
export const DeckOptionForm = z.object({
  anyCardNumber: z.boolean(),
  anyRarity: z.boolean(),
  conditionOption: z.array(z.string()).min(1, {
    message: '状態を選択してください。',
  }),
  priorityOption: z.nativeEnum(DeckAvailableProductsPriorityOption),
});

export const DECK_OPTION_NAME_MAP: FieldNameMap = {
  anyCardNumber: '型番',
  anyRarity: 'レアリティ',
  conditionOption: '状態(複数選択可)',
  priorityOption: 'その他',
};

export type DeckOptionFormType = z.infer<typeof DeckOptionForm>;
```

### 5. 在庫不足商品モーダル
```typescript
// InsufficientProductsModal.tsx (152行)
export const InsufficientProductsModal = ({ 
  insufficientProducts, open, onClose 
}: Props) => (
  <Modal open={open} onClose={onClose}>
    <Paper sx={{ maxWidth: 600, maxHeight: '90vh', overflow: 'auto' }}>
      <Stack padding={2} direction="row" sx={{ backgroundColor: 'primary.main' }}>
        <Typography color="white" variant="h4" fontWeight="bold">
          在庫が不足している商品がありました
        </Typography>
        <RiCloseFill color="white" onClick={onClose} />
      </Stack>
      
      <Stack spacing={2} sx={{ p: 2 }}>
        <Typography sx={{ fontWeight: 'bold' }}>
          以下のカードは、条件に合う在庫がありませんでした。
        </Typography>

        {insufficientProducts.map((product, index) => (
          <Stack key={index} direction="row" spacing={2}>
            <Box sx={{ width: 80, height: 112 }}>
              <Image 
                src={product?.item?.full_image_url || ''} 
                alt={product?.item?.cardname || 'Card image'} 
                fill 
              />
            </Box>
            
            <Stack spacing={0.5} sx={{ flex: 1 }}>
              <Typography variant="h3" fontWeight="bold">
                {product?.item?.cardname || 'Unknown Card'}
              </Typography>
              <Typography variant="body1" color="gray">
                {product?.item?.cardnumber || ''}
              </Typography>
              <Typography variant="body1" color="gray">
                {product?.item?.rarity || ''}
              </Typography>
              
              <Stack direction="row" justifyContent="space-between">
                <Stack border="1px solid black" borderRadius={1} padding={0.5}>
                  <Typography variant="body1" fontWeight="bold">
                    {getConditionLabel(product?.condition_option?.handle)}
                  </Typography>
                </Stack>
                <Typography variant="body2" fontWeight="bold">
                  不足数：{product?.insufficient_count || 0}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        ))}

        <PrimaryButton onClick={onClose}>カートへ戻る</PrimaryButton>
      </Stack>
    </Paper>
  </Modal>
);
```

## データフロー

### 1. デッキ購入フロー
```
URLパラメータ取得 → DeckPurchaseOption表示 → オプション選択 → getEcDeckAvailableProducts → カート追加 → カート画面遷移
```

### 2. 在庫不足処理フロー
```
デッキ商品検索 → 在庫不足検出 → InsufficientProductsModal表示 → カート画面で確認
```

### 3. 商品組織化フロー
```
deckItems → 店舗別グループ化 → CartStore配列生成 → addToCart実行
```

## 技術実装

### React Hook Form統合
```typescript
const methods = useForm<DeckOptionFormType>({
  defaultValues,
  resolver: zodResolver(DeckOptionForm),
});

// FormProvider による子コンポーネント連携
<FormProvider {...methods}>
  <FormFields />
</FormProvider>
```

### API連携
```typescript
// useEcDeck フック使用
const { getEcDeckAvailableProducts } = useEcDeck();

// 条件指定での商品検索
const response = await getEcDeckAvailableProducts(
  anyRarity, anyCardNumber, deckId, code, 
  conditionOption.join(','), priorityOption
);
```

### エラーハンドリング
```typescript
// useAlert統合
const { setAlertState } = useAlert();

// エラー時のアラート表示
setAlertState({
  message: 'カートに追加できませんでした。もう一度お試しください。',
  severity: 'error',
});
```

## 使用パターン

### 1. デッキ購入開始
```typescript
// URL例: /ec/deck?deckId=123 または /ec/deck?code=DECK456
// パラメータ取得・コンポーネント初期化
const deckId = searchParams.get('deckId');
const deckCode = searchParams.get('code');
```

### 2. オプション選択・送信
```typescript
// フォーム送信
const onSubmit = async (data: DeckOptionFormType) => {
  // 1. 利用可能商品取得
  const deckItems = await fetchDeckAvailableProducts(data);
  
  // 2. 店舗別整理
  const cartStores = organizeProductsByStore(deckItems);
  
  // 3. カート追加
  await addToCart({ cartStores });
  
  // 4. カート画面遷移
  router.push(PATH.CART);
};
```

### 3. 在庫不足対応
```typescript
// カート画面での在庫不足商品表示
useEffect(() => {
  const products = getInsufficientProducts();
  if (products) {
    setInsufficientProducts(products);
    setModalOpen(true);
  }
}, []);
```

## 依存関係

### 外部ライブラリ
- **React Hook Form**: フォーム状態管理
- **Zod**: スキーマバリデーション
- **Material-UI**: UI コンポーネント
- **Next.js**: ルーティング・URLパラメータ

### 内部モジュール
- **useEcDeck**: デッキ商品検索API
- **useEcOrder**: カート操作・商品追加
- **useAlert**: エラー・成功メッセージ表示
- **DeckPurchaseOption**: メインフォームコンポーネント
- **InsufficientProductsModal**: 在庫不足表示モーダル

## 関連ディレクトリ
- `../cart/` - カート画面（遷移先・在庫不足モーダル表示）
- `../(core)/hooks/` - useEcDeck・useEcOrder
- `../(core)/constants/` - cardCondition・パス定義
- `/feature/deck/` - デッキ関連コンポーネント・フック
- `/contexts/` - AlertContext

## 開発ノート
- **URLパラメータ**: deckId または code による柔軟な呼び出し
- **フォーム管理**: React Hook Form + Zod による型安全なバリデーション
- **商品組織化**: 店舗別グループ化による効率的なカート追加
- **在庫不足対応**: モーダル表示による分かりやすいフィードバック
- **エラーハンドリング**: useAlert による統一されたユーザー通知

---
*生成: contextcatchup.mdc v1.0 / 更新: 2025-01-24* 