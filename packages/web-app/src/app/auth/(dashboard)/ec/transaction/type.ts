import { MycaPosApiClient } from 'api-generator/client';

export type GetEcOrderByStoreResponse = Awaited<
  ReturnType<MycaPosApiClient['ec']['getEcOrderByStore']>
>;

export type EcOrderByStoreInfoType =
  GetEcOrderByStoreResponse['storeOrders'][0];

export interface EcOrderSearchState {
  transactionID?: number;
  productName?: string;
  genreId?: number;
  platform?: PlatformKindEnum;
  orderBy?: string;
  searchCurrentPage: number;
  searchItemPerPage: number;
}

export enum PlatformKindEnum {
  mycalinks = 'MYCALINKS',
  ochanoko = 'OCHANOKO',
  // shopify = 'SHOPIFY',
}

export const platformKind = [
  {
    id: PlatformKindEnum.mycalinks,
    shopName: 'myca links mall',
    initial: 'M',
  },
  {
    id: PlatformKindEnum.ochanoko,
    shopName: 'おちゃのこネット',
    initial: 'お',
  },
  // {
  //   id: PlatformKindEnum.shopify,
  //   shopName: 'Shopify',
  //   initial: 'S',
  // },
];
