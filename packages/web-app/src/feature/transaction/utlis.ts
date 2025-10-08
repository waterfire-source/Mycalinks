export const getPaymentMethodName = (paymentMethod: string): string => {
  switch (paymentMethod) {
    case 'cash':
      return '現金';
    case 'square':
      return 'クレジットカード';
    case 'felica':
      return '交通系IC';
    case 'paypay':
      return 'QR決済';
    default:
      return paymentMethod;
  }
};

export const getTransactionKindName = (transactionKind: string): string => {
  switch (transactionKind) {
    case 'sell':
      return '販売';
    case 'buy':
      return '買取';
    default:
      return transactionKind;
  }
};
