export const ORDER_CONTACT_KIND = {
  ORDER: '商品が届かない',
  CANCEL: '注文のキャンセルについて',
  OTHER: 'その他のお問い合わせ',
} as const;

export type OrderContactKindKey = keyof typeof ORDER_CONTACT_KIND;
export type OrderContactKindValue =
  (typeof ORDER_CONTACT_KIND)[OrderContactKindKey];

export const getOrderContactKindValue = (
  key: string,
): OrderContactKindValue => {
  const upperKey = key.toUpperCase();

  if (upperKey in ORDER_CONTACT_KIND) {
    return ORDER_CONTACT_KIND[upperKey as OrderContactKindKey];
  }

  return ORDER_CONTACT_KIND.OTHER;
};
