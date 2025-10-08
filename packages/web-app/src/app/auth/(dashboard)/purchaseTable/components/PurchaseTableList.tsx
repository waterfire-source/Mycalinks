import { useCallback, useEffect, useMemo, useState } from 'react';
import { Stack, Box } from '@mui/material';
import dayjs from 'dayjs';
import { ItemText } from '@/feature/item/components/ItemText';
import {
  Purchase_Table,
  Purchase_Table_Generated_Image,
  Purchase_Table_Item,
  PurchaseTableFormat,
  PurchaseTableOrder,
} from '@prisma/client';
import { DeletePurchaseTableButton } from '@/app/auth/(dashboard)/purchaseTable/components/DeletePurchaseTableButton';
import { Chip } from '@/components/chips/Chip';
import {
  InfiniteScrollCustomTable,
  ColumnDef,
} from '@/components/tables/InfiniteScrollCustomTable';
import { PaginationNav } from '@/components/pagination/PaginationNav';
import { type PurchaseTableResponse } from '@/feature/purchaseTable/hooks/usePurchaseTable';
import { PublishNotificationButton } from '@/app/auth/(dashboard)/purchaseTable/components/PublishNotificationButton';

interface Props {
  purchaseTableData: PurchaseTableResponse | undefined;
  setItemsInfo: React.Dispatch<
    React.SetStateAction<
      | {
          title: string;
          color: string;
          comment?: string;
          customTemplateImageUrl?: string;
          format: string;
          order: string;
          showStoreName: boolean;
          items: {
            itemId: number;
            displayPrice: number;
            anyModelNumber: boolean;
            isPsa10: boolean;
            orderNumber: number;
            imageUrl?: string;
            displayName?: string;
          }[];
        }
      | undefined
    >
  >;
  fetchPurchaseTable: (
    take?: number,
    skip?: number,
    search?: string,
  ) => Promise<PurchaseTableResponse | undefined>;
  isLoading: boolean;
  isCreated: boolean;
  setIsCreated: React.Dispatch<React.SetStateAction<boolean>>;
}

