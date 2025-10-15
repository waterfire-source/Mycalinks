import {
  Stack,
  Box,
  Typography,
  Tabs,
  Tab,
  Checkbox,
  FormControlLabel,
} from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { ChangeList } from '@/app/auth/(dashboard)/stock/components/detailModal/contents/StockChange/ChangeList';
import { ItemSearchState } from '@/feature/item/hooks/useItemSearch';
import { BackendProductAPI } from '@/app/api/store/[store_id]/product/api';
import { SelectedData } from '@/app/auth/(dashboard)/stock/components/detailModal/contents/StockChange/StockChange';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { palette } from '@/theme/palette';
import { transferProduct } from '@/app/auth/(dashboard)/stock/components/detailModal/StockDetailModal';
import { ItemText } from '@/feature/item/components/ItemText';
import React from 'react';

interface StockTransferProductDetailProps {
  detailData: BackendProductAPI[0]['response']['200']['products'][0][];
  productState: string | null;
  filteredTags: string[] | null;
  totalCount: number;
  selectedRows: SelectedData[];
  setSelectedRows: React.Dispatch<React.SetStateAction<SelectedData[]>>;
  searchItemState: ItemSearchState;
  transferDirection: 'in' | 'out';
  setTransferDirection: React.Dispatch<React.SetStateAction<'in' | 'out'>>;
  // wholesalePriceForStock: wholesalePrice[];
  // setSearchItem: React.Dispatch<
  //   React.SetStateAction<{
  //     rowId?: number;
  //     productId: number;
  //     productStock: number;
  //   } | null>
  // >;
  setTransferItems: React.Dispatch<React.SetStateAction<transferProduct[]>>;
  transferItems: transferProduct[];
  isReset: boolean;
  setIsReset: React.Dispatch<React.SetStateAction<boolean>>;
  storeId: number;
}

