import { Item } from '@prisma/client';
import { ItemAPIRes } from '@/api/frontend/item/api';
import { StoreApiRes } from '@/api/frontend/store/api';

export type MarketPriceUpdateHistory =
  StoreApiRes['getItemMarketPriceHistory']['updatedHistory'];

export type MarketFluctuationsItem = ItemAPIRes['getAll']['items'][0];
export type MarketFluctuationsItemAndProduct = {
  item: Item;
  product: ItemAPIRes['getAll']['items'][0]['products'][0];
};
export type MarketFluctuationsProduct =
  ItemAPIRes['getAll']['items'][0]['products'][0];

export type SearchParams = {
  genreId?: number;
  categoryId?: number;
  orderBy?: string;
  marketPriceUpdatedAtGte?: string;
  hasStock?: boolean;
  /** 商品名部分一致 */
  displayName?: string;
  /** エキスパンション（シリーズ） */
  expansion?: string;
  /** 型番 / カード番号 */
  cardnumber?: string;
  /** レアリティ */
  rarity?: string;
  /** findOption で追加される任意のパラメータ */
  findOption?: Record<string, string>;
};
