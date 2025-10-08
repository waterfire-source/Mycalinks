export const ItemGetAllOrderType = {
  SellPriceAsc: 'sell_price', // 販売価格の昇順
  SellPriceDesc: '-sell_price', // 販売価格の降順
  BuyPriceAsc: 'buy_price', // 買取価格の昇順
  BuyPriceDesc: '-buy_price', // 買取価格の降順
  OrderNumberAsc: 'order_number', // 指定された並び順の昇順
  OrderNumberDesc: '-order_number', // 指定された並び順の降順
  ProductsStockNumberAsc: 'products_stock_number', // 総在庫数の昇順
  ProductsStockNumberDesc: '-products_stock_number', // 総在庫数の降順
  DisplayNameAsc: 'display_name', // 名前の昇順
  DisplayNameDesc: '-display_name', // 名前の降順
  IdAsc: 'id', // IDの昇順
  IdDesc: '-id', // IDの降順
  MarketPriceAsc: 'market_price', // 市場相場価格の昇順
  MarketPriceDesc: '-market_price', // 市場相場価格の降順
  MarketPriceGapRateAsc: 'market_price_gap_rate', // 市場相場価格変動率の昇順
  MarketPriceGapRateDesc: '-market_price_gap_rate', // 市場相場価格変動率の降順
} as const;
export type ItemGetAllOrderType =
  (typeof ItemGetAllOrderType)[keyof typeof ItemGetAllOrderType];
