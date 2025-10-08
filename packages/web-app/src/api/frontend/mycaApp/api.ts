import { BackendMycaItemAPI } from '@/app/api/store/[store_id]/myca-item/api';
import { MycaAppGenre } from 'backend-core';

//MycaアプリのAPIなど
export interface MycaAppAPI {
  getItem: {
    request: {
      params: BackendMycaItemAPI[0]['request']['params'];
      query?: BackendMycaItemAPI[0]['request']['query'];
    };
    response: BackendMycaItemAPI[0]['response'][200];
  };

  //ジャンルを取得する
  getGenres: {
    response: Array<MycaAppGenre>;
  };

  uploadImage: {
    request: {
      body: { file: FormData };
    };
    response: {
      imageUrl: string;
    };
  };
}
