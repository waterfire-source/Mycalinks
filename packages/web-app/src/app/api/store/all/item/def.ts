import { apiMethod, apiRole, Required } from '@/api/backendApi/main';
import { Item } from '@prisma/client';
import { MycaItemMarketPriceUpdateHistory } from 'backend-core';

//botが価格更新するためのやつ
export const updateAllStoreItemMarketPriceDef = {
  method: apiMethod.PUT,
  path: 'store/all/item/market-price',
  privileges: {
    role: [apiRole.bot],
  },
  request: {
    body: {
      updatedItemPrices: [
        {
          id: Required<Item['myca_item_id']>(),
          price: Required<Item['market_price']>(),
        },
      ],
    },
  },
  process: `
  
  `,
  response: {
    ok: '更新できました',
  },
  error: {} as const,
};

//botが商品マスタ情報更新するためのやつ
export const updateAllStoreItemDef = {
  method: apiMethod.PUT,
  path: 'store/all/item',
  privileges: {
    role: [apiRole.bot],
  },
  request: {
    body: {
      updatedItems: [
        {
          id: Required<Item['myca_item_id']>(),
        },
      ],
    },
  },
  process: `
  
  `,
  response: {
    ok: '更新できました',
  },
  error: {} as const,
};

//相場価格の更新履歴などを軽く取得
export const getItemMarketPriceHistoryDef = {
  method: apiMethod.GET,
  path: 'store/all/item/market-price/update-history',
  privileges: {
    role: [apiRole.pos],
  },
  request: {},
  process: `
  
  `,
  response: <
    {
      //これが新しい順に帰ってくるため、最後の更新日は0番目のデータを参照する
      updatedHistory: Array<MycaItemMarketPriceUpdateHistory>;
    }
  >{},
  error: {} as const,
};
