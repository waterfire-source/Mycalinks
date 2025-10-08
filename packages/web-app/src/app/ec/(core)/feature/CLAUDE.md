# EC Core Feature - ECサイト機能別コンポーネント

## 目的
ECサイトの機能別に特化したコンポーネント・フック・型定義を提供

## 実装されている機能 (3個)

### 1. order/ - 注文・決済機能
```
order/
├── CreditCardForm.tsx (414行) - 最大規模
├── PaymentMethodManager.tsx (218行)
├── ConvenienceStoreSelect.tsx (87行)
├── PaymentMethodSelect.tsx (80行)
├── utils.ts (23行)
└── types.ts (14行)
```

#### CreditCardForm.tsx (414行) - クレジットカード決済
```typescript
const apiKey = process.env.NEXT_PUBLIC_MULPAY_API_KEY;
const pubKey = process.env.NEXT_PUBLIC_MULPAY_PUB_KEY;

export const CreditCardForm = ({
  onConfirm,
  onBack,
}: {
  onConfirm: (mptoken: string, cardLast4: string) => void;
  onBack: () => void;
}) => {
  const [mulpayPromise, setMulpayPromise] =
    useState<Promise<MultiPayment | null> | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadMulpayModule = async () => {
      try {
        const { loadMulpay } = await import('@mul-pay/mptoken-js');

        if (isMounted && apiKey && pubKey) {
          // window.Multipaymentが存在する場合は、既存のインスタンスを利用
          if (window.Multipayment) {
            setMulpayPromise(Promise.resolve(window.Multipayment as any));
            return;
          }

          // 存在しない場合のみ新規初期化
          const promise = loadMulpay(apiKey, pubKey, undefined, true, false);
          setMulpayPromise(promise);
        }
      } catch (error) {
        console.error('Failed to load mulpay module', error);
      }
    };

    loadMulpayModule();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Elements multiPayment={mulpayPromise}>
      <CreditCardFormInner onConfirm={onConfirm} onBack={onBack} />
    </Elements>
  );
};

const CreditCardFormInner = ({
  onConfirm,
  onBack,
}: {
  onConfirm: (mptoken: string, cardLast4: string) => void;
  onBack: () => void;
}) => {
  interface TokenObj {
    result: string;
    maskedCardNumber: string;
    tokenExpiryDate: string;
    isSecurityCodeSet: boolean;
    tokenList: string[];
  }
  
  const elements = useElements();
  const mulpay = useMultiPayment();
  const [cardHolderName, setCardHolderName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [cardNumberError, setCardNumberError] = useState<boolean>(false);
  const [cardExpiryError, setCardExpiryError] = useState<boolean>(false);
  const [cardCvcError, setCardCvcError] = useState<boolean>(false);

  const handleSubmit = () => {
    if (!elements || !mulpay) return;

    setLoading(true);

    // カード情報の検証
    if (cardNumberError || cardExpiryError || cardCvcError) {
      setLoading(false);
      return;
    }

    // トークン生成
    mulpay
      .createToken(elements)
      .then((result: TokenObj) => {
        if (result.result === 'success') {
          const cardLast4 = result.maskedCardNumber.slice(-4);
          onConfirm(result.tokenList[0], cardLast4);
        } else {
          console.error('Token creation failed:', result);
        }
      })
      .catch((error: any) => {
        console.error('Token creation error:', error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div className="form">
      <div className="form-group">
        <label className="label">カード番号</label>
        <div className="input-wrapper">
          <CardNumberElement
            className="input-field"
            options={styleObject}
            onChange={logEvent('cardNumber')}
          />
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="label">有効期限</label>
          <div className="input-wrapper">
            <CardExpiryElement
              className="input-field"
              options={styleObject}
              onChange={logEvent('cardExpiry')}
            />
          </div>
        </div>

        <div className="form-group">
          <label className="label">セキュリティコード</label>
          <div className="input-wrapper">
            <CardCvcElement
              className="input-field"
              options={styleObject}
              onChange={logEvent('cardCvc')}
            />
          </div>
        </div>
      </div>

      <div className="form-group">
        <label className="label">カード名義</label>
        <div className="input-wrapper">
          <input
            type="text"
            className="text-input"
            value={cardHolderName}
            onChange={(e) => setCardHolderName(e.target.value)}
            placeholder="カード名義を入力してください"
          />
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <button
          type="button"
          className="submit-button"
          onClick={onBack}
          style={{ backgroundColor: '#6b7280' }}
        >
          戻る
        </button>
        <button
          type="button"
          className="submit-button"
          onClick={handleSubmit}
          disabled={loading || cardNumberError || cardExpiryError || cardCvcError}
        >
          {loading ? '処理中...' : '確認'}
        </button>
      </div>
    </div>
  );
};
```

