import { TaxCalculator } from '@/constants/tax';
import { ArrivalProductSearchType } from '@/feature/arrival/register/searchModal/type';
import { Product, Stocking_Product, TaxMode } from '@prisma/client';

interface StockingProduct {
  id: Stocking_Product['id']; //ID
  product_id: Stocking_Product['product_id']; //商品ID
  planned_item_count: Stocking_Product['planned_item_count']; //予定仕入れ数
  actual_item_count: Stocking_Product['actual_item_count']; //実際の仕入れ数（入荷が確定したら）
  unit_price: Stocking_Product['unit_price']; //仕入れる単価（仕入れ値）
  unit_price_without_tax: Stocking_Product['unit_price_without_tax']; //仕入れる単価（仕入れ値）
  product_name: Product['display_name']; //商品名
  image_url: Product['image_url']; // 商品画像
  actual_sell_price: Product['actual_sell_price']; // 売値
}
const taxCalculator = new TaxCalculator();

// 発注画面の商品検索で使うロジック
export const calcArrivalPricesByCommonProduct = (
  products: ArrivalProductSearchType[],
  isTaxIncluded: boolean = true, // 内税か外税か
  taxMode: TaxMode, // 店の設定が税込みか税抜きか
) => {
  const totalArrivalPriceRaw = products.reduce(
    (acc, cur) => acc + (cur.arrivalPrice ?? 0) * (cur.arrivalCount ?? 0),
    0,
  );

  let totalArrivalPrice: number;
  let totalArrivalPriceWithoutTax: number;
  let tax: number;

  if (isTaxIncluded) {
    // **内税計算**
    totalArrivalPrice = Math.round(totalArrivalPriceRaw); // ユーザーが入力した価格の累計を四捨五入した値を使う。
    tax = taxCalculator.getTaxAmountFromIncludedPrice(totalArrivalPriceRaw);
    totalArrivalPriceWithoutTax = totalArrivalPriceRaw - tax; // 小数点が発生する可能性があるが、四捨五入すると数値の辻褄が合わなくなる。
  } else {
    // **外税計算**
    totalArrivalPrice = taxCalculator.getPriceWithTax(totalArrivalPriceRaw);
    tax = taxCalculator.getTaxAmount(totalArrivalPriceRaw);
    totalArrivalPriceWithoutTax = totalArrivalPrice - tax;
  }

  const expectedSales = products.reduce(
    (acc, cur) => acc + (cur.sell_price ?? 0) * (cur.arrivalCount ?? 0),
    0,
  );
  // 見込み利益を計算するようの仕入れ値の合計
  const totalArrivalPriceForProfit =
    taxMode === TaxMode.INCLUDE
      ? totalArrivalPrice
      : totalArrivalPriceWithoutTax;
  // 見込み利益は店舗の設定が税込なら仕入れ値合計は税込、税抜なら仕入れ値合計は税抜で計算する
  const totalProfit = expectedSales - totalArrivalPriceForProfit;

  return {
    totalArrivalPrice, // 税込みの仕入れ合計
    totalArrivalPriceWithoutTax, // 税抜きの仕入れ合計
    tax, // 消費税
    expectedSales, // 見込み売上(お店の設定によって税込か税抜きかが変わる)
    totalProfit, // 見込み利益(お店の設定によって税込か税抜きかが変わる)
  };
};

// StockingProductで使うロジック
export const calcArrivalPricesByStockingProduct = (
  products: StockingProduct[],
) => {
  // 入力が税込モードか税抜きモードか(trueなら税込)
  const isTaxIncludedInput = products[0]?.unit_price !== null;
  // 仕入れ金額合計（内税または外税のどちらか）
  const totalArrivalPrice = products.reduce(
    (acc, cur) =>
      acc +
      cur.planned_item_count *
        (cur.unit_price ?? cur.unit_price_without_tax ?? 0),
    0,
  );

  // 消費税
  const tax = isTaxIncludedInput
    ? taxCalculator.getTaxAmountFromIncludedPrice(totalArrivalPrice)
    : taxCalculator.getTaxAmount(totalArrivalPrice);

  // 見込み売り上げ
  const expectedSales = products.reduce(
    (acc, cur) => acc + cur.planned_item_count * (cur.actual_sell_price ?? 0),
    0,
  );

  // 仕入れ値の合計(税込)
  const totalArrivalPriceForProfit = () => {
    if (isTaxIncludedInput) {
      // 入力が外税の時
      return totalArrivalPrice;
    } else {
      // 入力が内税の時
      return taxCalculator.getPriceWithTax(totalArrivalPrice);
    }
  };
  // 見込み利益
  const expectedProfit = expectedSales - totalArrivalPriceForProfit();

  return {
    totalArrivalPrice,
    tax,
    expectedSales,
    expectedProfit,
    isTaxIncludedInput,
  };
};
