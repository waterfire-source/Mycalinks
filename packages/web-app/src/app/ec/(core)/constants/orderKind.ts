export const ORDER_KIND_LABEL = {
  PRICE_ASC: '価格が安い順',
  PRICE_DESC: '価格が高い順',
  CONDITION_ASC: '状態が良い順',
  CONDITION_DESC: '状態が悪い順',
} as const;

export const ORDER_KIND_VALUE = {
  PRICE_ASC: 'actual_ec_sell_price',
  PRICE_DESC: '-actual_ec_sell_price',
  CONDITION_ASC: 'condition_asc',
  CONDITION_DESC: 'condition_desc',
} as const;

// ソート順
export type OrderKind = {
  value: (typeof ORDER_KIND_VALUE)[keyof typeof ORDER_KIND_VALUE];
  label: (typeof ORDER_KIND_LABEL)[keyof typeof ORDER_KIND_LABEL];
};

export const ORDER_KINDS: OrderKind[] = [
  { value: ORDER_KIND_VALUE.PRICE_ASC, label: ORDER_KIND_LABEL.PRICE_ASC },
  { value: ORDER_KIND_VALUE.PRICE_DESC, label: ORDER_KIND_LABEL.PRICE_DESC },
  {
    value: ORDER_KIND_VALUE.CONDITION_ASC,
    label: ORDER_KIND_LABEL.CONDITION_ASC,
  },
  {
    value: ORDER_KIND_VALUE.CONDITION_DESC,
    label: ORDER_KIND_LABEL.CONDITION_DESC,
  },
] as const;
