// 共通の商品タイプの定義
export interface LossRegisterItemType {
  id: number;
  displayName: string | null;
  expansion: string | null;
  cardnumber: string | null;
  rarity: string | null;
  sellPrice: number | null;
  imageUrl: string | null;
  products?: Array<LossRegisterProductType>;
}

// 選択した商品の詳細型定義（個数指定可能）
export interface LossRegisterProductType {
  id: number;
  displayName: string | null;
  displayNameWithMeta: string | null;
  imageUrl: string | null;
  stockNumber: number | null;
  expansion: string | null;
  cardnumber: string | null;
  rarity: string | null;
  buyPrice: number | null;
  specificSellPrice: number | null; //独自価格
  condition: {
    id: number | null;
    displayName: string;
  };
  // 追加する数
  count: number | undefined;
  // 仕入れ値
  arrivalPrice: number | undefined;
}
