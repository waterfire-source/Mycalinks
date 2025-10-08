import { Chip } from '@/components/chips/Chip';
import { CustomModalWithIcon } from '@/components/modals/CustomModalWithIcon';
import {
  CsvHistory,
  useGetCsvHistory,
} from '@/feature/store/hooks/useGetCsvHistory';
import { Box, Stack, Tooltip, Typography } from '@mui/material';
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';

import React from 'react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

export const CsvUploadHistoryModal = ({ isOpen, onClose }: Props) => {
  const { isLoading, csvHistories } = useGetCsvHistory({
    count: 10,
  });

  const columns: GridColDef[] = [
    {
      field: 'fileName',
      headerName: 'ファイル名',
      flex: 2,
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<CsvHistory>) => {
        return (
          <Stack
            spacing={0.5}
            sx={{
              width: '100%',
              height: '100%',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Stack spacing={0.5} sx={{ width: '70%' }}>
              <Typography sx={{ width: '100%', textAlign: 'left' }}>
                {params.row.fileName}
              </Typography>

              {/* targetData: 折り返し2段まで、横幅100% */}
              <Tooltip
                title={
                  <Stack direction="row" gap={0.5} flexWrap="wrap">
                    {params.row.targetData.map((data) => (
                      <Chip key={data} text={data} variant="secondary" />
                    ))}
                  </Stack>
                }
              >
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{
                    width: '100%',
                  }}
                >
                  {/* チップ表示（2行まで） */}
                  <Stack
                    direction="row"
                    gap={0.5}
                    width={'85%'}
                    maxHeight={'calc(2 * 20px + 13px)'}
                    overflow={'hidden'}
                    flexWrap={'wrap'}
                  >
                    {params.row.targetData.map((data) => (
                      <Chip key={data} text={data} variant="secondary" />
                    ))}
                  </Stack>

                  {/* タグ数表示 */}
                  <Typography sx={{ fontSize: '10px', whiteSpace: 'nowrap' }}>
                    全{params.row.targetData.length}個のタグ
                  </Typography>
                </Stack>
              </Tooltip>
            </Stack>
          </Stack>
        );
      },
    },
    {
      field: 'startedAt',
      headerName: '開始時刻',
      flex: 1.5,
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<CsvHistory>) => (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          {params.row.startedAt}
        </Box>
      ),
    },
    {
      field: 'taskCount',
      headerName: '件数',
      flex: 1,
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<CsvHistory>) => (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          {params.row.queuedCount}
        </Box>
      ),
    },
    {
      field: 'completeCount',
      headerName: '完了',
      flex: 1,
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<CsvHistory>) => (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          {params.row.processedCount}
        </Box>
      ),
    },
    {
      field: 'progressRate',
      headerName: '進捗',
      flex: 1,
      headerAlign: 'center',
      renderCell: (params: GridRenderCellParams<CsvHistory>) =>
        params.row.progressRate === '100.0' ? (
          <Box
            sx={{ display: 'flex', justifyContent: 'center', color: '#b82a2a' }}
          >
            {params.row.progressRate}%
          </Box>
        ) : (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            {params.row.progressRate}%
          </Box>
        ),
    },
  ];

  return (
    <CustomModalWithIcon
      open={isOpen}
      onClose={onClose}
      title="CSVアップロード進捗"
      width={'80%'}
      height={'80%'}
      cancelButtonText="とじる"
    >
      <Typography sx={{ height: '5%' }}>過去10件分のみ表示します</Typography>
      <DataGrid
        loading={isLoading}
        columns={columns}
        rows={csvHistories}
        sx={{
          height: '95%',
          borderTop: '8px solid #b82a2a',
          '& .MuiDataGrid-columnHeaderTitle': {
            color: 'grey.700',
          },
        }}
        rowHeight={120}
        hideFooter={true}
        disableColumnResize
        disableColumnSorting
      />
    </CustomModalWithIcon>
  );
};
