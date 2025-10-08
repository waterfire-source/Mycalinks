import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  SelectChangeEvent,
} from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';

interface PaginationNavProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  pageSizeOptions?: number[];
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export const PaginationNav: React.FC<PaginationNavProps> = ({
  currentPage,
  totalPages,
  pageSize,
  pageSizeOptions = [20, 50, 100],
  totalItems,
  onPageChange,
  onPageSizeChange,
}) => {
  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const handlePageSizeChange = (event: SelectChangeEvent<unknown>) => {
    onPageSizeChange(Number(event.target.value));
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        flexDirection: 'row-reverse',
        px: 2,
        py: 1,
        backgroundColor: 'white',
        borderTop: '1px solid',
        borderColor: 'divider',
        gap: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <IconButton
          size="small"
          onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || totalPages === 0}
          sx={{ p: 0.5 }}
        >
          <ChevronLeft />
        </IconButton>

        <IconButton
          size="small"
          onClick={() =>
            currentPage < totalPages && onPageChange(currentPage + 1)
          }
          disabled={currentPage >= totalPages || totalPages === 0}
          sx={{ p: 0.5 }}
        >
          <ChevronRight />
        </IconButton>
      </Box>

      <Typography variant="body2">
        {totalItems > 0 ? `${startItem} ~ ${endItem} / ${totalItems}` : '0件'}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2">ページあたりの行数:</Typography>
        <FormControl size="small">
          <Select
            value={pageSize}
            onChange={handlePageSizeChange}
            sx={{
              minWidth: 80,
              '& .MuiSelect-select': {
                py: 0.5,
              },
              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
            }}
          >
            {pageSizeOptions.map((option) => (
              <MenuItem key={option} value={option}>
                {option}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
};
