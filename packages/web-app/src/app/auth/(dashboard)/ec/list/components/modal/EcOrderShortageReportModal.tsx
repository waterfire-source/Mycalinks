import { Box, TextField, Typography } from '@mui/material';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import {
  OrderInfo,
  OrderItem,
} from '@/app/auth/(dashboard)/ec/list/types/OrderInfo';
import { UpdateOrderInfo } from '@/app/auth/(dashboard)/ec/list/components/modal/EcOrderShortageModal';
import { useEffect, useState } from 'react';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { ColumnDef, CustomTable } from '@/components/tables/CustomTable';
import { ItemText } from '@/feature/item/components/ItemText';
import { useAlert } from '@/contexts/AlertContext';

interface ShortageItem {
  productId: number;
  // itemCount は文字列とし、空欄（""）も許容することで、ユーザーが入力欄をクリアできるようにする
  itemCount: string;
}
interface StockItem {
  productId: number;
  stockItemCount: number;
}

interface ECOrderShortageReportModalProps {
  open: boolean;
  onClose: () => void;
  orderInfo: OrderInfo;
  setUpdateOrderInfo: (updateOrderInfo: UpdateOrderInfo) => void;
  openShortageModal: () => void;
}

export const ECOrderShortageReportModal = ({
  open,
  onClose,
  orderInfo,
  setUpdateOrderInfo,
  openShortageModal,
}: ECOrderShortageReportModalProps) => {
  const { setAlertState } = useAlert();

  // state をオブジェクトの配列形式で保持する
  const [shortageItems, setShortageItems] = useState<ShortageItem[]>([]);

  // itemsのidと在庫数のオブジェクト
  const stockItems: StockItem[] = orderInfo?.items.map((item) => ({
    productId: item.productId,
    stockItemCount: item.quantity,
  }));

  // 欠品数の変更ハンドラー
  const handleShortageItemChange = (
    productId: number,
    newItemCount: string,
  ) => {
    setShortageItems((prev) => {
      const index = prev.findIndex((si) => si.productId === productId);
      if (index !== -1) {
        // 既に存在する場合は更新
        const newArr = [...prev];
        newArr[index] = { productId, itemCount: newItemCount };
        return newArr;
      } else {
        // 存在しなければ新規追加
        return [...prev, { productId, itemCount: newItemCount }];
      }
    });
  };

  // 注文可能な在庫が1つも残っていない（全商品が欠品扱い）場合に true を返す
  const isOrderEffectivelyEmpty = (): boolean => {
    return stockItems?.every((stockItem) => {
      const matchingShortage = shortageItems.find(
        (s) => s.productId === stockItem.productId,
      );
      const shortageCount =
        matchingShortage && matchingShortage?.itemCount !== ''
          ? parseInt(matchingShortage.itemCount)
          : 0;
      return shortageCount >= stockItem.stockItemCount;
    });
  };

  const handleActionButtonClick = () => {
    if (isOrderEffectivelyEmpty()) {
      setAlertState({
        message: '全ての商品が欠品している場合は注文をキャンセルしてください',
        severity: 'error',
      });
      return;
    } else {
      openShortageModal();
    }
  };

  // モーダルの open 状態と orderInfo に応じて初期値をセット／クリア
  useEffect(() => {
    if (!open || !orderInfo) {
      setShortageItems([]);
      return;
    }
    const initialShortageItems = orderInfo.items
      .filter((item) => item.shortage !== null)
      .map((item) => ({
        productId: item.productId,
        // 数値を文字列に変換して初期値とする
        itemCount: item.shortage!.toString(),
      }));
    setShortageItems(initialShortageItems);
  }, [open, orderInfo]);

  // shortageItems の変化に応じて、親コンポーネントへ更新情報を送信
  useEffect(() => {
    if (!orderInfo) return;
    setUpdateOrderInfo({
      orderId: orderInfo.orderId,
      products: orderInfo.items.map((item) => {
        // 対応するレコードが存在し、かつ空文字でなければ数値に変換、空の場合は 0 とする
        const record = shortageItems.find(
          (si) => si.productId === item.productId,
        );
        const shortageCount =
          record && record.itemCount !== '' ? parseInt(record.itemCount) : 0;
        return {
          product_id: item.productId,
          item_count: item.original_item_count - shortageCount,
        };
      }),
    });
  }, [shortageItems, orderInfo, setUpdateOrderInfo]);

  if (!orderInfo) return null;

  // テーブル各列のスタイル設定を共通化
  const cellStyles = {
    empty: { width: '50px' },
    image: { width: '150px' },
    name: { width: '400px' },
    condition: { width: '250px' },
    price: { width: '300px' },
    quantity: { width: '250px' },
    shortage: { width: '250px' },
  };

  const columns: ColumnDef<OrderItem>[] = [
    {
      header: '商品画像',
      key: 'image',
      render: (row) => <ItemImage imageUrl={row.imageUrl} height={72} />,
      sx: cellStyles.image,
    },
    {
      header: '商品名',
      key: 'name',
      render: (row) => <ItemText text={row.name} />,
      sx: cellStyles.name,
    },
    {
      header: '状態',
      key: 'condition',
      render: (row) => row.condition,
      sx: cellStyles.condition,
    },
    {
      header: '価格',
      key: 'price',
      render: (row) => `${row.price.toLocaleString()}円`,
      sx: cellStyles.price,
    },
    {
      header: '注文数',
      key: 'original_item_count',
      render: (row) => row.original_item_count.toString(),
      sx: cellStyles.quantity,
    },
    {
      header: '欠品',
      key: 'shortage',
      render: (row) => (
        <TextField
          value={
            shortageItems.find((si) => si.productId === row.productId)
              ?.itemCount || ''
          }
          onChange={(e) =>
            handleShortageItemChange(row.productId, e.target.value)
          }
          type="number"
          inputProps={{ min: 0 }}
        />
      ),
      sx: cellStyles.shortage,
    },
  ];

  return (
    <CustomModalWithIcon
      open={open}
      onClose={onClose}
      title={`注文番号：${orderInfo.orderId} 欠品報告`}
      width="90%"
      height="90%"
      actionButtonText="欠品報告をして発送準備を再開する"
      onActionButtonClick={handleActionButtonClick}
      cancelButtonText="発送準備に戻る"
      onCancelClick={onClose}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          height: '100%',
        }}
      >
        {/* 説明文部分 */}
        <Box sx={{ flex: '0 0 auto' }}>
          <Typography variant="body1" sx={{ p: 2, mb: 2, px: 5 }}>
            在庫数が不足している（欠品している）商品とその数を入力してください。
            <br />
            欠品報告をするとお客様に通知が送信され、一部、または全部の注文のキャンセルが可能となります。
          </Typography>
        </Box>

        {/* 注文商品の一覧 */}

        <CustomTable
          rows={orderInfo.items}
          columns={columns}
          rowKey={(row) => row.itemId ?? ''}
          hasRedLine
          headerText="注文商品"
        />
      </Box>
    </CustomModalWithIcon>
  );
};
