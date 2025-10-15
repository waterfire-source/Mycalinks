export const storeSetting = {
  tax: 0.1, //税は10% [TODO] 税設定導入時に廃止
  payment_service: 'square',
  ownSupplierDisplayName: '自店舗', //自分の店舗自身をサプライヤーとする時の名前
  pointRatio: 0.01, //ポイントの割合 基本的に切り捨てで計算する [TODO] ポイント設定導入時に廃止
  registerResetAmount: 100000, //レジ精算ごとに、レジ内現金を10万円に戻す [TODO] レジ設定導入時に廃止
};
