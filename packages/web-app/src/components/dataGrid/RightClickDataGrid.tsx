import { BackendItemAPI } from '@/app/api/store/[store_id]/item/api';
import { Box, Menu, MenuItem, SxProps } from '@mui/material';
import {
  DataGrid,
  GridColDef,
  GridRowParams,
  GridPaginationModel,
} from '@mui/x-data-grid';
import { jaJP } from '@mui/x-data-grid/locales';
import { useState, useEffect, MouseEvent } from 'react';

export interface FormattedItem {
  id: number;
  imageUrl: string | null;
  mycaItemId: number | null;
  displayName: string | null;
  displayNameRuby: string | null;
  buyPrice: number;
  sellPrice: number;
  productsStockNumber: number;
  rarity: string | null;
  packName: string | null;
  description: string | null;
  isBuyOnly: boolean;
  orderNumber: number;
  readonlyProductCode: string | null;
  products: BackendItemAPI[0]['response']['200']['items'][0]['products'];
  genreId: number | null;
  genreDisplayName: string | null;
  categoryId: number;
  categoryDisplayName: string | null;
  janCode: bigint | null;
  expansion: string | null;
  keyword: string | null;
  cardnumber: string | null;
  option1Value: number | string | null;
  option1Label: string | null;
  allowAutoPrintLabel: boolean;
  hide: boolean;
  allowRound: boolean;
  infiniteStock: boolean;
  tabletAllowed: boolean;
  marketPrice: number | null;
  marketPriceGapRate: number | null;
  releaseDate?: string | null;
}

//itemApiの戻り値を整形する関数
export const formatApiResponseToFormattedItem = (
  apiData: BackendItemAPI[0]['response']['200']['items'][0],
): FormattedItem => {
  const option1Meta = apiData.metas?.find(
    (meta) => meta.columnOnPosItem === 'card_type',
  );
  return {
    id: apiData.id,
    imageUrl: apiData.image_url || null,
    mycaItemId: apiData.myca_item_id || null,
    displayName: apiData.display_name || null,
    displayNameRuby: apiData.display_name_ruby || null,
    buyPrice: apiData.buy_price || 0,
    sellPrice: apiData.sell_price || 0,
    productsStockNumber: apiData.products_stock_number,
    rarity: apiData.rarity || null,
    packName: apiData.pack_name || null,
    description: apiData.description || null,
    isBuyOnly: apiData.is_buy_only || false,
    orderNumber: apiData.order_number || 0,
    readonlyProductCode: apiData.readonly_product_code || null,
    products: apiData.products || [],
    genreId: apiData.genre_id,
    genreDisplayName: apiData.genre_display_name || null,
    categoryId: apiData.category_id,
    categoryDisplayName: apiData.category_display_name || null,
    janCode: apiData.jan_code || null,
    expansion: apiData.expansion || null,
    keyword: apiData.keyword || null,
    cardnumber: apiData.cardnumber,
    option1Value: option1Meta?.value || null, // 該当する value を格納
    option1Label: option1Meta?.label || null, // 該当する label を格納
    allowAutoPrintLabel: apiData.allow_auto_print_label || true,
    hide: false,
    allowRound: apiData.allow_round || false,
    infiniteStock: apiData.infinite_stock || false,
    tabletAllowed: apiData.tablet_allowed,
    marketPrice: apiData.market_price || null,
    marketPriceGapRate: apiData.market_price_gap_rate || null,
    releaseDate: apiData.release_date || null,
  };
};

type Props = {
  rows: BackendItemAPI[0]['response']['200']['items'][0][];
  handleRowClick?: (params: GridRowParams) => void;
  columns: GridColDef[];
  sx?: SxProps;
  page: string;
  paginationModel: { page: number; pageSize: number; totalCount: number };
  onPageChange: (newPage: number) => void;
  onPageSizeChange: (newSize: number) => void;
  loading: boolean;
};

