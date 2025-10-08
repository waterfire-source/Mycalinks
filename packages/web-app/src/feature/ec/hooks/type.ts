import { EcAPI } from '@/api/frontend/ec/api';
import { CustomError } from '@/api/implement';
import { Ec_Banner } from '@prisma/client';

/** ListItemWithEcOrderResponseの型を定義（CustomErrorを除外）*/
export type ListItemWithEcOrderResponse = Exclude<
  EcAPI['listItemWithEcOrder']['response'],
  CustomError
>;

export type Item = ListItemWithEcOrderResponse['items'][0];

/** ECの在庫別取引一覧の検索条件*/
export interface ItemWithEcOrderSearchState {
  displayName?: string;
  itemId?: number;
  cardNumber?: string;
  rarity?: string;
  genreId?: number;
  orderCreatedAtGte?: Date;
  orderCreatedAtLt?: Date;
  orderBy?: string[];
  searchCurrentPage: number;
  searchItemPerPage: number;
}

export type Banner = {
  place: Ec_Banner['place'];
  image_url: string;
  url: string | null;
};
