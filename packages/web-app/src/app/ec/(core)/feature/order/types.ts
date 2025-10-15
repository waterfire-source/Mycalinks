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
