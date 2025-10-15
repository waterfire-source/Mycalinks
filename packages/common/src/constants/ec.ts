//EC
export const ecConstants = {
  ecConditionOptionHandleDict: {
    O2_A: '状態A',
    O3_FOR_PLAY: 'プレイ用',
    O4_B: '状態B',
    O5_C: '状態C',
    O6_D: '状態D',
    O1_BRAND_NEW: '新品',
    O2_LIKE_NEW: '未使用',
    O3_USED: '中古',
  } as const,
  paymentMethodDict: {
    CASH_ON_DELIVERY: '代引き',
    CARD: 'クレジットカード',
    BANK: '銀行振込',
    CONVENIENCE_STORE: 'コンビニ払い',
    PAYPAY: 'PayPay',
  } as const,
  konbiniCodeDict: {
    SEVEN_ELEVEN: 'セブン-イレブン',
    LAWSON: 'ローソン',
    FAMILYMART: 'ファミリーマート',
    MINISTOP: 'ミニストップ',
    SEICOMART: 'セイコーマート',
  } as const,
  shippingCompanyDict: {
    SAGAWA: '佐川急便',
    KURONEKO: 'クロネコヤマト',
    YUBIN: '日本郵便',
    OTHER: 'その他',
  } as const,
};
