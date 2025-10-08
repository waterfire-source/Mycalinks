import { Box, Typography } from '@mui/material';
import { ToggleButtonGroup, ToggleButton } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

// ステータスの表示名マッピング
export const STATUS_MAP = {
  all: 'すべて',
  before_stock: '在庫確保前',
  confirming: '在庫確保中',
  unpaid: '未入金',
  unshipped: '未発送',
  shipping: '発送準備中',
  shipped: '発送準備完了',
  cancelled: '出荷済',
} as const;

// ステータスごとのアクション定義
export const STATUS_ACTIONS = {
  before_stock: {
    action: 'picking',
    label: 'ピッキング',
  },
  confirming: {
    action: 'complete_picking',
    label: 'ピッキング完了',
  },
  unpaid: null, // アクションなし
  unshipped: {
    action: 'prepare_shipping',
    label: '発送準備',
  },
  shipping: {
    action: 'complete_preparation',
    label: '発送準備完了',
  },
  shipped: {
    action: 'complete_shipping',
    label: '発送完了',
  },
  cancelled: null, // アクションなし
} as const;

// ステータスの型定義
export type StatusKey = keyof typeof STATUS_MAP;
export type StatusAction = keyof typeof STATUS_ACTIONS;

interface Props {
  status: StatusKey;
  onChange: (newStatus: StatusKey) => void;
}

export const ShippingStatusToggle = ({ status, onChange }: Props) => {
  return (
    <Box
      sx={{
        width: '100%',
        mb: 2,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <Typography
        variant="body2"
        sx={{
          height: '100%',
          width: '73px',
          minWidth: '73px',
          display: 'flex',
          alignItems: 'center',
          mb: 1,
        }}
      >
        ステータス
      </Typography>
      <ToggleButtonGroup
        value={status}
        exclusive
        onChange={(_, newStatus) => onChange(newStatus)}
        aria-label="order status"
        sx={{
          display: 'flex',
          alignItems: 'center',
          flexWrap: 'wrap',
          '& .MuiToggleButton-root': {
            borderRadius: '50px',
            border: '1px solid #ccc',
            mx: 0.5,
            minWidth: '120px',
            height: '36px',
            padding: '0 16px',
            '&.Mui-selected': {
              backgroundColor: 'primary.main',
              color: 'white',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
            },
          },
          '& .MuiToggleButtonGroup-grouped': {
            border: '1px solid #ccc',
            '&:not(:first-of-type)': {
              borderLeft: '1px solid #ccc',
            },
            '&:first-of-type': {
              marginLeft: 0,
            },
            '&:last-of-type': {
              marginRight: 0,
            },
          },
        }}
      >
        {Object.entries(STATUS_MAP).map(([key, label], index) => (
          <Box
            key={key}
            sx={{
              display: 'flex',
              mb: 1,
              alignItems: 'center',
            }}
          >
            <ToggleButton value={key}>{label}</ToggleButton>
            {index < Object.entries(STATUS_MAP).length - 1 && (
              <Box sx={{ mx: 0.5, width: '1rem' }}>
                {index !== 0 && (
                  <ArrowForwardIcon
                    sx={{
                      color: 'grey.500',
                      fontSize: '1rem',
                    }}
                  />
                )}
              </Box>
            )}
          </Box>
        ))}
      </ToggleButtonGroup>
    </Box>
  );
};
