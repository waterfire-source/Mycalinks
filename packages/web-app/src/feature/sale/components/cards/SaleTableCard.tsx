'use client';

import React, { useState } from 'react';
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
import { useSaleCartContext } from '@/contexts/SaleCartContext';
import { DiscountModal } from '@/components/modals/discount/DiscountModal';
import NoImg from '@/components/common/NoImg';
import {
  calculateDiscountPrice,
  calculateTotalDiscount,
} from '@/feature/sale/hooks/useSaleCart';
import { SearchButton } from '@/feature/sale/components/buttons/SearchButton';
import { useEffect } from 'react';
import { useConfirmationModal } from '@/contexts/ConfirmationModalContext';
import { useAccountGroupContext } from '@/contexts/AccountGroupProvider';
import { HelpIcon } from '@/components/common/HelpIcon';

const StyledBodyCell = styled(TableCell)(() => ({
  textAlign: 'center',
  verticalAlign: 'top',
}));

type Props = {
  isReservationDeposit: boolean;
};

export const SaleTableCard = ({ isReservationDeposit }: Props) => {
  const {
    state,
    updateItemCount,
    updateUnitPrice,
    deleteCartItem,
    applyIndividualDiscount,
    addProducts,
  } = useSaleCartContext();

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
    if (!cartItem) return;

    const totalCount = cartItem.variants.reduce(
      (acc, current) => acc + current.itemCount,
      0,
    );

    if (cartItem.stockNumber === totalCount) return;

    const variant = cartItem.variants.find((v) => v.variantId === variantId);

    if (!variant) return;

    await addProducts({
      newProduct: cartItem,
      itemCount: 1,
      unitPrice: variant.unitPrice,
      isUnique: true,
    });
  };

  const formatDiscountDisplay = (discountAmount: string): string => {
    if (discountAmount.includes('%')) {
      return `${100 - parseFloat(discountAmount)}%`;
    }
    return `${
      discountAmount.startsWith('-') ? discountAmount.slice(1) : discountAmount
    }円`;
  };

  // 手動値引きの権限があるか
  const { accountGroup } = useAccountGroupContext();
  const hasManualDiscount = accountGroup?.set_transaction_manual_discount;

  return (
    <>
      <DiscountModal
        open={isDiscountModalOpen}
        onClose={handleCloseDiscountModal}
        onConfirm={handleApplyDiscount}
        type="sale"
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
                { label: '商品画像', width: '13' },
                { label: '商品名', width: '30%' },
                { label: '単価', width: '15%' },
                { label: '割引額', width: '10%' },
                { label: '数量', width: '15%' },
                { label: '合計', width: '10%' },
                { label: '', width: '7%' }, // 削除ボタンなどのスペース
              ].map(({ label, width }) => (
                <TableCell
                  key={label}
                  sx={{
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
                            <Typography variant="body1" textAlign="left">
                              {cart.displayName}
                              {cart.managementNumber &&
                                ` (${cart.managementNumber})`}
                              {cart.consignmentClientId &&
                                (cart.consignmentClientDisplayName ||
                                  cart.consignmentClientFullName) &&
                                ` (委託者：${
                                  cart.consignmentClientDisplayName ||
                                  cart.consignmentClientFullName
                                })`}
                            </Typography>
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
                                  ? '(∞)'
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
                          value={
                            isReservationDeposit
                              ? row.reservationPrice ?? 0 / row.itemCount
                              : row.unitPrice
                          }
                          onChange={(value) =>
                            updateUnitPrice(row.variantId, value ?? 0)
                          }
                          disabled={!hasManualDiscount || isReservationDeposit}
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
                        {hasManualDiscount &&
                          !isReservationDeposit &&
                          !cart.consignmentClientId && (
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
                                <Box
                                  display="flex"
                                  alignItems="center"
                                  gap={0.5}
                                >
                                  <LocalOffer fontSize="inherit" />
                                  <Typography
                                    variant="caption"
                                    sx={{ fontWeight: 600 }}
                                  >
                                    割引
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
                        {isReservationDeposit ? (
                          <Typography>-</Typography>
                        ) : (
                          <>
                            <Box>
                              {Math.abs(
                                calculateTotalDiscount({
                                  individualDiscount:
                                    row.individualDiscount?.discountAmount ??
                                    undefined,
                                  saleDiscount:
                                    row.sale?.discountAmount ?? undefined,
                                  reservationPrice: row.reservationPrice,
                                  unitPrice: row.unitPrice,
                                }),
                              ).toLocaleString()}
                              円
                            </Box>
                            {row.sale && (
                              <Tooltip
                                title={
                                  <Typography>
                                    {row.sale.displayName}
                                    <br />
                                    割引額：
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
                                <Stack
                                  flexDirection="row"
                                  justifyContent="center"
                                >
                                  <Typography variant="caption">
                                    セール適用
                                  </Typography>
                                  <HelpOutlineIcon fontSize="inherit" />
                                </Stack>
                              </Tooltip>
                            )}
                            {!!row.reservationReceptionProductIdForReceive &&
                              row.reservationPrice && (
                                <Typography
                                  color="primary.main"
                                  variant="caption"
                                  sx={{ fontWeight: 600 }}
                                >
                                  前金分
                                  {Math.abs(
                                    row.reservationPrice,
                                  ).toLocaleString()}
                                  円
                                </Typography>
                              )}
                          </>
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
                            disabled={
                              isReservationDeposit ||
                              !!row.reservationReceptionProductIdForReceive
                            }
                          >
                            <Remove fontSize="inherit" />
                          </IconButton>
                          <NumericTextField
                            value={row.itemCount}
                            min={1}
                            onChange={(value) =>
                              updateItemCount(row.variantId, value)
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
                            disabled={
                              isReservationDeposit ||
                              !!row.reservationReceptionProductIdForReceive
                            }
                          />
                          <IconButton
                            onClick={() =>
                              updateItemCount(row.variantId, row.itemCount + 1)
                            }
                            size="small"
                            disabled={
                              isReservationDeposit ||
                              !!row.reservationReceptionProductIdForReceive
                            }
                          >
                            <Add fontSize="inherit" />
                          </IconButton>
                        </Stack>

                        {/* 分割ボタン */}
                        {!isReservationDeposit &&
                          !row.reservationReceptionProductIdForReceive &&
                          !cart.consignmentClientId && (
                            <Stack flexDirection="row" gap={1} mx="auto">
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
                      {isReservationDeposit
                        ? (
                            row.reservationPrice ?? 0 * row.itemCount
                          ).toLocaleString()
                        : (
                            (row.unitPrice -
                              Math.abs(
                                calculateDiscountPrice({
                                  discountAmount:
                                    row.sale?.discountAmount ?? '0',
                                  unitPrice: row.unitPrice,
                                }),
                              ) -
                              Math.abs(
                                calculateDiscountPrice({
                                  discountAmount:
                                    row.individualDiscount?.discountAmount ??
                                    '0',
                                  unitPrice: row.unitPrice,
                                }),
                              ) -
                              Math.abs(
                                calculateDiscountPrice({
                                  reservationPrice: row.reservationPrice,
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
            {!isReservationDeposit && (
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
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};
