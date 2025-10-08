import React from 'react';
// カスタムタブの型とコンポーネントをインポート (パスは適宜修正)
import { CustomTab, TabDef } from '@/components/tabs/CustomTab';
import { CircularProgress, Box } from '@mui/material';
import {
  QuantityControlCard,
  QuantityControlCardProps,
} from '@/components/cards/QuantityControlCard';

export interface PackItemType {
  myca_item_id: number;
  image_url?: string | null;
  genre_name?: string | null;
  display_name?: string | null;
  displayNameWithMeta: string;
  cardnumber?: string | null;
  cardseries?: string | null;
  expansion?: string | null;
  rarity?: string | null;
  myca_pack_id?: number | null;
  pos_item_id?: number;
  quantity: number; // 追加する数量
  pack_item_count: number | null;
  pos_item_products_stock_number?: number | null; //POS上に登録されていたら、その合計在庫数
  wholesale_price?: number | null;
}

type Props = {
  items: PackItemType[];
  updateItemQuantity: (id: number, newQuantity: number) => void;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  /** `true` のとき「封入数確定アイテム」のみ表示、`false` のとき「ランダムアイテム」のみ表示 */
  forFixedPack?: boolean;
  isLoading?: boolean;
};

export const PackRegisterTab: React.FC<Props> = ({
  items,
  updateItemQuantity,
  header,
  footer,
  forFixedPack = false,
  isLoading = false,
}) => {
  // TODO: 子機との連携
  const singleTab: TabDef[] = [
    { key: 'all', value: 'すべて' },
    // { key: 'dev', value: '※開発中' },
  ];

  // タブの中身として表示するメインコンテンツ
  const content = !isLoading ? (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
        gap: 2,
      }}
    >
      {items.map((item, index) => {
        const isFixedItem = !!item.pack_item_count; // pack_item_count があれば「封入数確定アイテム」
        const cardData: QuantityControlCardProps['cardData'] = {
          id: item.myca_item_id,
          image_url: item.image_url ?? null,
          display_name: item.display_name ?? null,
          expansion: item.expansion ?? undefined,
          cardnumber: item.cardnumber ?? undefined,
          rarity: item.rarity ?? undefined,
          stock: item.pos_item_products_stock_number ?? undefined,
          quantity: item.quantity,
        };

        // forFixedPackがtrueなら「封入数確定アイテム」を表示
        // falseなら「ランダムアイテム」を表示
        if (forFixedPack) {
          if (isFixedItem) {
            return (
              <QuantityControlCard
                key={index}
                cardData={cardData}
                onQuantityChange={(newQuantity) =>
                  updateItemQuantity(item.myca_item_id, newQuantity)
                }
              />
            );
          }
        } else {
          if (!isFixedItem) {
            return (
              <QuantityControlCard
                key={index}
                cardData={cardData}
                onQuantityChange={(newQuantity) =>
                  updateItemQuantity(item.myca_item_id, newQuantity)
                }
              />
            );
          }
        }
        return null;
      })}
    </Box>
  ) : (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        height: '100%',
        alignItems: 'center',
      }}
    >
      <CircularProgress />
    </Box>
  );

  return (
    <Box sx={{ height: '100%' }}>
      <CustomTab
        tabs={singleTab}
        content={content}
        header={header}
        onTabChange={() => {
          // TODO: タブ切り替え時の処理
          console.log('Tab changed (mock)');
        }}
        footer={footer}
      />
    </Box>
  );
};