// フォーマット関数は既存のまま
const formatItem = (
  item: BackendItemAPI[0]['response']['200']['items'][0],
): FormattedItem => {
  // `metas` 配列から `columnOnPosItem` が `option1` の要素を探す
  //ここは動的に変わる予定
  const option1Meta = item.metas?.find(
    (meta) => meta.columnOnPosItem === 'card_type',
  );
  return {
    id: item.id,
    imageUrl: item.image_url || null,
    mycaItemId: item.myca_item_id || null,
    displayName: item.display_name || null,
    displayNameRuby: item.display_name_ruby || null,
    buyPrice: item.buy_price || 0,
    sellPrice: item.sell_price || 0,
    productsStockNumber: item.products_stock_number,
    rarity: item.rarity || null,
    packName: item.pack_name || null,
    description: item.description,
    isBuyOnly: item.is_buy_only,
    orderNumber: item.order_number,
    readonlyProductCode: item.readonly_product_code,
    products: item.products,
    genreId: item.genre_id,
    genreDisplayName: item.genre_display_name || null,
    categoryId: item.category_id,
    categoryDisplayName: item.category_display_name || null,
    janCode: item.jan_code || null,
    expansion: item.expansion || null,
    keyword: item.keyword || null,
    cardnumber: item.cardnumber || null,
    option1Value: option1Meta?.value || null, // 抽出した value を格納
    option1Label: option1Meta?.label || null,
    allowAutoPrintLabel: item.allow_auto_print_label ?? true,
    hide: false, //trueの場合は返ってこない
    allowRound: item.allow_round || false,
    infiniteStock: item.infinite_stock || false,
    tabletAllowed: item.tablet_allowed,
    marketPrice: item.market_price || null,
    marketPriceGapRate: item.market_price_gap_rate || null,
    releaseDate: item.release_date || null,
  };
};

export const RightClickDataGrid = ({
  rows,
  handleRowClick,
  columns,
  sx,
  page,
  paginationModel,
  onPageChange,
  onPageSizeChange,
  loading,
}: Props) => {
  const [formattedRows, setFormattedRows] = useState<FormattedItem[]>([]);
  const [contextMenu, setContextMenu] = useState<{
    mouseX: number;
    mouseY: number;
  } | null>(null);

  const [selectedRow, setSelectedRow] = useState<FormattedItem | null>(null);

  useEffect(() => {
    // console.info('取得出来た一覧', rows);
    const formattedItems = rows.map((item) => formatItem(item));
    setFormattedRows(formattedItems);
  }, [rows]);

  // コンテキストメニューを表示する関数
  const handleContextMenu = (event: MouseEvent<HTMLDivElement>) => {
    event.preventDefault(); // デフォルトの右クリックメニューを防止
    const id = event.currentTarget.getAttribute('data-id');
    if (id) {
      const row = formattedRows.find((row) => row.id === Number(id));
      setSelectedRow(row || null);
      setContextMenu(
        contextMenu === null
          ? { mouseX: event.clientX - 2, mouseY: event.clientY - 4 }
          : null,
      );
    }
  };

  // コンテキストメニューを閉じる関数
  const handleCloseContextMenu = () => {
    setContextMenu(null);
  };

  // コンテキストメニューの項目がクリックされたときの処理
  const handleMenuItemClick = (action: string) => {
    if (action === 'details' && selectedRow) {
      const itemId = selectedRow.id;
      let url = '';

      if (page === 'stock') {
        url = `/auth/stock/${itemId}`;
      } else if (page === 'item') {
        url = `/auth/item/${itemId}`;
        handleRowClick;
      }

      if (url) {
        window.open(url, '_blank');
      }
    }
    handleCloseContextMenu(); // メニューを閉じる
  };

  const handlePaginationModelChange = (model: GridPaginationModel) => {
    if (paginationModel.page !== model.page) {
      onPageChange(model.page);
    } else {
      onPageSizeChange(model.pageSize);
    }
  };

  return (
    <>
      <Box sx={{ ...sx }}>
        <DataGrid
          getRowHeight={() => 'auto'}
          rows={formattedRows}
          onRowClick={handleRowClick}
          columns={columns}
          paginationMode="server"
          paginationModel={{
            page: paginationModel.page,
            pageSize: paginationModel.pageSize,
          }}
          rowCount={paginationModel.totalCount}
          onPaginationModelChange={handlePaginationModelChange}
          localeText={jaJP.components.MuiDataGrid.defaultProps.localeText}
          pageSizeOptions={[30, 50, 100]}
          loading={loading}
          slotProps={{
            row: {
              onContextMenu: handleContextMenu,
              style: { cursor: 'context-menu' },
            },
          }}
          sx={{
            '& .MuiDataGrid-root': { border: 'none' },
            '& .MuiDataGrid-cell': { borderBottom: 'none', p: 1 },
            backgroundColor: 'common.white',
            color: 'text.primary',
          }}
        />
      </Box>
      <Menu
        open={contextMenu !== null}
        onClose={handleCloseContextMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null
            ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
            : undefined
        }
      >
        <MenuItem onClick={() => handleMenuItemClick('details')}>
          詳細を見る
        </MenuItem>
      </Menu>
    </>
  );
};
