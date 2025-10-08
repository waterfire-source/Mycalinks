import { CustomError } from '@/api/implement';
import { BackendLossAPI } from '@/app/api/store/[store_id]/loss/api';
import { Store } from '@prisma/client';

export interface LossAPI {
  //productに統合すべき？
  //ロス登録
  createLoss: {
    request: {
      storeId: number;
      reason?: string;
      datetime?: Date;
      lossGenreId?: number;
      products: Array<{
        productId: number;
        itemCount: number;
        specificWholesalePrice?: number; // 仕入れ値を選択する場合は指定、自動で良い場合は指定しない
      }>;
    };
    response: BackendLossAPI[0]['response']['201'] | CustomError;
  };

  //ロス区分登録
  createLossGenre: {
    request: {
      store_id: number;
      display_name: string;
    };
    response: BackendLossAPI[1]['response']['201'] | CustomError;
  };

  // ロス区分変更
  updateLossGenre: {
    request: {
      store_id: number;
      id: number;
      display_name: string;
    };
    response: BackendLossAPI[1]['response']['201'] | CustomError;
  };

  //ロス一覧取得
  getItems: {
    request: {
      store_id: Store['id'];
    };
    response: BackendLossAPI[2]['response']['200'] | CustomError;
  };

  //ロス区分一覧取得
  getLossGenres: {
    request: {
      store_id: number;
    };
    response: BackendLossAPI[3]['response']['200'] | CustomError;
  };

  //ロス区分削除
  deleteLossGenre: {
    request: {
      store_id: number;
      id: number;
    };
    response: BackendLossAPI[4]['response']['200'] | CustomError;
  };

  //ロス一覧取得(絞り込み, 並び替え可能)
  getLossProducts: {
    request: {
      store_id: number;
      loss_genre_id: number | undefined;
      staff_account_id: number | undefined;
      orderBy?: string[];
    };
    response: BackendLossAPI[5]['response']['200'] | CustomError;
  };
}

export interface LossAPIRes {
  getLossGenres: Exclude<LossAPI['getLossGenres']['response'], CustomError>;
  getLossProducts: Exclude<LossAPI['getLossProducts']['response'], CustomError>;
}