export const PurchaseTableList = ({
  purchaseTableData,
  setItemsInfo,
  fetchPurchaseTable,
  isLoading,
  isCreated,
  setIsCreated,
}: Props) => {
  // 商品をクリックしたときの処理
  const handleClick = useCallback(
    (
      purchaseTable: NonNullable<PurchaseTableResponse>['purchaseTables'][0],
    ) => {
      setItemsInfo({
        title: purchaseTable.title,
        color: purchaseTable.color,
        comment: purchaseTable.comment ?? undefined,
        customTemplateImageUrl:
          purchaseTable.custom_template_image_url ?? undefined,
        format: purchaseTable.format,
        order: purchaseTable.order,
        showStoreName: purchaseTable.show_store_name,
        items: purchaseTable.items.map(
          ({
            item_id,
            display_price,
            any_model_number,
            order_number,
            is_psa10,
          }) => ({
            itemId: item_id,
            displayPrice: display_price,
            anyModelNumber: any_model_number,
            orderNumber: order_number || 0,
            isPsa10: is_psa10,
            imageUrl: (
              purchaseTable.items.find((i) => i.item_id === item_id) as any
            )?.item?.image_url,
            displayName: (
              purchaseTable.items.find((i) => i.item_id === item_id) as any
            )?.item?.display_name,
          }),
        ),
      });
    },
    [setItemsInfo],
  );

  type TableRow = {
    id: number;
    title: string;
    created_at: string;
    items: Array<
      Purchase_Table_Item & {
        item?: {
          image_url?: string | null;
          display_name?: string | null;
        };
      }
    >;
    format: PurchaseTableFormat;
    order: PurchaseTableOrder;
    genreHandle: string | null;
    displayOnApp: boolean;
    originalData: Omit<Purchase_Table, 'created_at' | 'updated_at'> & {
      created_at: string;
      updated_at: string;
      items: Array<
        Purchase_Table_Item & {
          item?: {
            image_url?: string | null;
            display_name?: string | null;
          };
        }
      >;
      generated_images: Array<Purchase_Table_Generated_Image>;
    };
  };

  const columns: ColumnDef<TableRow>[] = [
    {
      header: 'タイトル',
      render: (row) => row.title,
      sx: { width: '20%', minWidth: 150 },
    },
    {
      header: '作成日',
      render: (row) => dayjs(row.created_at).format('YYYY/MM/DD'),
      sx: { width: '15%', minWidth: 120 },
    },
    {
      header: '掲載商品',
      render: (row) => (
        <Stack width="15vw">
          <ItemText
            text={row.items[0]?.item?.display_name || '商品名不明'}
            wrap
          />
          {row.items?.length > 1 && (
            <Chip text={`他${row.items.length - 1}商品`} variant="secondary" />
          )}
        </Stack>
      ),
      sx: { width: '30%', minWidth: 200 },
    },
    {
      header: 'フォーマット',
      render: (row) => getFormatText(row.format),
      sx: { width: '20%', minWidth: 150 },
    },
    {
      header: '並び順',
      render: (row) => getOrderText(row.order),
      sx: { width: '10%', minWidth: 100 },
    },
    {
      header: '',
      render: (row) => (
        <PublishNotificationButton
          purchaseTableId={row.id}
          genreHandle={row.genreHandle}
          displayOnApp={row.displayOnApp}
          fetchPurchaseTable={fetchPurchaseTable}
        />
      ),
      sx: { width: '5%', minWidth: 80 },
    },
    {
      header: '',
      render: (row) => (
        <DeletePurchaseTableButton
          purchaseTableId={row.id}
          fetchPurchaseTable={fetchPurchaseTable}
        />
      ),
      sx: { width: '5%', minWidth: 80 },
    },
  ];

  const rows: TableRow[] = useMemo(
    () =>
      purchaseTableData?.purchaseTables.map((table) => ({
        id: table.id,
        title: table.title,
        created_at: table.created_at ?? '',
        items: table.items as Array<
          Purchase_Table_Item & {
            item?: {
              image_url?: string | null;
              display_name?: string | null;
            };
          }
        >,
        format: table.format,
        order: table.order,
        genreHandle: table.genre_handle,
        displayOnApp: table.display_on_app,
        // 元のデータも保持（onRowClickで使用）
        originalData: table as Omit<
          Purchase_Table,
          'created_at' | 'updated_at'
        > & {
          created_at: string;
          updated_at: string;
          items: Array<
            Purchase_Table_Item & {
              item?: {
                image_url?: string | null;
                display_name?: string | null;
              };
            }
          >;
          generated_images: Array<Purchase_Table_Generated_Image>;
        },
      })) ?? [],
    [purchaseTableData?.purchaseTables],
  );

  // ページネーション用の状態
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const totalPages = Math.ceil((purchaseTableData?.totalCount || 0) / pageSize);

  // 買取表作成後にページをリセット
  useEffect(() => {
    if (isCreated) {
      setPage(1);
      fetchPurchaseTable(pageSize, 0);
      setIsCreated(false);
    }
  }, [isCreated]);

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          flex: 1,
          backgroundColor: 'white',
          borderTop: '8px solid',
          borderTopColor: 'primary.main',
          borderRadius: '4px',
          overflow: 'hidden',
        }}
      >
        <InfiniteScrollCustomTable
          columns={columns}
          rows={rows}
          isLoading={isLoading}
          rowKey={(row) => row.id}
          onRowClick={(row) => {
            if (row.originalData) {
              handleClick(row.originalData);
            }
          }}
          sx={{
            height: '100%',
            '& .MuiTableRow-root': {
              cursor: 'pointer',
              height: '80px',
            },
          }}
        />
      </Box>
      <PaginationNav
        currentPage={page}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={purchaseTableData?.totalCount || 0}
        onPageChange={(newPage) => {
          setPage(newPage);
          fetchPurchaseTable(pageSize, (newPage - 1) * pageSize);
        }}
        onPageSizeChange={(newPageSize) => {
          setPageSize(newPageSize);
          setPage(1);
          fetchPurchaseTable(newPageSize, 0);
        }}
      />
    </Box>
  );
};

const getFormatText = (format: PurchaseTableFormat) => {
  switch (format) {
    case PurchaseTableFormat.HORIZONTAL_8:
      return '横長8枚（縦2551px×3579px）';
    case PurchaseTableFormat.HORIZONTAL_18:
      return '横長18枚（縦2551px×3579px）';
    case PurchaseTableFormat.HORIZONTAL_36:
      return '横長36枚（縦2551px×3579px）';
    case PurchaseTableFormat.VERTICAL_4:
      return '縦長4枚（縦3579px×2551px）';
    case PurchaseTableFormat.VERTICAL_9:
      return '縦長9枚（縦3579px×2551px）';
    case PurchaseTableFormat.VERTICAL_16:
      return '縦長16枚（縦3579px×2551px）';
    case PurchaseTableFormat.VERTICAL_25:
      return '縦長25枚（縦3579px×2551px）';
    case PurchaseTableFormat.SQUARE_2:
      return '正方形2枚（縦4000px×横4000px）';
    case PurchaseTableFormat.SQUARE_6:
      return '正方形6枚（縦4000px×横4000px）';
    case PurchaseTableFormat.MONITOR_3:
      return 'モニター3枚（縦1080px×横1920px）';
    case PurchaseTableFormat.MONITOR_12:
      return 'モニター12枚（縦1080px×横1920px）';
    case PurchaseTableFormat.ENHANCED_1:
      return '正方形1枚（縦4000px×横4000px）';
    case PurchaseTableFormat.ENHANCED_2:
      return '長方形2枚（縦1108px×横1477px）';
  }
};

const getOrderText = (order: PurchaseTableOrder) => {
  switch (order) {
    case PurchaseTableOrder.PRICE_DESC:
      return '価格降順';
    case PurchaseTableOrder.PRICE_ASC:
      return '価格昇順';
    case PurchaseTableOrder.CUSTOM:
      return 'リスト順';
  }
};
