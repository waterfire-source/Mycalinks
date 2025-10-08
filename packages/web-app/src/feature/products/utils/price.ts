// 基本的にはProductの型を受け取る。独自に設定した価格がある場合は特別価格を返す。
export const getSellPrice = <
  T extends { specific_sell_price: number | null; sell_price: number | null },
>(
  product: T,
) => {
  return (
    (product.specific_sell_price
      ? product.specific_sell_price
      : product.sell_price) ?? 0
  );
};
