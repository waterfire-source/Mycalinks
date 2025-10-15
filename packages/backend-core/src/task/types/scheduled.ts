import { Reservation, Store } from '@prisma/client';

/**
 * セールステータス更新
 */
export type UpdateSaleStatus = {
  store_id?: Store['id']; //ストアID
};

/**
 * バンドル商品ステータス更新
 */
export type UpdateBundleItemStatus = {
  store_id?: Store['id']; //ストアID
};

/**
 * セット販売ステータス更新
 */
export type UpdateSetDealStatus = {
  store_id?: Store['id']; //ストアID
};

/**
 * 契約定期支払い
 */
export type PayContractSubscription = {};

/**
 * お知らせステータス更新
 */
export type UpdateAnnouncementStatus = {};

/**
 * 予約ステータス更新
 */
export type UpdateReservationStatus = {
  store_id?: Store['id']; //ストアID
  reservation_id?: Reservation['id']; //予約ID
};
