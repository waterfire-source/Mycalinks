import React from 'react';
import {
  Box,
  Typography,
  Button,
  Select,
  MenuItem,
  Card,
  SelectChangeEvent,
  Stack,
  CircularProgress,
} from '@mui/material';
import theme from '@/theme';

interface Props {
  children: React.ReactNode;
  itemsPerPage: number;
  currentPage: number;
  handleItemsPerPageChange: (event: SelectChangeEvent<number>) => void;
  handlePageChange: (page: number) => void;
  isLoading: boolean;
}
export const SearchResultView = ({
  children,
  itemsPerPage,
  currentPage,
  handleItemsPerPageChange,
  handlePageChange,
  isLoading,
}: Props) => {
  const FOOTER_HEIGHT = 50;
  return (
    <Card
      sx={{
        borderTop: `8px solid ${theme.palette.primary.main}`,
        flexGrow: 1,
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <Box height={`calc(100% - ${FOOTER_HEIGHT}px)`} px="16px" py="8px">
        {isLoading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
            }}
          >
            <CircularProgress data-testid="progress-circle" />
          </Box>
        ) : (
          children
        )}
      </Box>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{
          px: '10px',
          py: '10px',
          height: `${FOOTER_HEIGHT}px`,
          alignItems: 'center',
        }}
      >
        <Stack direction="row" alignItems="center">
          <Typography sx={{ marginRight: '10px' }}>表示件数:</Typography>
          <Select
            value={itemsPerPage}
            onChange={handleItemsPerPageChange}
            sx={{ width: '80px', height: '40px' }}
            size="small"
          >
            <MenuItem value={10}>10</MenuItem>
            <MenuItem value={30}>30</MenuItem>
            <MenuItem value={50}>50</MenuItem>
            <MenuItem value={100}>100</MenuItem>
          </Select>
        </Stack>
        <Stack direction="row" alignItems="center">
          <Button
            onClick={() => handlePageChange(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
          >
            前のページ
          </Button>
          <Button onClick={() => handlePageChange(currentPage + 1)}>
            次のページ
          </Button>
        </Stack>
      </Stack>
    </Card>
  );
};
