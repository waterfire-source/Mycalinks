import { $Enums } from '@prisma/client';

export const ecPaymentMethodOptions = [
  {
    label: 'クレジットカード',
    value: $Enums.EcPaymentMethod.CARD,
  },
  {
    label: 'PayPay',
    value: $Enums.EcPaymentMethod.PAYPAY,
  },
  {
    label: '代金引換',
    value: $Enums.EcPaymentMethod.CASH_ON_DELIVERY,
  },
  {
    label: 'コンビニ決済',
    value: $Enums.EcPaymentMethod.CONVENIENCE_STORE,
  },
  {
    label: '銀行振込',
    value: $Enums.EcPaymentMethod.BANK,
  },
];

// 支払い方法の日本語マッピング
export const EC_PAYMENT_METHOD_MAP: Record<$Enums.EcPaymentMethod, string> = {
  CARD: 'クレジットカード',
  PAYPAY: 'PayPay',
  CASH_ON_DELIVERY: '代金引換',
  CONVENIENCE_STORE: 'コンビニ決済',
  BANK: '銀行振込',
};
