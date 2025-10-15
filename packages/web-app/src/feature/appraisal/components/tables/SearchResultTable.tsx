import React, { useState } from 'react';
import {
  Box,
  IconButton,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell as MuiTableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  styled,
  Tooltip,
  TablePagination,
} from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { BackendItemAPI } from '@/app/api/store/[store_id]/item/api';
import NoImg from '@/components/common/NoImg';
import Image from 'next/image';
import { CartProduct } from '@/app/auth/(dashboard)/appraisal/register/page';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { ItemText } from '@/feature/item/components/ItemText';

interface Props {
  searchResults: BackendItemAPI[0]['response']['200']['items'][0][];
  onRegister: (product: CartProduct) => void;
  isLoading: boolean;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
}

const StyledHeaderCell = styled(MuiTableCell)(({ theme }) => ({
  textAlign: 'center',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  backgroundColor: theme.palette.grey[700],
  color: theme.palette.text.secondary,
}));

const StyledBodyCell = styled(MuiTableCell)(({ theme }) => ({
  textAlign: 'center',
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  verticalAlign: 'top',
}));

export const SearchResultTable: React.FC<Props> = ({
  searchResults,
  onRegister,
  isLoading,
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange,
  onPageSizeChange,
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

  const [selectedQuantities, setSelectedQuantities] = useState<{
    [key: number]: number;
  }>({});

  const handleQuantityChangeLocal = (id: number, quantity: number) => {
    setSelectedQuantities((prev) => ({
      ...prev,
      [id]: quantity,
    }));
  };

  const handleRegister = (
    product: BackendItemAPI[0]['response']['200']['items'][0]['products'][0],
  ) => {
    const quantity = selectedQuantities[product.id] || 1;
    const cartProduct: CartProduct = {
      ...product,
      item_count: quantity,
    };
    onRegister(cartProduct);
  };

  const handleChangePage = (
    event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number,
  ) => {
    onPageChange(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    onPageSizeChange(parseInt(event.target.value, 10));
  };

  return (
    <TableContainer
      component={Paper}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: 3,
      }}
    >
      <Box sx={{ flex: '1 1 auto', overflow: 'auto' }}>
        <Table
          stickyHeader
          sx={{
            width: '100%',
            tableLayout: 'fixed',
          }}
        >
          <TableHead>
            <TableRow>
              <StyledHeaderCell></StyledHeaderCell>
              <StyledHeaderCell>商品名</StyledHeaderCell>
              <StyledHeaderCell>型番</StyledHeaderCell>
              <StyledHeaderCell>状態</StyledHeaderCell>
              <StyledHeaderCell>仕入れ値</StyledHeaderCell>
              <StyledHeaderCell>在庫</StyledHeaderCell>
              <StyledHeaderCell>提出数</StyledHeaderCell>
              <StyledHeaderCell>登録</StyledHeaderCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <StyledBodyCell colSpan={8}>
                  <Box
                    sx={{
                      height: '100%',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      width: '100%',
                    }}
                  >
                    <CircularProgress />
                  </Box>
                </StyledBodyCell>
              </TableRow>
            ) : searchResults.length === 0 ? (
              <TableRow>
                <StyledBodyCell colSpan={8}>
                  検索結果が存在しません
                </StyledBodyCell>
              </TableRow>
            ) : (
              searchResults.map((item) => {
                const isExpanded = !!expandedItems[item.id];
                const productsToDisplay = isExpanded
                  ? item.products
                  : item.products.slice(0, 1);

                return (
                  <React.Fragment key={item.id}>
                    {productsToDisplay.map((product, index) => {
                      const isFirstProduct = index === 0;
                      const isLastProduct =
                        index === productsToDisplay.length - 1;

                      // 展開されたアイテムの追加行であれば、下線を削除
                      const removeBorder = isExpanded && !isLastProduct;
                      return (
                        <TableRow
                          key={`${item.id}-${product.id}`}
                          sx={{
                            borderBottom: removeBorder ? 'none' : undefined,
                          }}
                        >
                          {isFirstProduct && (
                            <>
                              {/* 画像セル */}
                              <StyledBodyCell
                                rowSpan={productsToDisplay.length}
                              >
                                {item.image_url ? (
                                  <Tooltip
                                    title={
                                      <Box
                                        component="img"
                                        src={item.image_url ?? ''}
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
                                        src={item.image_url}
                                        alt={item.display_name || '商品画像'}
                                        width={30}
                                        height={50}
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

                              {/* 商品名セル */}
                              <StyledBodyCell
                                rowSpan={productsToDisplay.length}
                              >
                                <ItemText text={item.display_name ?? '-'} />
                              </StyledBodyCell>

                              {/* 型番セル */}
                              <StyledBodyCell
                                rowSpan={productsToDisplay.length}
                              >
                                {item.cardnumber || '-'}
                              </StyledBodyCell>
                            </>
                          )}

                          {/* 状態セル */}
                          <StyledBodyCell
                            sx={{
                              borderBottom:
                                (!isExpanded && isFirstProduct) ||
                                (isExpanded && isLastProduct)
                                  ? undefined
                                  : 'none',
                            }}
                          >
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Typography variant="body2" sx={{ flexGrow: 1 }}>
                                {product.condition_option_display_name || '-'}
                              </Typography>
                              {isFirstProduct && (
                                <IconButton
                                  size="small"
                                  onClick={() => toggleExpand(item.id)}
                                  aria-label={
                                    isExpanded ? '折りたたむ' : '展開'
                                  }
                                >
                                  {isExpanded ? (
                                    <ExpandLessIcon />
                                  ) : (
                                    <ExpandMoreIcon />
                                  )}
                                </IconButton>
                              )}
                            </Box>
                          </StyledBodyCell>

                          {/* 仕入れ値セル */}
                          <StyledBodyCell
                            sx={{
                              borderBottom:
                                (!isExpanded && isFirstProduct) ||
                                (isExpanded && isLastProduct)
                                  ? undefined
                                  : 'none',
                            }}
                          >
                            <Typography variant="body2" sx={{ flexGrow: 1 }}>
                              {product.wholesale_price || '-'}
                            </Typography>
                          </StyledBodyCell>

                          {/* 在庫セル */}
                          <StyledBodyCell
                            sx={{
                              borderBottom:
                                (!isExpanded && isFirstProduct) ||
                                (isExpanded && isLastProduct)
                                  ? undefined
                                  : 'none',
                            }}
                          >
                            <Typography variant="body2" sx={{ flexGrow: 1 }}>
                              {product.stock_number || '0'}
                            </Typography>
                          </StyledBodyCell>

                          {/* 提出数セル */}
                          <StyledBodyCell
                            sx={{
                              borderBottom:
                                (!isExpanded && isFirstProduct) ||
                                (isExpanded && isLastProduct)
                                  ? undefined
                                  : 'none',
                            }}
                          >
                            <TextField
                              type="number"
                              size="small"
                              defaultValue={product.stock_number === 0 ? 0 : 1}
                              onChange={(e) =>
                                handleQuantityChangeLocal(
                                  product.id,
                                  Number(e.target.value),
                                )
                              }
                              inputProps={{
                                min: 0,
                                max: product.stock_number,
                              }}
                              disabled={product.stock_number === 0}
                            />
                          </StyledBodyCell>

                          {/* 登録セル */}
                          <StyledBodyCell
                            sx={{
                              borderBottom:
                                (!isExpanded && isFirstProduct) ||
                                (isExpanded && isLastProduct)
                                  ? undefined
                                  : 'none',
                            }}
                          >
                            <PrimaryButton
                              variant="contained"
                              size="small"
                              onClick={() => handleRegister(product)}
                              disabled={product.stock_number === 0}
                            >
                              登録
                            </PrimaryButton>
                          </StyledBodyCell>
                        </TableRow>
                      );
                    })}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </Box>

      <Box
        sx={{
          flexShrink: 0,
          borderTop: 1,
          borderColor: 'divider',
        }}
      >
        <TablePagination
          component="div"
          count={totalItems}
          page={currentPage}
          onPageChange={handleChangePage}
          rowsPerPage={itemsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[30, 50, 100, 200]}
          labelRowsPerPage="表示件数:"
        />
      </Box>
    </TableContainer>
  );
};
