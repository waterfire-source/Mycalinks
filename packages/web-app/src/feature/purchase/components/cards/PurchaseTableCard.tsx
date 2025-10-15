'use client';

import React, { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Box,
  Typography,
  styled,
  Stack,
  Zoom,
} from '@mui/material';
import { Add, Remove, Delete, LocalOffer } from '@mui/icons-material';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import NumericTextField from '@/components/inputFields/NumericTextField';
import Image from 'next/image';
import { DiscountModal } from '@/components/modals/discount/DiscountModal';
import NoImg from '@/components/common/NoImg';
import { usePurchaseCartContext } from '@/contexts/PurchaseCartContext';
import { calculatePurchaseDiscountPrice } from '@/feature/purchase/hooks/usePurchaseCart';
import { SearchButton } from '@/feature/purchase/components/buttons/SearchButton';
import { useConfirmationModal } from '@/contexts/ConfirmationModalContext';
import { useAccountGroupContext } from '@/contexts/AccountGroupProvider';
import { ItemText } from '@/feature/item/components/ItemText';
import { HelpIcon } from '@/components/common/HelpIcon';

const StyledBodyCell = styled(TableCell)(() => ({
  textAlign: 'center',
  verticalAlign: 'top',
}));

export const PurchaseTableCard: React.FC = () => {
  const {
    state,
    updateItemCount,
    updateUnitPrice,
    deleteCartItem,
    applyIndividualDiscount,
    addProducts,
  } = usePurchaseCartContext();

  // モーダル表示の制御
  const { setModalVisible } = useConfirmationModal(); // コンテキストから値を取得
  useEffect(() => {
    setModalVisible(state.carts.length > 0);
  }, [state.carts, setModalVisible]);

  const [isDiscountModalOpen, setIsDiscountModalOpen] =
    useState<boolean>(false);
  const [selectedDiscountTarget, setSelectedDiscountTarget] = useState<{
    productId: number;
    variantId: string;
  } | null>(null);

  const handleOpenDiscountModal = (
    productId: number,
    variantId: string,
  ): void => {
    setSelectedDiscountTarget({ productId, variantId });
    setIsDiscountModalOpen(true);
  };

  const handleCloseDiscountModal = (): void => {
    setSelectedDiscountTarget(null);
    setIsDiscountModalOpen(false);
  };

  const handleApplyDiscount = (
    discountValue: number,
    discountMode: '%' | '円',
  ) => {
    if (!selectedDiscountTarget) return;
    applyIndividualDiscount(
      selectedDiscountTarget.productId,
      selectedDiscountTarget.variantId,
      discountValue,
      discountMode,
    );
  };

  const duplicateSingleVariant = async (
    productId: number,
    variantId: string,
  ): Promise<void> => {
    const cartItem = state.carts.find((item) => item.productId === productId);
    if (!cartItem) {
      return;
    }

    const variant = cartItem.variants.find((v) => v.variantId === variantId);

    if (!variant) {
      return;
    }

    await addProducts({
      newProduct: cartItem,
      itemCount: 1,
      unitPrice: variant.unitPrice,
      isUnique: true,
    });
  };

  const formatDiscountDisplay = (discountAmount: string): string => {
    if (discountAmount.includes('%')) {
      const diff = Math.abs(parseFloat(discountAmount) - 100);
      return `${diff}%`;
    }
    return `${
      discountAmount.startsWith('-') ? discountAmount.slice(1) : discountAmount
    }円`;
  };

  // 買取で取得金額設定ができるかどうか
  const { accountGroup } = useAccountGroupContext();
  const canSetProductPrice =
    accountGroup?.set_buy_transaction_manual_product_price;

  return (
    <>
      <DiscountModal
        open={isDiscountModalOpen}
        onClose={handleCloseDiscountModal}
        onConfirm={handleApplyDiscount}
        type="purchase"
      />
      <TableContainer
        component={Paper}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 3,
        }}
      >
        <Table
          stickyHeader
          sx={{
            width: '100%',
            tableLayout: 'fixed',
          }}
        >
          <TableHead>
            <TableRow>
              {[
                { label: '商品画像', width: '13%' },
                { label: '商品名', width: '30%' },
                { label: '単価', width: '15%' },
                { label: '割増額', width: '10%' },
                { label: '数量', width: '15%' },
                { label: '合計', width: '10%' },
                { label: '', width: '7%' }, // 削除ボタンなどのスペース
              ].map(({ label, width }) => (
                <TableCell
                  key={label}
                  sx={{
                    backgroundColor: 'grey.700',
                    color: 'text.secondary',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    width, // 各列の幅を適用
                  }}
                >
                  {label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {state.carts.map((cart) => {
              const isExpanded = cart.variants.length > 1;

              return cart.variants.map((row, rowIndex) => {
                const isFirstRow = rowIndex === 0;
                const isLastRow = rowIndex === cart.variants.length - 1;
                const removeBorder = isExpanded && !isLastRow;

                return (
                  <TableRow
                    key={`${cart.productId}-${rowIndex}`}
                    sx={{
                      borderBottom: removeBorder ? 'none' : undefined,
                    }}
                  >
                    {/* 最初の行のみ表示するセル */}
                    {isFirstRow && (
                      <>
                        {/* 商品画像 */}
                        <StyledBodyCell rowSpan={cart.variants.length}>
                          {cart.imageUrl ? (
                            <Tooltip
                              title={
                                <Box
                                  component="img"
                                  src={cart.imageUrl}
                                  sx={{
                                    width: '150px',
                                    height: 'auto',
                                    objectFit: 'contain',
                                    flexShrink: 0,
                                  }}
                                />
                              }
                              arrow
                            >
                              <Box
                                sx={{
                                  display: 'flex',
                                  justifyContent: 'center',
                                }}
                              >
                                <Image
                                  src={cart.imageUrl}
                                  alt={cart.displayName || '商品画像'}
                                  width={150}
                                  height={60}
                                  style={{
                                    objectFit: 'contain',
                                    borderRadius: 4,
                                  }}
                                />
                              </Box>
                            </Tooltip>
                          ) : (
                            <NoImg />
                          )}
                        </StyledBodyCell>

                        {/* 商品名 */}
                        <StyledBodyCell rowSpan={cart.variants.length}>
                          <Stack flexDirection="column" gap={1}>
                            <ItemText text={cart.displayName} />
                            <Box
                              sx={{
                                backgroundColor: 'primary.main',
                                color: 'text.secondary',
                                borderRadius: '4px',
                                width: 'fit-content',
                                paddingX: 0.5,
                                paddingY: 0,
                              }}
                            >
                              {/* 状態(在庫数) */}
                              <Typography variant="caption" p={0}>
                                {cart.conditionName}
                                {cart.infinite_stock
                                  ? '( ∞ )'
                                  : `(${cart.stockNumber})`}
                              </Typography>
                            </Box>
                          </Stack>
                        </StyledBodyCell>
                      </>
                    )}

                    {/* 各バリエーションのセル */}
                    <StyledBodyCell
                      sx={{
                        borderBottom:
                          (!isExpanded && isFirstRow) ||
                          (isExpanded && isLastRow)
                            ? undefined
                            : 'none',
                      }}
                    >
                      <Stack
                        flexDirection="column"
                        alignItems="flex-start"
                        gap={1}
                      >
                        {/* unitPrice の変更欄 */}
                        <NumericTextField
                          value={row.unitPrice}
                          disabled={!canSetProductPrice}
                          onChange={(value) =>
                            updateUnitPrice(row.variantId, value ?? 0)
                          }
                          InputProps={{
                            inputProps: {
                              sx: {
                                paddingX: '0',
                                textAlign: 'center',
                              },
                            },
                          }}
                          size="small"
                          suffix="円"
                          noSpin
                        />

                        {/* 割引ボタン */}
                        {canSetProductPrice && (
                          <Stack flexDirection="row" gap={1}>
                            <Stack
                              flexDirection="column"
                              alignItems="center"
                              justifyContent="center"
                              gap={0.5}
                              sx={{
                                cursor: 'pointer',
                                textAlign: 'center',
                                color: 'primary.main',
                                borderBottom: '2px solid',
                                borderColor: 'primary.main',
                                width: 'fit-content',
                              }}
                              onClick={() =>
                                handleOpenDiscountModal(
                                  cart.productId,
                                  row.variantId,
                                )
                              }
                            >
                              <Box display="flex" alignItems="center" gap={0.5}>
                                <LocalOffer fontSize="inherit" />
                                <Typography
                                  variant="caption"
                                  sx={{ fontWeight: 600 }}
                                >
                                  割増
                                </Typography>
                              </Box>
                            </Stack>
                            <HelpIcon helpArchivesNumber={1121} />
                          </Stack>
                        )}
                      </Stack>
                    </StyledBodyCell>

                    <StyledBodyCell
                      sx={{
                        borderBottom:
                          (!isExpanded && isFirstRow) ||
                          (isExpanded && isLastRow)
                            ? undefined
                            : 'none',
                      }}
                    >
                      <Stack
                        flexDirection="column"
                        width="100%"
                        alignItems="center"
                      >
                        <Box>
                          {(
                            Math.abs(
                              calculatePurchaseDiscountPrice({
                                discountAmount:
                                  row.individualDiscount?.discountAmount ?? '0',
                                unitPrice: row.unitPrice,
                              }),
                            ) +
                            Math.abs(
                              calculatePurchaseDiscountPrice({
                                discountAmount: row.sale?.discountAmount ?? '0',
                                unitPrice: row.unitPrice,
                              }),
                            )
                          ).toLocaleString()}
                          円
                        </Box>
                        {row.sale && (
                          <Tooltip
                            title={
                              <Typography>
                                {row.sale.displayName}
                                <br />
                                割増額：
                                {formatDiscountDisplay(
                                  row.sale.discountAmount ?? '0',
                                )}
                                <br />
                                個数制限：
                                {row.sale.allowedItemCount === -1
                                  ? '無し'
                                  : `${row.sale.allowedItemCount}個まで`}
                              </Typography>
                            }
                            arrow
                            TransitionComponent={Zoom}
                          >
                            <Stack flexDirection="row" justifyContent="center">
                              <Typography variant="caption">
                                セール適用
                              </Typography>
                              <HelpOutlineIcon fontSize="inherit" />
                            </Stack>
                          </Tooltip>
                        )}
                      </Stack>
                    </StyledBodyCell>
                    <StyledBodyCell
                      sx={{
                        borderBottom:
                          (!isExpanded && isFirstRow) ||
                          (isExpanded && isLastRow)
                            ? undefined
                            : 'none',
                      }}
                    >
                      <Stack
                        flexDirection="column"
                        alignItems="flex-start"
                        gap={1}
                      >
                        <Stack
                          flexDirection="row"
                          width="100%"
                          alignItems="center"
                        >
                          <IconButton
                            onClick={() =>
                              updateItemCount(row.variantId, row.itemCount - 1)
                            }
                            size="small"
                          >
                            <Remove fontSize="inherit" />
                          </IconButton>
                          <NumericTextField
                            value={row.itemCount}
                            onChange={(value) =>
                              updateItemCount(row.variantId, value ?? 0)
                            }
                            InputProps={{
                              inputProps: {
                                sx: {
                                  paddingX: '0',
                                  textAlign: 'center',
                                },
                              },
                            }}
                            size="small"
                            noSpin
                          />
                          <IconButton
                            onClick={() =>
                              updateItemCount(row.variantId, row.itemCount + 1)
                            }
                            size="small"
                          >
                            <Add fontSize="inherit" />
                          </IconButton>
                        </Stack>

                        {/* 分割ボタン */}
                        <Stack
                          flexDirection="row"
                          gap={1}
                          justifyContent="center"
                          mx="auto"
                        >
                          <Stack
                            flexDirection="column"
                            alignItems="center"
                            justifyContent="center"
                            gap={0.5}
                            sx={{
                              cursor: 'pointer',
                              textAlign: 'center',
                              color: 'primary.main',
                              width: '100%',
                            }}
                            onClick={() =>
                              duplicateSingleVariant(
                                cart.productId,
                                row.variantId,
                              )
                            }
                          >
                            <Box
                              display="flex"
                              alignItems="center"
                              gap={0.5}
                              sx={{
                                borderBottom: '2px solid',
                                borderColor: 'primary.main',
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{ fontWeight: 600 }}
                              >
                                分割
                              </Typography>
                            </Box>
                          </Stack>
                          <HelpIcon helpArchivesNumber={1121} />
                        </Stack>
                      </Stack>
                    </StyledBodyCell>
                    <StyledBodyCell
                      sx={{
                        borderBottom:
                          (!isExpanded && isFirstRow) ||
                          (isExpanded && isLastRow)
                            ? undefined
                            : 'none',
                      }}
                    >
                      {(
                        (row.unitPrice +
                          Math.abs(
                            calculatePurchaseDiscountPrice({
                              discountAmount: row.sale?.discountAmount ?? '0',
                              unitPrice: row.unitPrice,
                            }),
                          ) +
                          Math.abs(
                            calculatePurchaseDiscountPrice({
                              discountAmount:
                                row.individualDiscount?.discountAmount ?? '0',
                              unitPrice: row.unitPrice,
                            }),
                          )) *
                        row.itemCount
                      ).toLocaleString()}
                      円
                    </StyledBodyCell>
                    <StyledBodyCell
                      sx={{
                        borderBottom:
                          (!isExpanded && isFirstRow) ||
                          (isExpanded && isLastRow)
                            ? undefined
                            : 'none',
                      }}
                    >
                      <IconButton
                        onClick={() => deleteCartItem(row.variantId)}
                        size="small"
                      >
                        <Delete />
                      </IconButton>
                    </StyledBodyCell>
                  </TableRow>
                );
              });
            })}
            <TableRow>
              <TableCell colSpan={7}>
                <Stack
                  p={1}
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="center"
                >
                  <SearchButton />
                </Stack>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};
