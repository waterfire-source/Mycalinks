// 店舗メニュー画面の表示タイプ
export enum ViewTypes {
  TOP = 'top',
  RESERVATION_LIST = 'reservationList',
  RESERVATION_DETAIL = 'reservationDetail',
  PURCHASE_INFO = 'purchaseInfo',
}

export type ViewConfig = {
  type: ViewTypes; // 表示タイプ
  detailId?: number; // 詳細画面のID
};
