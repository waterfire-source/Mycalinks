import { Box, TableBody, TableCell, TableRow, Typography } from '@mui/material';
import {
  TransactionCart,
  TransactionCartItem,
} from '@/feature/purchaseReception/hooks/useTransactionCart';
import { BackendTransactionAPI } from '@/app/api/store/[store_id]/transaction/api';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { ItemText } from '@/feature/item/components/ItemText';
import { useGetSpecialty } from '@/feature/specialty/hooks/useGetSpecialty';
import { SetStateAction, useEffect } from 'react';
import { CommonCheckbox } from '@/feature/purchaseReception/components/modals/modalComponents/common/CommonCheckbox';
import { useUpdateProduct } from '@/feature/products/hooks/useUpdateProduct';
import { EditManagementNumberField } from '@/components/inputFields/EditManagementNumberField';
const ComponentGroup = ({ children }: { children: React.ReactNode[] }) => {
  const filteredChildren = children.filter(
    (child) => child !== undefined && child !== null && child !== '',
  );

  return filteredChildren.length > 0 ? (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center', // 中央揃え
      }}
    >
      {filteredChildren.map((child, index) => (
        <Box
          key={index}
          sx={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {/* 子要素 */}
          <Box
            sx={{
              backgroundColor: 'grey.200',
              padding: '2px 12px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: '10px',
                whiteSpace: 'nowrap',
              }}
            >
              {child}
            </Typography>
          </Box>

          {/* "＞" の表示（最後の要素以外に表示） */}
          {index < filteredChildren.length - 1 && (
            <Typography
              sx={{
                margin: '0 8px',
                fontSize: '12px',
              }}
            >
              ＞
            </Typography>
          )}
        </Box>
      ))}
    </Box>
  ) : null;
};

type Props = {
  cartItems: TransactionCart | null;
  setCartItems: React.Dispatch<SetStateAction<TransactionCart | null>>;
  customerCartItems:
    | BackendTransactionAPI[5]['response']['200']['transactions'][0]['transaction_customer_carts']
    | null;
  selectedItems: { id: number; count: number }[];
  setSelectedItems: React.Dispatch<
    React.SetStateAction<{ id: number; count: number }[]>
  >;
  transaction: BackendTransactionAPI[5]['response']['200']['transactions'][0];
};

export const DetailTableBody = ({
  cartItems,
  setCartItems,
  customerCartItems,
  selectedItems,
  setSelectedItems,
  transaction,
}: Props) => {
  const { specialties, fetchSpecialty, isLoading } = useGetSpecialty();
  const { updateProduct, isLoadingUpdateProduct } = useUpdateProduct();

  useEffect(() => {
    try {
      fetchSpecialty();
    } catch (error) {
      console.error(error);
    }
  }, []);
  // 個数の変更を検知し計算する（customerCartItemsのoriginal_item_countを使用）
  const highlightIfQuantityDiffers = (
    item: TransactionCartItem & {
      original_item_count: number;
    },
  ) => {
    if (item.item_count !== item.original_item_count) {
      return (
        <Box>
          <Typography
            variant="body2"
            sx={{ color: '#8b0000' }}
          >{`${item.original_item_count} → ${item.item_count}`}</Typography>
          <Typography variant="caption" sx={{ color: '#8b0000' }}>
            お客様による変更あり
          </Typography>
        </Box>
      );
    }
    return <Typography variant="body2">{item.item_count}</Typography>;
  };

  // 「商品ID」と「単価」の両方が一致する customerCartItem を探し、
  // 枚数（item_count）を上書きしつつ、元の枚数（original_item_count）も保持する
  const formattedCartItems = cartItems?.transaction_cart_items.map((item) => {
    const matchedCustomerCart = customerCartItems?.find((customerItem) => {
      return (
        customerItem.product_id === item.product_details.id &&
        customerItem.unit_price === item.unit_price
      );
    });

    return {
      ...item,
      item_count: matchedCustomerCart?.item_count ?? item.item_count,
      original_item_count: matchedCustomerCart
        ? matchedCustomerCart.original_item_count
        : item.item_count,
    };
  });

  return (
    <TableBody>
      {formattedCartItems?.map(
        (
          item: TransactionCartItem & {
            original_item_count: number | null;
          },
          index: number,
        ) => {
          return (
            <TableRow key={index}>
              {transaction.payment && (
                <TableCell
                  component="td"
                  align="center"
                  sx={{
                    padding: '8px',
                    textAlign: 'center',
                    verticalAlign: 'middle',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: '100%',
                    }}
                  >
                    <CommonCheckbox
                      checked={
                        !!selectedItems.filter(
                          (i) => i.id === item.product_details.id,
                        ).length
                      }
                      onChange={() =>
                        setSelectedItems(
                          (prev: { id: number; count: number }[]) => {
                            const itemsWithoutThis = [...prev].filter(
                              (i) => i.id !== item.product_details.id,
                            );

                            const isChecked =
                              itemsWithoutThis.length !== prev.length;

                            if (isChecked) return itemsWithoutThis;
                            return [
                              ...prev,
                              {
                                id: item.product_details.id,
                                count: item.item_count,
                              },
                            ];
                          },
                        )
                      }
                      label=""
                    />
                  </Box>
                </TableCell>
              )}
              {/* 画像 */}
              <TableCell
                component="td"
                align="center"
                sx={{ textAlign: 'center' }}
              >
                <ItemImage
                  imageUrl={item.product_details.image_url || ''}
                  height={80}
                />
              </TableCell>
              {/* 商品名 */}
              <TableCell
                component="td"
                sx={{
                  minWidth: '200px',
                  whiteSpace: 'normal',
                  wordBreak: 'break-word',
                }}
              >
                <ItemText text={item.product_details.displayNameWithMeta} />
                <ComponentGroup>
                  {[item.productGenreName, item.productCategoryName]}
                </ComponentGroup>
              </TableCell>
              {/* 状態 */}
              <TableCell component="td" align="center">
                {item.product_details.conditionDisplayName || '不明'}
              </TableCell>
              {/* 査定金額 */}
              <TableCell
                component="td"
                align="center"
                sx={{ color: 'inherit' }}
              >
                {(() => {
                  const unitPrice = item.unit_price;
                  const discountPrice = item.discount_price ?? 0;
                  const total = (unitPrice + discountPrice) * item.item_count;
                  return `${total.toLocaleString()}円`;
                })()}
              </TableCell>
              {/* 枚数 */}
              <TableCell component="td" align="center">
                {highlightIfQuantityDiffers({
                  ...item,
                  original_item_count: item.original_item_count ?? 0,
                })}
              </TableCell>
              {/* 販売価格 */}
              <TableCell component="td" align="center">
                {item.product_details.actual_sell_price}円
              </TableCell>
              {/* 仕入れ値平均額 */}
              <TableCell component="td" align="center">
                {item.product_details.average_wholesale_price}円
              </TableCell>
              {transaction.payment ? (
                <TableCell
                  component="td"
                  align="center"
                  style={{ fontWeight: 'bold', color: 'grey' }}
                >
                  {item.hasManagementNumber && (
                    <EditManagementNumberField
                      initValue={item.managementNumber || ''}
                      productId={item.product_details.id}
                      updateProduct={updateProduct}
                      loading={isLoadingUpdateProduct}
                    />
                  )}
                </TableCell>
              ) : (
                //備考はproduct_detailsに存在しない。備考欄の用途不明
                <TableCell
                  component="td"
                  align="center"
                  style={{ fontWeight: 'bold', color: 'gray' }}
                ></TableCell>
              )}
            </TableRow>
          );
        },
      )}
    </TableBody>
  );
};
