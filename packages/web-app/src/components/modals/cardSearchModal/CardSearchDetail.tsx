import React, { useState, useEffect } from 'react';
import { Box, Typography, Divider, CardMedia, TextField } from '@mui/material';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { BackendItemAPI } from '@/app/api/store/[store_id]/item/api';
import { TableRowData } from '@/components/cards/ChangeStockTableCard'; // ※インポート先を共通化して他の不ファイルからも参照したい

interface Props {
  item: BackendItemAPI[0]['response']['200']['items'][0];
  tableItems: TableRowData[];
  onClose: () => void;
  onAddItem: (item: TableRowData) => void;
  isChangeStock: boolean;
}

const CardSearchDetail: React.FC<Props> = ({
  item,
  tableItems,
  onClose,
  onAddItem,
  isChangeStock,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<
    BackendItemAPI[0]['response']['200']['items'][0]['products'][0] | null
  >(null);
  const [sellPrice, setSellPrice] = useState<number | null>(null);
  const [buyPrice, setBuyPrice] = useState<number | null>(null);
  const [quantity, setQuantity] = useState<number>(0);
  const [maxQuantity, setMaxQuantity] = useState<number>(0); // 最大数量

  // itemが更新されたときにデフォルトで最初のproductを選択する
  useEffect(() => {
    if (item.products.length > 0) {
      setSelectedProduct(item.products[0]);
    }
  }, [item]);

  // 選択されたproductの販売価格と買取価格を設定。specificの方を優先して表示する。db内のデータ自体を変えられるapiは未実装
  useEffect(() => {
    if (selectedProduct) {
      setSellPrice(
        selectedProduct.specific_sell_price ?? selectedProduct.sell_price,
      );
      setBuyPrice(
        selectedProduct.specific_buy_price ?? selectedProduct.buy_price,
      );
    } else {
      setSellPrice(null);
      setBuyPrice(null);
    }
  }, [selectedProduct]);

  useEffect(() => {
    if (selectedProduct) {
      setSellPrice(
        selectedProduct.specific_sell_price ?? selectedProduct.sell_price,
      );
      setBuyPrice(
        selectedProduct.specific_buy_price ?? selectedProduct.buy_price,
      );

      // テーブル内の同じ商品の合計数量を計算
      const tableItemQuantity = tableItems
        .filter((tableItem) => tableItem.productId === selectedProduct.id)
        .reduce((total, tableItem) => total + (tableItem.quantity ?? 0), 0);

      // 最大数量を計算
      setMaxQuantity((selectedProduct.stock_number ?? 0) - tableItemQuantity);
    } else {
      setSellPrice(null);
      setBuyPrice(null);
      setMaxQuantity(0);
    }
  }, [selectedProduct, tableItems]);

  const handleAdd = () => {
    if (item.display_name && selectedProduct && sellPrice !== null) {
      //在庫を変動させない場合は在庫が0でも追加できる
      const quantityCheck = isChangeStock ? quantity > 0 : true;
      if (isChangeStock || quantityCheck) {
        const newItem: TableRowData = {
          id: item.id,
          productName: item.display_name,
          displayNameWithMeta: item.products[0]?.displayNameWithMeta,
          productId: selectedProduct.id,
          unitPrice: sellPrice,
          quantity: isChangeStock ? quantity : 1, //追加する数量
          totalPrice: sellPrice * (isChangeStock ? quantity : 1),
          category: selectedProduct.conditions[0]?.option_name ?? '', //選択したproduct
          discount: 0,
          stockNumber: selectedProduct.stock_number ?? 0, //選択したproductの在庫数

          //在庫移動機能のため追加
          option_id: selectedProduct.conditions[0]?.option_id ?? '', //選択したproductのID
          item_allowed_conditions: item.item_allowed_conditions,
          item_products: item.products, //itemが保持しているproduct一覧
          product_code: selectedProduct.product_code ?? BigInt(0),
        };

        onClose();
        onAddItem(newItem);
      }
    }
  };

  return (
    <Box
      sx={{
        padding: '20px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'auto',
        backgroundColor: 'grey.100',
        boxShadow: '-5px 0 3px -3px #ddd',
      }}
    >
      <Box sx={{ display: 'flex', paddingBottom: '20px', gap: '20px' }}>
        {item.image_url ? (
          <CardMedia
            component="img"
            sx={{ width: '120px', height: '168px' }}
            image={item.image_url}
          />
        ) : (
          <Box
            sx={{
              width: '120px',
              height: '168px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'grey.300',
            }}
          ></Box>
        )}
        <Box sx={{ flexGrow: 1 }}>
          <Typography sx={{ fontWeight: 'bold', fontSize: '16px' }}>
            {item.products[0]?.displayNameWithMeta}
          </Typography>
          <Divider />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: '14px' }}>封入パック</Typography>
            <Typography sx={{ fontSize: '14px', textAlign: 'right' }}>
              {item.pack_name}
            </Typography>
          </Box>
          <Divider />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: '14px' }}>レアリティ</Typography>
            <Typography sx={{ fontSize: '14px', textAlign: 'right' }}>
              {item.rarity}
            </Typography>
          </Box>
          <Divider />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: '14px' }}>平均価格</Typography>
            <Typography sx={{ fontSize: '14px', textAlign: 'right' }}>
              {/* todo: 値を入れる */}
              {/* ¥{item.averagePrice.toLocaleString()} */}
            </Typography>
          </Box>
          <Divider />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: '14px' }}>最高価格</Typography>
            <Typography sx={{ fontSize: '14px', textAlign: 'right' }}>
              {/* todo: 値を入れる */}
              {/* ¥{item.highestPrice.toLocaleString()} */}
            </Typography>
          </Box>
          <Divider />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: '14px' }}>最低価格</Typography>
            <Typography sx={{ fontSize: '14px', textAlign: 'right' }}>
              {/* todo: 値を入れる */}
              {/* ¥{item.lowestPrice.toLocaleString()} */}
            </Typography>
          </Box>
          <Divider />
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: '14px' }}>在庫数</Typography>
            <Typography sx={{ fontSize: '14px', textAlign: 'right' }}>
              ({selectedProduct?.stock_number})枚
            </Typography>
          </Box>
        </Box>
      </Box>
      <Typography variant="body1" sx={{ marginBottom: '10px' }}>
        状態
      </Typography>
      {/* <Box sx={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {item.products.length > 0 && item.products.map((product) => (
          <Box
            key={product.conditions[0]?.condition_id}
            sx={{
              height: '35px',
              backgroundColor:
                selectedProduct?.id === product.id
                  ? 'primary.main'
                  : 'grey.300',
              borderRadius: '4px',
              padding: '8px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              color:
                selectedProduct?.id === product.id
                  ? 'text.secondary'
                  : 'text.primary',
              cursor: 'pointer',
            }}
            onClick={() => setSelectedProduct(product)}
          >
            {product.conditions[0]?.option_name}
          </Box>
        ))}
      </Box> */}
      <Box sx={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        {item.products.length > 0 &&
          item.products.map((product) => {
            console.log('Product:', product); // 各productの内容をコンソールに出力

            if (!product.conditions[0]?.condition_id) return null;

            return (
              <Box
                key={product.conditions[0]?.condition_id}
                sx={{
                  height: '35px',
                  backgroundColor:
                    selectedProduct?.id === product.id
                      ? 'primary.main'
                      : 'grey.300',
                  borderRadius: '4px',
                  padding: '8px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  color:
                    selectedProduct?.id === product.id
                      ? 'text.secondary'
                      : 'text.primary',
                  cursor: 'pointer',
                }}
                onClick={() => setSelectedProduct(product)}
              >
                {product.conditions[0]?.option_name}
              </Box>
            );
          })}
      </Box>

      <Box sx={{ marginBottom: '20px' }}>
        <Typography variant="body1" sx={{ marginBottom: '5px' }}>
          販売価格
        </Typography>
        <Box
          sx={{
            width: '100%',
            backgroundColor: 'common.white',
            border: 'solid 1px',
            borderRadius: '4px',
            borderColor: 'grey.400',
            fontSize: '16px',
            boxSizing: 'border-box',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Typography sx={{ marginRight: '4px' }}>¥</Typography>
          <Typography>{sellPrice ?? ''}</Typography>
        </Box>
      </Box>
      <Box sx={{ marginBottom: '20px' }}>
        <Typography variant="body1" sx={{ marginBottom: '5px' }}>
          買取価格
        </Typography>
        <Box
          sx={{
            width: '100%',
            backgroundColor: 'common.white',
            border: 'solid 1px',
            borderRadius: '4px',
            borderColor: 'grey.400',
            fontSize: '16px',
            boxSizing: 'border-box',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <Typography sx={{ marginRight: '4px' }}>¥</Typography>
          <Typography>{buyPrice ?? ''}</Typography>
        </Box>
      </Box>
      {isChangeStock && (
        <Box sx={{ marginBottom: '20px' }}>
          <Typography variant="body1" sx={{ marginBottom: '5px' }}>
            数量
          </Typography>
          <TextField
            type="number"
            inputProps={{ min: 0, max: maxQuantity }}
            value={quantity}
            onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
            sx={{
              width: '100%',
              backgroundColor: 'common.white',
              border: 'solid 1px',
              borderRadius: '4px',
              borderColor: 'grey.400',
              fontSize: '16px',
            }}
          />
        </Box>
      )}
      <Box sx={{ marginBottom: '20px' }}>
        <Typography variant="body1" sx={{ marginBottom: '5px' }}>
          備考
        </Typography>
        <Box
          sx={{
            height: '80px',
            width: '100%',
            backgroundColor: 'common.white',
            border: 'solid 1px',
            borderRadius: '4px',
            borderColor: 'grey.400',
            fontSize: '14px',
            display: 'flex',
            justifyContent: 'flex-start',
            alignItems: 'center',
            padding: '10px',
          }}
        >
          {item.description ? item.description : '---'}
        </Box>
      </Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '10px',
          height: '50px',
        }}
      >
        <PrimaryButton
          sx={{ width: '65%', color: 'text.secondary' }}
          onClick={handleAdd}
          disabled={
            !selectedProduct ||
            sellPrice == null || // sellPriceがnullまたはundefinedの場合にのみ無効化
            (isChangeStock && quantity < 1) ||
            false
          }
        >
          追加
        </PrimaryButton>
        <SecondaryButton
          sx={{ width: '35%', color: 'text.primary' }}
          onClick={onClose}
        >
          キャンセル
        </SecondaryButton>
      </Box>
    </Box>
  );
};

export default CardSearchDetail;
