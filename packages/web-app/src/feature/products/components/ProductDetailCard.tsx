import React, { useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Select,
  MenuItem,
  TextField,
  useMediaQuery,
  styled,
  SelectChangeEvent,
} from '@mui/material';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import theme from '@/theme';
import TagLabel from '@/components/common/TagLabel';
import NoImg from '@/components/common/NoImg';

interface Condition {
  name: string;
  buyPrice: number | null;
  sellPrice: number | null;
  tags: string[];
  stockNumber: number;
  onRegister: (registerCount: number) => void;
}

interface ProductDetailCardProps {
  imageUrl: string;
  title: string;
  conditions: Condition[];
  isStockRestriction: boolean;
}

export const ProductDetailCard: React.FC<ProductDetailCardProps> = ({
  imageUrl,
  title,
  conditions,
  isStockRestriction,
}) => {
  const [selectedCondition, setSelectedCondition] = useState(conditions[0]);
  const [registerCount, setRegisterCount] = useState<number>(
    isStockRestriction ? (selectedCondition.stockNumber > 0 ? 1 : 0) : 1,
  );
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const StyledTypography = styled(Typography)(({ theme }) => ({
    fontSize: isMobile ? '10px' : theme.typography.body2.fontSize,
  }));

  const handleConditionChange = (event: SelectChangeEvent<string>) => {
    const selected = conditions.find(
      (condition) => condition.name === event.target.value,
    );
    if (selected) setSelectedCondition(selected);
  };

  return (
    <Stack
      direction="row"
      p={1}
      alignItems="center"
      sx={{
        width: '100%',
        borderRadius: 2,
      }}
    >
      {/* 画像表示 */}
      {imageUrl ? (
        <Box
          component="img"
          src={imageUrl}
          alt={title}
          sx={{
            width: isMobile ? 40 : 50,
            objectFit: 'cover',
            mr: 2,
            boxShadow: 'none',
            border: '1px solid',
            borderColor: 'grey.300',
            borderRadius: 1,
          }}
        />
      ) : (
        <Box sx={{ width: isMobile ? 40 : 50, mr: 2 }}>
          <NoImg />
        </Box>
      )}

      {/* 商品詳細 */}
      <Stack flex={1} flexDirection="column" spacing={1}>
        {/* タイトル */}
        <StyledTypography>{title}</StyledTypography>

        <Stack direction={'row'} gap={1} flexWrap={'wrap'}>
          {/* 条件セレクトボックス */}
          <Select
            value={selectedCondition.name}
            onChange={handleConditionChange}
            size="small"
            sx={{
              width: '40%',
              fontSize: '9px',
              padding: 0,
            }}
          >
            {conditions.map((condition, index) => (
              <MenuItem key={index} value={condition.name}>
                {condition.name}
              </MenuItem>
            ))}
          </Select>

          {/* 価格情報 */}
          <Stack direction="row" spacing={1}>
            {selectedCondition.sellPrice !== null && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <TagLabel
                  backgroundColor="secondary.main"
                  color="white"
                  width="20px"
                  height="20px"
                  borderRadius="50%"
                >
                  <StyledTypography>販</StyledTypography>
                </TagLabel>
                <StyledTypography>
                  ¥{selectedCondition.sellPrice?.toLocaleString()}
                </StyledTypography>
              </Stack>
            )}
            {selectedCondition.buyPrice !== null && (
              <Stack direction="row" spacing={0.5} alignItems="center">
                <TagLabel
                  backgroundColor="primary.main"
                  color="white"
                  width="20px"
                  height="20px"
                  borderRadius="50%"
                >
                  <StyledTypography>買</StyledTypography>
                </TagLabel>
                <StyledTypography>
                  ¥{selectedCondition.buyPrice?.toLocaleString()}
                </StyledTypography>
              </Stack>
            )}
          </Stack>
        </Stack>

        {/* 登録数と在庫 */}
        <Stack direction="row" alignItems="center" spacing={1}>
          <StyledTypography>登録数:</StyledTypography>
          <TextField
            type="number"
            value={registerCount}
            onChange={(event) => setRegisterCount(Number(event.target.value))}
            size="small"
            inputProps={{
              min: 0,
              style: {
                textAlign: 'center',
                fontSize: '14px',
                padding: 0,
              },
            }}
            sx={{
              width: '60px',
            }}
            disabled={isStockRestriction && selectedCondition.stockNumber === 0}
          />

          <StyledTypography>
            (在庫数: {selectedCondition.stockNumber})
          </StyledTypography>
        </Stack>
      </Stack>

      {/* 登録ボタン */}
      <Box>
        <PrimaryButton
          onClick={() => selectedCondition.onRegister(registerCount)}
          sx={{
            backgroundColor: 'primary.main',
            whiteSpace: 'nowrap',
            padding: '4px 8px',
            minWidth: 'auto',
          }}
          disabled={isStockRestriction && selectedCondition.stockNumber === 0}
        >
          <Typography variant="body2">登録</Typography>
        </PrimaryButton>
      </Box>
    </Stack>
  );
};
