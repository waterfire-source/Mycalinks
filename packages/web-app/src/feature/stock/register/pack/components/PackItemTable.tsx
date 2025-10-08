import React, { useEffect, useState, useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  CircularProgress,
  Checkbox,
} from '@mui/material';
import { PackItemType } from '@/feature/stock/register/pack/components/PackRegisterTab';
import { ColumnDef, CustomTable } from '@/components/tables/CustomTable';
import { ItemImage } from '@/feature/item/components/ItemImage';
import NumericTextField from '@/components/inputFields/NumericTextField';
import SecondaryButton from '@/components/buttons/SecondaryButton';

interface PackItemTableProps {
  width: string;
  height: string;
  itemsToRegister: PackItemType[];
  setItemsToRegister: React.Dispatch<React.SetStateAction<PackItemType[]>>;
  randomCardsPerPack: number;
  isRestoredFromHistory?: boolean; // 履歴復元フラグ
  unregisterProductWholesalePrice: number; // 未登録カード仕入れ値
  totalUnitWholesalePrice: number;
  amount: number;
  remainingAmount: number;
  handleSplitWholesalePrice: () => void;
  isFixedOnly: boolean;
}

export const PackItemTable: React.FC<PackItemTableProps> = ({
  width,
  height,
  itemsToRegister, // 登録するカード情報
  setItemsToRegister,
  randomCardsPerPack, // ランダムカード封入枚数
  isRestoredFromHistory = false, // 履歴復元フラグ
  unregisterProductWholesalePrice, // 未登録カード仕入れ値
  totalUnitWholesalePrice, // 全カード仕入れ値合計
  amount, // パック合計の仕入れ値[最終開封数とパック仕入れ単価]
  remainingAmount, // 残り金額
  handleSplitWholesalePrice,
  isFixedOnly,
}) => {
  const [isCalculating, setIsCalculating] = useState(false);

  // 在庫数の値を更新
  const updateItemQuantity = (itemId: number, value: number) => {
    setItemsToRegister((prevItems) =>
      prevItems.map((item) => {
        if (item.myca_item_id === itemId) {
          return { ...item, quantity: value };
        }
        return item;
      }),
    );
  };

  // 仕入れ単価の値を更新
  const updateItemWholesalePrice = (
    itemId: number,
    value: number | undefined,
  ) => {
    setItemsToRegister((prevItems) =>
      prevItems.map((item) => {
        if (item.myca_item_id === itemId) {
          return { ...item, wholesale_price: value };
        }
        return item;
      }),
    );
  };

  // ------------------- カラム定義 -------------------
  const columns: ColumnDef<PackItemType>[] = [
    {
      header: '画像',
      key: 'image_url',
      render: (row) => <ItemImage imageUrl={row.image_url ?? ''} height={70} />,
    },
    {
      header: '商品名',
      key: 'displayNameWithMeta',
      render: (row) => <Typography>{row.displayNameWithMeta}</Typography>,
    },
    {
      header: '登録数',
      key: 'quantity',
      render: (row) => {
        if (row.myca_item_id === -1)
          return (
            <Typography>
              {randomCardsPerPack
                ? itemsToRegister.find((item) => item.myca_item_id === -1)
                    ?.quantity ?? 0
                : 'ランダムカード封入枚数を入力してください'}
            </Typography>
          );
        return (
          <TextField
            type="number"
            value={row.quantity}
            variant="outlined"
            size="small"
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => {
              updateItemQuantity(row.myca_item_id, Number(e.target.value));
            }}
          />
        );
      },
      sx: { width: 100 },
    },
    {
      header: '在庫数変動',
      key: 'stock_change',
      render: (row) => (
        <Typography>
          {row.myca_item_id === -1
            ? ''
            : `${row.pos_item_products_stock_number ?? 0}→${
                (row.pos_item_products_stock_number ?? 0) + row.quantity
              }`}
        </Typography>
      ),
      sx: { width: 130 },
    },
    {
      header: '仕入れ単価を0にする',
      key: 'isZeroWholesalePrice',
      render: (row) => (
        <Checkbox
          checked={row.wholesale_price === 0}
          onChange={(e) => {
            const isChecked = e.target.checked;
            updateItemWholesalePrice(
              row.myca_item_id,
              isChecked ? 0 : undefined,
            );
          }}
        />
      ),
    },
    {
      header: '仕入れ単価',
      key: 'unit_wholesale_price',
      render: (row) => (
        <NumericTextField
          noSpin
          type="number"
          value={row.wholesale_price ?? undefined}
          variant="outlined"
          size="small"
          onClick={(e) => e.stopPropagation()}
          onChange={(value: number) => {
            updateItemWholesalePrice(row.myca_item_id, value);
          }}
        />
      ),
      sx: { width: 120 },
    },
    {
      header: '仕入れ値合計',
      key: 'total_wholesale_price',
      render: (row) => (
        <Typography>
          {row.wholesale_price != null
            ? `${((row.wholesale_price ?? 0) * row.quantity).toLocaleString()}`
            : '-'}
          円
        </Typography>
      ),
      sx: { width: 150 },
    },
  ];

  // 未登録カード追加の実行管理
  const unregisterCardAdded = useRef(false);

  // プロパティが変更されたときにrefをリセット
  useEffect(() => {
    unregisterCardAdded.current = false;
  }, [isRestoredFromHistory]);

  // 初回のみ未登録カードの項目を追加（履歴復元でない場合のみ）
  useEffect(() => {
    if (
      !isRestoredFromHistory &&
      !unregisterCardAdded.current &&
      !isFixedOnly
    ) {
      setItemsToRegister((prevItems) => {
        const alreadyAdded = prevItems.some((item) => item.myca_item_id === -1);
        if (alreadyAdded) return prevItems;

        unregisterCardAdded.current = true;
        return [
          ...prevItems,
          {
            myca_item_id: -1, // 未登録カードID
            image_url: '',
            displayNameWithMeta: '未登録カード',
            quantity: 0,
            pos_item_products_stock_number: null,
            pack_item_count: null,
            wholesale_price: unregisterProductWholesalePrice || undefined, // 未登録カード仕入れ値を設定
          },
        ];
      });
    }
  }, [isFixedOnly, isRestoredFromHistory, unregisterProductWholesalePrice]);

  // 残り金額が更新されるたびに遅延させてカクツキを回避
  useEffect(() => {
    setIsCalculating(true);
    const timeout = setTimeout(() => {
      setIsCalculating(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, [remainingAmount]);

  return (
    <Box
      sx={{
        width,
        height,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* 合計仕入れ値と残額 */}
      <Box display="flex" justifyContent="end" alignItems="center" mb={1}>
        <Typography fontWeight="bold">
          仕入れ値 {totalUnitWholesalePrice.toLocaleString()}円/
          {amount.toLocaleString()}円（残り
          <Box component="span" color="primary.main">
            {isCalculating ? (
              <CircularProgress size={12} sx={{ mx: 3, width: 50 }} />
            ) : (
              `${remainingAmount.toLocaleString()}円`
            )}
          </Box>
          ）
        </Typography>
        <SecondaryButton sx={{ ml: 2 }} onClick={handleSplitWholesalePrice}>
          空欄に自動分配
        </SecondaryButton>
      </Box>
      {/* テーブル */}
      <CustomTable<PackItemType>
        hasRedLine
        columns={columns}
        rows={itemsToRegister}
        rowKey={(row) => row.myca_item_id}
      />
    </Box>
  );
};
