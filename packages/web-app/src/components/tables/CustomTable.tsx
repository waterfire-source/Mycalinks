import React, { useCallback, useEffect, useRef } from 'react';
import {
  Box,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  SxProps,
  Theme,
  Typography,
} from '@mui/material';
import { palette } from '@/theme/palette';

/**
 * カラム定義
 *  - header: 表示するヘッダ
 *  - render: 1行ごとの表示ロジック
 *  - key:   カラムのキー
 *  - sx?:     セルのスタイル
 *  - isHideColumn?:カラムを隠すかどうか(フィルタリングのみに追加など)
 */
export interface ColumnDef<DataType> {
  header: React.ReactNode;
  render: (item: DataType) => React.ReactNode;
  key?: string;
  sx?: SxProps<Theme>;
  isHideColumn?: boolean; // カラムを隠すかどうか
}

export interface CustomTableProps<DataType> {
  columns: ColumnDef<DataType>[];
  rows: DataType[];
  isLoading?: boolean;
  rowKey: (item: DataType, index?: number) => string | number;
  onRowClick?: (
    item: DataType,
    event?: React.MouseEvent<HTMLTableRowElement, MouseEvent>,
  ) => void;
  selectedRow?: DataType | null;
  selectedRowKey?: string | number | null; // 選択中の行のキー(selectedRowが使えるならそっちを使う、packages/web-app/src/feature/ec/setting/delivery/components/DeliverySettingsList.tsx参照)
  onScrollToBottom?: () => void;
  sx?: SxProps<Theme>;
  tableWrapperSx?: SxProps<Theme>;
  hasRedLine?: boolean;
  headerText?: string;
  customFooter?: React.ReactNode;
}

export function CustomTable<DataType>(props: CustomTableProps<DataType>) {
  const {
    columns,
    rows,
    isLoading = false,
    rowKey,
    onRowClick,
    selectedRow,
    selectedRowKey,
    onScrollToBottom,
    sx: tableContainerSx,
    tableWrapperSx,
    hasRedLine = false,
    headerText,
    customFooter,
  } = props;

  const tableHeaderStyle: SxProps<Theme> = {
    backgroundColor: 'white',
    py: 1,
    color: 'grey.700',
    textAlign: 'center',
  };

  const tableRef = useRef<HTMLDivElement>(null);

  // スクロールハンドラ
  const handleScrollToBottom = useCallback((): void => {
    if (!tableRef.current || onScrollToBottom === undefined) return;

    const { scrollTop, scrollHeight, clientHeight } = tableRef.current;
    // スクロールが下端に近づいたら実行
    if (scrollTop + clientHeight >= scrollHeight - 50) {
      onScrollToBottom();
    }
  }, [onScrollToBottom]);

  // スクロールイベントリスナーの設定
  useEffect(() => {
    const tableElement = tableRef.current;
    if (tableElement) {
      tableElement.addEventListener('scroll', handleScrollToBottom);
      return () =>
        tableElement.removeEventListener('scroll', handleScrollToBottom);
    }
  }, [handleScrollToBottom]);

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...tableWrapperSx,
      }}
    >
      <TableContainer
        sx={{
          flex: 1,
          overflow: 'auto',
          backgroundColor: palette.common.white,
          borderTop: hasRedLine ? `8px solid ${palette.primary.main}` : '',
          borderRadius: hasRedLine ? '4px' : '',
          minHeight: 0,
          ...tableContainerSx,
        }}
        ref={tableRef}
      >
        {headerText && (
          <Typography
            variant="h1"
            sx={{
              p: 2,
              mb: 2,
              px: 5,
              borderBottom: '1px solid rgba(224, 224, 224, 1)',
            }}
          >
            {headerText}
          </Typography>
        )}
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns
                .filter((col) => !col.isHideColumn)
                .map((col, idx) => (
                  <TableCell key={idx} sx={{ ...tableHeaderStyle, ...col.sx }}>
                    {col.header}
                  </TableCell>
                ))}
            </TableRow>
          </TableHead>
          <TableBody sx={{ backgroundColor: 'white' }}>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'center', py: 2 }}
                  >
                    <CircularProgress />
                  </Box>
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length}>
                  <Box
                    sx={{ display: 'flex', justifyContent: 'center', py: 2 }}
                  >
                    <Typography>データがありません</Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((item, i) => {
                const keyValue = rowKey(item, i);
                const isSelected = () => {
                  if (selectedRow) return rowKey(selectedRow) === keyValue;
                  if (selectedRowKey) return selectedRowKey === keyValue;
                  return false;
                };
                return (
                  <TableRow
                    key={keyValue}
                    sx={{
                      cursor: onRowClick ? 'pointer' : 'inherit',
                    }}
                    onClick={(event) => {
                      const target = event.target as HTMLElement;
                      // テーブルのセルをクリックした場合のみonRowClickを実行
                      if (
                        target.closest('button') ||
                        target.closest('checkbox') ||
                        target.closest('input')
                      ) {
                        return;
                      }
                      if (target.closest('td')) {
                        onRowClick?.(item, event);
                      }
                    }}
                  >
                    {columns
                      .filter((col) => !col.isHideColumn)
                      .map((col, cIndex) => (
                        <TableCell
                          key={cIndex}
                          sx={{
                            '&.MuiTableCell-root': {
                              backgroundColor: isSelected()
                                ? 'rgba(255, 0, 0, 0.1)'
                                : 'inherit',
                            },
                            textAlign: 'center',
                            ...(col.sx || {}),
                          }}
                        >
                          {col.render(item)}
                        </TableCell>
                      ))}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* カスタムフッター */}
      {customFooter && (
        <Box
          sx={{
            width: '100%',
            height: '57px',
            backgroundColor: 'common.white',
            boxShadow: '0px -4px 4px rgba(0, 0, 0, 0.1)',
            '@media (max-width: 1400px)': {
              height: '51px',
            },
            borderRadius: '8px',
          }}
        >
          {customFooter}
        </Box>
      )}
    </Box>
  );
}
