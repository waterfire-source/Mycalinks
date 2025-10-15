import { CustomError } from '@/api/implement';
import {
  createItemGenreDef,
  getItemGenreDef,
  updateItemGenreDef,
} from '@/app/api/store/[store_id]/item/def';
import { getAppGenreWithPosGenre } from '@/app/api/store/[store_id]/myca-item/def';

export interface GenreAPI {
  getGenreAll: {
    request: {
      storeID: number;
      fromTablet?: boolean;
    };
    response: typeof getItemGenreDef.response | CustomError;
  };
  //ジャンル登録
  createGenre: {
    request: {
      storeID: number;
      displayName: string;
    };
    response: typeof createItemGenreDef.response | CustomError;
  };
  //MycaIDからジャンルを登録
  createMycaGenre: {
    request: {
      storeID: number;
      mycaGenreID: number;
    };
    response: typeof createItemGenreDef.response | CustomError;
  };

  //Appのジャンルを取得 ジャンルから一気に登録する際などに使用
  getAppGenreAll: {
    request: {
      storeID: number;
    };
    response: typeof getAppGenreWithPosGenre.response | CustomError;
  };

  //ジャンル更新
  updateGenre: {
    request: {
      storeID: number;
      itemGenreID: number;
      displayName?: string;
      hidden?: boolean;
      deleted?: boolean;
      autoUpdate?: boolean;
      order_number?: number;
    };
    response: typeof updateItemGenreDef.response | CustomError;
  };
}

export interface GenreAPIRes {
  getGenreAll: Exclude<GenreAPI['getGenreAll']['response'], CustomError>;
}
