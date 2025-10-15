import React, { useState } from 'react';
import {
  TableBody,
  TableRow,
  TableCell,
  Typography,
  IconButton,
  Stack,
  Box,
} from '@mui/material';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import NumericTextField from '@/components/inputFields/NumericTextField';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { BackendItemAPI } from '@/app/api/store/[store_id]/item/api';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { ItemText } from '@/feature/item/components/ItemText';
import { Specialties } from '@/feature/specialty/hooks/useGetSpecialty';
interface PurchaseSearchResultTableBodyProps {
  items: BackendItemAPI[0]['response']['200']['items'][number][];
  quantities: {
    [productId: number]: number;
  };
  prices: {
    [productId: number]: number;
  };
  selectedSpecialty: Specialties[number] | null;
  onQuantityChange: (productId: number, quantity: number) => void;
  onPriceChange: (productId: number, price: number) => void;
  onAddToCart: (
    productId: number,
    item: BackendItemAPI[0]['response']['200']['items'][number],
    managementNumbers?: string[],
  ) => void;
  isCreateSpecialtyProductLoading: boolean;
}

export const PurchaseSearchResultTableBody: React.FC<
  PurchaseSearchResultTableBodyProps
> = ({
  items,
  quantities,
  prices,
  selectedSpecialty,
  onQuantityChange,
  onPriceChange,
  onAddToCart,
  isCreateSpecialtyProductLoading,
}) => {
  const [expandedItems, setExpandedItems] = useState<{
    [key: number]: boolean;
  }>({});

  const toggleExpand = (id: number) => {
    setExpandedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleAdd = (
    productId: number,
    item: BackendItemAPI[0]['response']['200']['items'][number],
  ) => {
    onAddToCart(productId, item);
  };

  return (
    <TableBody>
      {items.map((item) => {
        const productsMap = new Map<
          number,
          BackendItemAPI[0]['response']['200']['items'][number]['products'][number]
        >();
        const specialtyProducts = item.products.filter(
          (product) => product.specialty_id === selectedSpecialty?.id,
        );
        // 管理番号が付いていないかつ、特殊状態が結びついていないかつ特価じゃない商品(状態の順番を保つためにnormalProductsでforEachする必要あり)
        const normalProducts = item.products.filter(
          (product) =>
            !product.specialty_id &&
            product.management_number === null &&
            product.consignment_client_id === null &&
            !product.is_special_price_product,
        );
        normalProducts.forEach((product) => {
          if (selectedSpecialty) {
            // 状態が同じ特殊商品がある場合はその特殊商品をsetして終了
            const targetSpecialtyProduct = specialtyProducts.find(
              (p) => p.condition_option_id === product.condition_option_id,
            );
            if (targetSpecialtyProduct) {
              productsMap.set(
                product.condition_option_id ?? 0,
                targetSpecialtyProduct,
              );
              return;
            }
          }
          // 状態が同じ特殊商品がない場合は普通の商品をset
          productsMap.set(product.condition_option_id ?? 0, product);
        });

        const isExpanded = !!expandedItems[item.id];
        const productsToDisplay = isExpanded
          ? Array.from(productsMap.values())
          : Array.from(productsMap.values()).slice(0, 1);

        return (
          <React.Fragment key={item.id}>
            {productsToDisplay.map((product, index) => {
              const isFirstProduct = index === 0;
              const isLastProduct = index === productsToDisplay.length - 1;
              const removeBorder = isExpanded && !isLastProduct;
              // 特殊状態が選択されているときはその特殊商品がある場合はその特殊商品を表示する

              return (
                <TableRow
                  key={`${item.id}-${product.id}`}
                  sx={{ borderBottom: removeBorder ? 'none' : undefined }}
                >
                  {isFirstProduct && (
                    <>
                      <TableCell
                        rowSpan={productsToDisplay.length}
                        align="center"
                        sx={{ verticalAlign: 'top' }}
                      >
                        <Stack height="100%" justifyContent="center">
                          <Box
                            width="100%"
                            height="100%"
                            alignItems="center"
                            justifyContent="center"
                          >
                            <ItemImage imageUrl={item.image_url} fill />
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell
                        rowSpan={productsToDisplay.length}
                        sx={{ verticalAlign: 'top' }}
                      >
                        <Stack
                          direction="column"
                          height="100%"
                          justifyContent="center"
                        >
                          <ItemText
                            sx={{ fontWeight: 'medium' }}
                            text={item.display_name ?? '-'}
                          />
                          <Typography variant="caption">
                            {item.expansion} {item.cardnumber} {item.rarity}
                          </Typography>
                        </Stack>
                      </TableCell>
                    </>
                  )}

                  <TableCell
                    align="center"
                    sx={{
                      borderBottom:
                        (!isExpanded && isFirstProduct) ||
                        (isExpanded && isLastProduct)
                          ? undefined
                          : 'none',
                    }}
                  >
                    <Stack
                      height="100%"
                      alignItems="center"
                      justifyContent="center"
                      direction="row"
                    >
                      <Typography variant="body2">
                        {product.condition_option_display_name}
                      </Typography>
                      {isFirstProduct && item.products.length > 1 && (
                        <IconButton
                          size="small"
                          onClick={() => toggleExpand(item.id)}
                        >
                          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
                      )}
                    </Stack>
                  </TableCell>

                  <TableCell
                    align="center"
                    sx={{
                      borderBottom:
                        (!isExpanded && isFirstProduct) ||
                        (isExpanded && isLastProduct)
                          ? undefined
                          : 'none',
                    }}
                  >
                    <Stack
                      height="100%"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Typography variant="body2">
                        {product.item_infinite_stock
                          ? '∞'
                          : selectedSpecialty?.id &&
                            product.specialty_id !== selectedSpecialty.id
                          ? '0点'
                          : `${product.stock_number}点`}
                      </Typography>
                    </Stack>
                  </TableCell>

                  <TableCell
                    align="center"
                    sx={{
                      borderBottom:
                        (!isExpanded && isFirstProduct) ||
                        (isExpanded && isLastProduct)
                          ? undefined
                          : 'none',
                    }}
                  >
                    <Stack
                      height="100%"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <NumericTextField
                        value={
                          prices[product.id] ??
                          product.specific_buy_price ??
                          product.buy_price ??
                          0
                        }
                        onChange={(value: number) =>
                          onPriceChange(product.id, value)
                        }
                        suffix="円"
                        size="small"
                        noSpin
                      />
                    </Stack>
                  </TableCell>

                  <TableCell
                    align="center"
                    sx={{
                      borderBottom:
                        (!isExpanded && isFirstProduct) ||
                        (isExpanded && isLastProduct)
                          ? undefined
                          : 'none',
                    }}
                  >
                    <Stack
                      height="100%"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <NumericTextField
                        // 管理番号を入力する場合は固定で1個
                        value={quantities[product.id] ?? 1}
                        onChange={(value: number) =>
                          onQuantityChange(product.id, value)
                        }
                        suffix="個"
                        size="small"
                      />
                    </Stack>
                  </TableCell>

                  <TableCell
                    align="center"
                    sx={{
                      borderBottom:
                        (!isExpanded && isFirstProduct) ||
                        (isExpanded && isLastProduct)
                          ? undefined
                          : 'none',
                    }}
                  >
                    <Stack
                      height="100%"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <PrimaryButton
                        variant="contained"
                        onClick={() => handleAdd(product.id, item)}
                        sx={{ minWidth: '80px' }}
                        loading={isCreateSpecialtyProductLoading}
                      >
                        追加
                      </PrimaryButton>
                    </Stack>
                  </TableCell>
                </TableRow>
              );
            })}
          </React.Fragment>
        );
      })}
    </TableBody>
  );
};
