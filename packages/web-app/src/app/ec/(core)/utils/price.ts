// 数値を3桁 カンマ区切りでフォーマットする
export const formatPrice = (price: number | null): string => {
  if (price === null) return '0';
  return price.toLocaleString();
};