#### PaymentMethodManager.tsx (218行) - 決済方法管理
- **決済方法選択**: クレジットカード・コンビニ決済・銀行振込等
- **状態管理**: 決済フローの状態管理
- **バリデーション**: 決済情報の検証

#### ConvenienceStoreSelect.tsx (87行) - コンビニ決済選択
- **コンビニ選択**: セブン・ファミマ・ローソン等の選択
- **決済情報**: コンビニ決済の詳細情報表示

#### PaymentMethodSelect.tsx (80行) - 決済方法選択
- **決済方法一覧**: 利用可能な決済方法の表示
- **選択処理**: 決済方法の選択処理

#### types.ts (14行) - 型定義
```typescript
// 決済方法の型定義
export type PaymentMethod = 'credit' | 'convenience' | 'bank' | 'cod';

// クレジットカード情報の型定義
export type CreditCardInfo = {
  number: string;
  expiry: string;
  cvc: string;
  name: string;
};

// ステップの型定義
export type PaymentStep = 'select' | 'credit-input';
```

#### utils.ts (23行) - ユーティリティ
- **決済関連**: 決済処理のユーティリティ関数
- **バリデーション**: 決済情報の検証関数

### 2. items/ - 商品機能
```
items/
├── hooks/          # 商品関連フック
├── components/     # 商品関連コンポーネント
└── types/          # 商品関連型定義
```

- **商品検索**: 商品の検索・フィルタリング機能
- **商品表示**: 商品一覧・詳細表示
- **商品管理**: 商品データの管理・操作

### 3. detail/ - 商品詳細機能
```
detail/
└── hooks/          # 商品詳細関連フック
```

- **商品詳細**: 個別商品の詳細情報表示
- **関連商品**: 関連商品の表示
- **商品オプション**: 商品の詳細オプション管理

## 主要な技術実装

### 決済システム (order/)
- **外部決済**: @mul-pay/mptoken-js による決済処理
- **セキュリティ**: トークン化による安全な決済
- **フォーム管理**: Elements による決済フォーム
- **エラーハンドリング**: 決済エラーの適切な処理

### クレジットカード決済 (CreditCardForm.tsx - 414行)
- **動的ローディング**: 決済モジュールの動的読み込み
- **トークン生成**: 安全なカード情報のトークン化
- **バリデーション**: リアルタイムなカード情報検証
- **UI/UX**: 洗練された決済フォーム

### 型安全性 (types.ts - 14行)
- **決済方法**: 限定的な決済方法の型定義
- **カード情報**: クレジットカード情報の型定義
- **フロー管理**: 決済フローの状態型定義

## 使用パターン

### 1. クレジットカード決済
```typescript
import { CreditCardForm } from './order/CreditCardForm';

const PaymentPage = () => {
  const handleConfirm = (mptoken: string, cardLast4: string) => {
    // 決済処理
    processPayment(mptoken, cardLast4);
  };

  const handleBack = () => {
    // 戻る処理
    router.back();
  };

  return (
    <CreditCardForm
      onConfirm={handleConfirm}
      onBack={handleBack}
    />
  );
};
```

### 2. 決済方法選択
```typescript
import { PaymentMethodSelect } from './order/PaymentMethodSelect';
import { PaymentMethod } from './order/types';

const PaymentMethodPage = () => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('credit');

  const handleMethodChange = (method: PaymentMethod) => {
    setSelectedMethod(method);
  };

  return (
    <PaymentMethodSelect
      selectedMethod={selectedMethod}
      onMethodChange={handleMethodChange}
    />
  );
};
```

### 3. コンビニ決済
```typescript
import { ConvenienceStoreSelect } from './order/ConvenienceStoreSelect';

const ConveniencePaymentPage = () => {
  const [selectedStore, setSelectedStore] = useState<string>('');

  const handleStoreSelect = (storeCode: string) => {
    setSelectedStore(storeCode);
  };

  return (
    <ConvenienceStoreSelect
      selectedStore={selectedStore}
      onStoreSelect={handleStoreSelect}
    />
  );
};
```

## 関連ディレクトリ
- `../`: ECサイトコア機能
- `../hooks/`: 共通フック（機能から使用）
- `../components/`: 共通コンポーネント（機能から使用）
- `../utils/`: ユーティリティ（機能から使用）
- `/api/`: API実装（機能から呼び出し）

## 開発ノート
- **機能特化**: 各機能に特化したコンポーネント群
- **外部連携**: 決済サービスとの連携
- **セキュリティ**: 決済情報の安全な処理
- **型安全性**: TypeScript による厳密な型定義
- **再利用性**: 機能内での再利用可能な設計
- **段階的実装**: 必要に応じて機能を追加

---
*生成: contextcatchup.mdc v1.0 / 更新: 2025-01-24* 