export const StockTransferProductDetail = ({
  detailData,
  productState,
  filteredTags,
  totalCount,
  selectedRows,
  setSelectedRows,
  searchItemState,
  transferDirection,
  setTransferDirection,
  // wholesalePriceForStock,
  // setSearchItem,
  setTransferItems,
  transferItems,
  isReset,
  setIsReset,
  storeId,
}: StockTransferProductDetailProps) => {
  const [noLabelPrint, setNoLabelPrint] = React.useState(false);

  const handleTabChange = (
    _event: React.SyntheticEvent,
    newValue: 'in' | 'out',
  ) => {
    setTransferDirection(newValue);
    // タブ切り替え時に選択をリセット
    setSelectedRows([]);
    setTransferItems([]);
  };

  // n→1転送用のtransferItemsを作成する関数
  const createNToOneTransferItems = React.useCallback(() => {
    if (!detailData[0]) return [];

    return selectedRows.map((row) => ({
      id: row.index, // indexを使用
      productId: detailData[0].id, // 現在の商品（転送先）
      itemCount: parseInt(row.count || '0'), // countをnumberに変換
      specificWholesalePrice: row.productWholesalePrice,
      stockNumber: detailData[0].stock_number,
      infiniteStock: detailData[0].item_infinite_stock,
      sourceProductId: row.productId, // 転送元の商品ID
      itemId: row.itemId,
      conditionOptionId: row.conditionOptionId,
    }));
  }, [selectedRows, detailData]);

  // タブ1（n→1）の場合、transferItemsを更新
  React.useEffect(() => {
    if (transferDirection === 'out') {
      const nToOneItems = createNToOneTransferItems();
      setTransferItems(nToOneItems);
    }
  }, [
    transferDirection,
    selectedRows,
    createNToOneTransferItems,
    setTransferItems,
  ]);

  // N→1の場合は矢印を反転
  const isReverseArrow =
    transferDirection === 'out' &&
    detailData[0]?.stock_number > 1 &&
    detailData[0]?.stock_number - totalCount === 1;

  return (
    <Stack
      height="100%"
      sx={{ backgroundColor: 'white', p: 1, overflow: 'hidden' }}
    >
      <Tabs
        value={transferDirection}
        onChange={handleTabChange}
        sx={{ height: '50px', mb: 2 }}
        variant="fullWidth"
        TabIndicatorProps={{ sx: { height: 3 } }}
      >
        <Tab
          label="この在庫から"
          value="in"
          sx={{
            color: transferDirection === 'in' ? undefined : 'black',
            fontWeight: transferDirection === 'in' ? 'bold' : 'normal',
          }}
        />
        <Tab
          label="この在庫へ"
          value="out"
          sx={{
            color: transferDirection === 'out' ? undefined : 'black',
            fontWeight: transferDirection === 'out' ? 'bold' : 'normal',
          }}
        />
      </Tabs>
      {transferDirection === 'in' && (
        <Stack sx={{ height: 'full', minHeight: 0 }}>
          <Stack
            direction="row"
            sx={{
              height: 'fit',
              alignItems: 'center',
              justifyContent: 'flex-start',
              py: '8px',
              gap: '12px',
            }}
          >
            <Box>
              <ItemImage imageUrl={detailData[0]?.image_url} height={100} />
            </Box>
            <Stack gap="8px">
              <ItemText wrap text={detailData[0]?.displayNameWithMeta} />
              <Stack direction="row" gap="12px" alignItems="center">
                {/* 商品状態を表示 */}
                <Box width="120px">
                  {productState && (
                    <Typography variant="body1">{productState}</Typography>
                  )}
                </Box>

                {/* タグ表示 */}
                {Array.isArray(filteredTags) && filteredTags.length > 0 && (
                  <Stack direction="row" gap="8px" alignItems="center">
                    <Typography
                      variant="body1"
                      sx={{
                        backgroundColor: 'grey.300',
                        color: 'black',
                        borderRadius: 4,
                        border: '1px solid',
                        borderColor: 'grey.500',
                        pr: 1,
                        pl: 1,
                        width: 'fit-content',
                      }}
                    >
                      {filteredTags[0]}
                    </Typography>

                    {/* 他のタグ数を表示 */}
                    {filteredTags.length > 1 && (
                      <Typography
                        variant="body1"
                        sx={{
                          fontSize: '0.75rem',
                        }}
                      >
                        他{filteredTags.length - 1}個のタグ
                      </Typography>
                    )}
                  </Stack>
                )}
              </Stack>
            </Stack>
          </Stack>
          {/* アイコン */}
          <Stack
            direction="row"
            sx={{
              width: '100%',
              height: '50px',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
              }}
            >
              <ArrowDropDownIcon
                color="disabled"
                sx={{
                  width: '200px',
                  height: '40px',
                  color: palette.grey[700],
                }}
              />
            </Box>
            <Box
              sx={{
                whiteSpace: 'nowrap',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
              }}
            >
              <Typography variant="body2">
                在庫数: {/* 無限在庫の場合は∞を表示 */}
                {detailData[0]?.item_infinite_stock
                  ? '∞'
                  : detailData[0]?.stock_number}{' '}
                →{' '}
                {detailData[0]?.item_infinite_stock
                  ? '∞'
                  : detailData[0]?.stock_number - totalCount || 0}
              </Typography>
            </Box>
          </Stack>
          {/* 変換リスト */}
          <ChangeList
            detailData={detailData}
            totalCount={totalCount}
            changeList={selectedRows}
            setSelectedRows={setSelectedRows}
            searchResults={searchItemState.searchResults}
            // wholesalePriceForStock={wholesalePriceForStock}
            // setSearchItem={setSearchItem}
            transferDirection={transferDirection}
            setTransferItems={setTransferItems}
            transferItems={transferItems}
            isReset={isReset}
            setIsReset={setIsReset}
            storeId={storeId}
          />
        </Stack>
      )}
      {transferDirection === 'out' && (
        <Stack sx={{ height: 'full', minHeight: 0 }}>
          <Stack
            direction="row"
            sx={{
              alignItems: 'center',
              justifyContent: 'flex-start',
              py: '8px',
              gap: '12px',
            }}
          >
            <Box>
              <ItemImage imageUrl={detailData[0]?.image_url} height={100} />
            </Box>
            <Stack gap="8px">
              <ItemText wrap text={detailData[0]?.displayNameWithMeta} />
              <Stack direction="row" gap="12px" alignItems="center">
                {/* 商品状態を表示 */}
                <Box width="120px">
                  {productState && (
                    <Typography variant="body1">{productState}</Typography>
                  )}
                </Box>

                {/* タグ表示 */}
                {Array.isArray(filteredTags) && filteredTags.length > 0 && (
                  <Stack direction="row" gap="8px" alignItems="center">
                    <Typography
                      variant="body1"
                      sx={{
                        backgroundColor: 'grey.300',
                        color: 'black',
                        borderRadius: 4,
                        border: '1px solid',
                        borderColor: 'grey.500',
                        pr: 1,
                        pl: 1,
                        width: 'fit-content',
                      }}
                    >
                      {filteredTags[0]}
                    </Typography>

                    {/* 他のタグ数を表示 */}
                    {filteredTags.length > 1 && (
                      <Typography
                        variant="body1"
                        sx={{
                          fontSize: '0.75rem',
                        }}
                      >
                        他{filteredTags.length - 1}個のタグ
                      </Typography>
                    )}
                  </Stack>
                )}
              </Stack>
            </Stack>
          </Stack>
          {/* ラベル印刷しないチェックボックス */}
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1, ml: 1 }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={noLabelPrint}
                  onChange={(e) => setNoLabelPrint(e.target.checked)}
                  color="primary"
                />
              }
              label="ラベル印刷しない"
            />
          </Box>
          {/* アイコン */}
          <Stack
            direction="row"
            sx={{
              width: '100%',
              height: '50px',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
              }}
            >
              <ArrowDropDownIcon
                color="disabled"
                sx={{
                  width: '200px',
                  height: '40px',
                  color: palette.grey[700],
                  transform: 'rotate(180deg)',
                  transition: 'transform 0.2s',
                }}
              />
            </Box>
            <Box
              sx={{
                whiteSpace: 'nowrap',
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
              }}
            >
              <Typography variant="body2">
                在庫数: {/* 無限在庫の場合は∞を表示 */}
                {detailData[0]?.item_infinite_stock
                  ? '∞'
                  : detailData[0]?.stock_number}{' '}
                →{' '}
                {detailData[0]?.item_infinite_stock
                  ? '∞'
                  : detailData[0]?.stock_number + totalCount || 0}
              </Typography>
            </Box>
          </Stack>
          {/* 変換リスト */}
          <ChangeList
            detailData={detailData}
            totalCount={totalCount}
            changeList={selectedRows}
            setSelectedRows={setSelectedRows}
            searchResults={searchItemState.searchResults}
            transferDirection={transferDirection}
            setTransferItems={setTransferItems}
            transferItems={transferItems}
            isReset={isReset}
            setIsReset={setIsReset}
            storeId={storeId}
          />
        </Stack>
      )}
    </Stack>
  );
};
