import { EcPaymentMethod } from '@prisma/client';

export const paymentMethods = [
  {
    label: 'クレジットカード',
    value: EcPaymentMethod.CARD,
  },
  {
    label: 'コンビニ決済',
    value: EcPaymentMethod.CONVENIENCE_STORE,
  },
  {
    label: '銀行振込',
    value: EcPaymentMethod.BANK,
  },
  {
    label: '代引き',
    value: EcPaymentMethod.CASH_ON_DELIVERY,
  },
];
