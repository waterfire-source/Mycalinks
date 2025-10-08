import dayjs from 'dayjs';
import { ReactNode } from 'react';
import { Box } from '@mui/material';
import {
  ColumnDef,
  CustomTabTable,
  TabDef,
} from '@/components/tabs/CustomTabTable';
import { SetDealStatus } from '@prisma/client';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { ItemText } from '@/feature/item/components/ItemText';

export interface BundleSetProductType {
  id: number;
  itemId?: number; // bundleの場合これを持つ
  productId?: number; // productのid
  displayName: string | undefined;
  createdAt: Date; // 作成日時
  updatedAt: Date;
  imageUrl: string | null;
  products: Array<{
    productID: number;
    itemCount: number;
    itemId?: number; // bundleの場合これを持つ
    setDealID?: number; // setの場合これを持つ
  }>;
  initStockNumber?: number | null; // bundleの場合これを持つ
  productType: 'bundle' | 'set';
  bundleSellPrice?: number | null; // bundleの場合これを持つ
  bundleGenre?: {
    id: number | null;
    displayName: string | null;
  }; // bundleの場合これを持つ
  bundleStockNumber?: number | null; // bundleの場合これを持つ
  setDiscountAmount?: string; // setの場合これを持つ
  startAt?: Date | null; // 開始日時
  expiredAt?: Date | null; // 終了日時
  infiniteStock?: boolean; // バンドルの場合これを持つ
  isDeleted?: boolean; //セットの場合これを持つ
  status?: SetDealStatus; //セットの場合これを持つ
}

type Props = {
  isLoading: boolean;
  bundleProducts: BundleSetProductType[];
  addField: ReactNode;
  onEditBundleProducts: (newProduct: BundleSetProductType) => void;
};

export const TabTable = ({
  isLoading,
  bundleProducts,
  addField,
  onEditBundleProducts,
}: Props) => {
  /**
   * テーブルのカラム定義
   */
  const columns: ColumnDef<BundleSetProductType>[] = [
    {
      header: '画像',
      render: (bundleProduct) => {
        return (
          <Box
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ItemImage imageUrl={bundleProduct.imageUrl} />
          </Box>
        );
      },
    },
    {
      header: 'バンドル/セット名',
      render: (bundleProduct) => (
        <ItemText wrap text={bundleProduct.displayName ?? '-'} />
      ),
    },
    {
      header: 'セット/バンドル',
      render: (bundleProduct) =>
        bundleProduct.productType === 'bundle' ? 'バンドル' : 'セット',
    },
    {
      header: '開始日時',
      render: (bundleProduct) =>
        dayjs(bundleProduct.startAt).isValid()
          ? dayjs(bundleProduct.startAt).format('YYYY/MM/DD')
          : '-',
    },
    {
      header: '終了日時',
      render: (bundleProduct) =>
        dayjs(bundleProduct.expiredAt).isValid()
          ? dayjs(bundleProduct.expiredAt).format('YYYY/MM/DD')
          : '-',
    },
    {
      header: '対象商品数',
      render: (bundleProduct) =>
        bundleProduct.products ? `${bundleProduct.products.length}` : '-',
    },
    {
      header: 'バンドル在庫数',
      render: (bundleProduct) =>
        bundleProduct.infiniteStock
          ? '∞'
          : bundleProduct.bundleStockNumber
          ? `${bundleProduct.bundleStockNumber.toLocaleString()}`
          : '-',
    },
    {
      header: 'バンドル販売価格',
      render: (bundleProduct) =>
        bundleProduct.bundleSellPrice !== null &&
        bundleProduct.bundleSellPrice !== undefined
          ? `¥${bundleProduct.bundleSellPrice.toLocaleString()}`
          : '-',
    },
  ];
  /**
   * タブの配列: 「適用中」「適用前」「終了」「すべて」
   *  - filterFn: 全件から各タブに応じたものを抽出するロジック
   *  - value: ローカルフィルタの場合不要なので指定しない
   */
  const tabs: TabDef<BundleSetProductType>[] = [
    {
      label: '適用中',
      filterFn: (data) =>
        data.filter((item) => {
          if (item.productType === 'set') {
            return item.status === 'PUBLISH'; // `set` の場合は status が PUBLISH のみ
          }
          return (
            dayjs().isAfter(dayjs(item.createdAt)) &&
            (dayjs(item.expiredAt).isValid()
              ? dayjs().isBefore(dayjs(item.expiredAt))
              : true)
          );
        }),
    },
    {
      label: '適用前',
      filterFn: (data) =>
        data.filter((item) => {
          if (item.productType === 'set') {
            return item.status === 'DRAFT'; // `set` の場合は status が DRAFT のみ
          }
          return dayjs().isBefore(dayjs(item.createdAt));
        }),
    },
    {
      label: '終了',
      filterFn: (data) =>
        data.filter((item) => {
          if (item.productType === 'set') {
            return item.status === 'DELETED'; // `set` の場合は status が DELETED のみ
          }
          return (
            dayjs().isAfter(dayjs(item.expiredAt)) ||
            (item.productType === 'bundle' && item.bundleStockNumber === 0) ||
            item.isDeleted // 終了には isDeleted が true のものも含める
          );
        }),
    },
    {
      label: 'すべて',
      filterFn: (data) => data,
    },
  ];

  return (
    <>
      <CustomTabTable<BundleSetProductType>
        isLoading={isLoading}
        data={bundleProducts ?? []}
        tabs={tabs}
        columns={columns}
        rowKey={(bundleProducts) => bundleProducts.id}
        addField={addField}
        onRowClick={onEditBundleProducts}
      />
    </>
  );
};
