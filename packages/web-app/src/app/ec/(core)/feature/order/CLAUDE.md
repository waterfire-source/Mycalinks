# EC Core Feature Order - 注文・決済機能

## 目的
ECサイトの注文・決済処理に特化したコンポーネント・型定義・ユーティリティを提供

## 実装されているファイル (6個)

```
order/
├── CreditCardForm.tsx (414行) - 最大規模
├── PaymentMethodManager.tsx (218行)
├── ConvenienceStoreSelect.tsx (87行)
├── PaymentMethodSelect.tsx (80行)
├── utils.ts (23行)
└── types.ts (14行)
```

## 主要実装

### CreditCardForm.tsx (414行) - クレジットカード決済フォーム
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

### PaymentMethodManager.tsx (218行) - 決済方法管理
- **決済フロー管理**: 決済方法選択から決済実行までの全体フロー
- **状態管理**: 決済ステップ・選択状態・エラー状態の管理
- **コンポーネント統合**: 各決済方法コンポーネントの統合管理

### ConvenienceStoreSelect.tsx (87行) - コンビニ決済選択
- **コンビニ選択**: セブン・ファミマ・ローソン・ミニストップ等の選択
- **決済情報表示**: 各コンビニの決済方法・手数料の表示
- **バリデーション**: 選択必須項目の検証

### PaymentMethodSelect.tsx (80行) - 決済方法選択
- **決済方法一覧**: クレジットカード・コンビニ決済・銀行振込・代引きの選択
- **アイコン表示**: 各決済方法のアイコン表示
- **選択状態管理**: 決済方法の選択状態管理

### types.ts (14行) - 型定義
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

### utils.ts (23行) - ユーティリティ関数
- **決済バリデーション**: 決済情報の検証関数
- **フォーマット**: 決済情報のフォーマット関数
- **エラーハンドリング**: 決済エラーの処理関数

## 主要な技術実装

### 外部決済サービス連携 (CreditCardForm.tsx - 414行)
- **@mul-pay/mptoken-js**: 外部決済サービスとの連携
- **動的ローディング**: 決済モジュールの動的読み込み
- **トークン化**: 安全なカード情報のトークン化
- **Elements**: 決済フォームコンポーネントの利用

### セキュリティ対策
- **カード情報の非保持**: トークン化による安全な決済処理
- **環境変数**: API キー・公開キーの環境変数管理
- **バリデーション**: リアルタイムなカード情報検証

### フォーム管理
- **状態管理**: カード情報・エラー状態・ローディング状態の管理
- **イベント処理**: カード情報変更イベントの処理
- **UI/UX**: 洗練されたフォームデザイン

### CSS-in-JS スタイリング
- **styleObject**: カード入力フィールドのスタイル定義
- **レスポンシブ**: 各デバイスに対応したスタイル
- **アニメーション**: ホバー・フォーカス効果

## 使用パターン

### 1. クレジットカード決済
```typescript
import { CreditCardForm } from './CreditCardForm';

const PaymentPage = () => {
  const handleConfirm = (mptoken: string, cardLast4: string) => {
    // 決済処理
    processPayment({
      token: mptoken,
      cardLast4,
      amount: orderAmount,
      orderId: orderId
    });
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
import { PaymentMethodSelect } from './PaymentMethodSelect';
import { PaymentMethod } from './types';

const PaymentMethodPage = () => {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('credit');

  const handleMethodChange = (method: PaymentMethod) => {
    setSelectedMethod(method);
    // 決済方法に応じた処理
    switch (method) {
      case 'credit':
        router.push('/payment/credit');
        break;
      case 'convenience':
        router.push('/payment/convenience');
        break;
      default:
        break;
    }
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
import { ConvenienceStoreSelect } from './ConvenienceStoreSelect';

const ConveniencePaymentPage = () => {
  const [selectedStore, setSelectedStore] = useState<string>('');

  const handleStoreSelect = (storeCode: string) => {
    setSelectedStore(storeCode);
  };

  const handleSubmit = () => {
    if (!selectedStore) {
      alert('コンビニを選択してください');
      return;
    }
    
    // コンビニ決済処理
    processConveniencePayment({
      storeCode: selectedStore,
      amount: orderAmount,
      orderId: orderId
    });
  };

  return (
    <div>
      <ConvenienceStoreSelect
        selectedStore={selectedStore}
        onStoreSelect={handleStoreSelect}
      />
      <button onClick={handleSubmit}>決済を確定する</button>
    </div>
  );
};
```

### 4. 決済フロー管理
```typescript
import { PaymentMethodManager } from './PaymentMethodManager';

const CheckoutPage = () => {
  const [paymentStep, setPaymentStep] = useState<PaymentStep>('select');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('credit');

  const handlePaymentComplete = (result: any) => {
    // 決済完了処理
    router.push('/payment/complete');
  };

  return (
    <PaymentMethodManager
      step={paymentStep}
      selectedMethod={selectedMethod}
      onStepChange={setPaymentStep}
      onMethodChange={setSelectedMethod}
      onPaymentComplete={handlePaymentComplete}
      orderAmount={orderAmount}
      orderId={orderId}
    />
  );
};
```

## 関連ディレクトリ
- `../`: ECサイトコア機能
- `../../hooks/`: 共通フック（決済関連フック）
- `../../constants/`: 定数（決済方法・ステータス）
- `../../utils/`: ユーティリティ（決済関連ユーティリティ）
- `/api/`: API実装（決済API）

## 開発ノート
- **外部連携**: @mul-pay/mptoken-js による安全な決済処理
- **セキュリティ**: トークン化・環境変数管理・バリデーション
- **UX**: 直感的なフォーム・リアルタイム検証・ローディング状態
- **型安全性**: TypeScript による厳密な型定義
- **再利用性**: 複数の決済フローで利用可能
- **パフォーマンス**: 動的ローディング・状態最適化

---
*生成: contextcatchup.mdc v1.0 / 更新: 2025-01-24* 