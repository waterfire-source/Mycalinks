import { mycaItem } from '@/app/api/store/[store_id]/myca-item/api';
import { Item, ReservationStatus } from '@prisma/client';

export const ReservationStatusLabelMap: Record<ReservationStatus, string> = {
  [ReservationStatus.NOT_STARTED]: '開始前',
  [ReservationStatus.OPEN]: '受付中',
  [ReservationStatus.CLOSED]: '受付終了',
  [ReservationStatus.FINISHED]: 'お渡し完了',
};

export type ReservationsSearchState = {
  id?: number;
  status?: ReservationStatus;
  productDisplayName?: string;
  searchCurrentPage: number;
  searchItemPerPage: number;
  orderBy?: string;
};
export const defaultReservationsSearchState: ReservationsSearchState = {
  id: undefined,
  status: undefined,
  productDisplayName: undefined,
  searchCurrentPage: 0,
  searchItemPerPage: 30,
  orderBy: undefined,
};

export enum ModalType {
  Idle = 'Idle',
  Create = 'Create', //新規予約作成（予約情報入力）
  SelectMycaItems = 'SelectMycaItems', //新規予約作成（Mycalinksの商品選択）
  SelectOneselfItems = 'SelectOneselfItems', //新規予約作成（既存の独自商品選択）
  CreateItem = 'CreateItem', //新規予約作成（独自商品作成）
  Edit = 'Edit', //予約編集
  Delete = 'Delete', //予約削除
  Cancel = 'Cancel', //予約取り消し
  ToStart = 'ToStart', //予約受付開始
  ToClose = 'ToClose', //予約受付終了
  ToReStart = 'ToReStart', //予約受付再開
  CreateReception = 'CreateReception', //予約受付作成（ユーザー入力）
}
export type ModalState = {
  isOpen: boolean;
  status: ModalType;
};
export const defaultModalState: ModalState = {
  isOpen: false,
  status: ModalType.Idle,
};

export type MycaItemType = mycaItem & {
  pos_item_id?: Item['id'];
  displayNameWithMeta: string;
  genre_name: string;
};

export type ReservationsFormState = {
  item_sell_price?: number;
  item_release_date?: string | null;
  limit_count?: number;
  limit_count_per_user?: number;
  start_at?: string | null;
  end_at?: string | null;
  deposit_price?: number;
  remaining_price?: number;
  description?: string | null;
};

export type FormErrors = {
  [K in keyof ReservationsFormState]?: string;
};

export type CustomerReceptionsSearchState = {
  customerId?: number;
  customerName?: string;
};

export enum ReceptionStatus {
  ALL = 'all',
  PENDING = 'pending',
  RECEIVED = 'received',
}

export type ReceptionsSearchState = {
  reservationId?: number;
  customerId?: number;
  customerName?: string;
  status?: ReceptionStatus;
  orderBy?: string;
};
export const defaultReceptionsSearchState: ReceptionsSearchState = {
  reservationId: undefined,
  customerId: undefined,
  customerName: undefined,
  status: ReceptionStatus.ALL,
  orderBy: undefined,
};

export type CreateCustomerReservationReception = {
  reservationId: number;
  itemCount: number;
};
