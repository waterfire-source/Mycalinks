import { ImagePicker } from '@/components/cards/ImagePicker';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { GenreSelect } from '@/feature/item/components/select/GenreSelect';
import NumericTextField from '@/components/inputFields/NumericTextField';
import { BundleFormDataType } from '@/feature/stock/bundle/register/BundleSetting/BundleSetting';
import {
  Box,
  FormControlLabel,
  Radio,
  RadioGroup,
  SelectChangeEvent,
  styled,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import dayjs, { Dayjs } from 'dayjs';
import PhotoIcon from '@mui/icons-material/Photo';
import { BundleSetProductType } from '@/feature/stock/bundle/components/TabTable';
import React from 'react';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

interface Props {
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  imageUrl: string | null;
  setImageUrl:
    | React.Dispatch<React.SetStateAction<string | null>>
    | ((url: string | null) => void);
  formData: BundleFormDataType;
  handleBundleNameInputChange: (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  handleGenreSelectChange: (e: SelectChangeEvent) => void;
  handleSellPriceInputChange: (value: number | undefined) => void;
  handleBundleStockNumberChange: (value: number | undefined) => void;
  handleExpiredAtChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isExpiredAtEnabled: boolean;
  expiredAtDayjs: Dayjs | undefined;
  handleExpiredAtToggle: (event: React.ChangeEvent<HTMLInputElement>) => void;
  bundle: BundleSetProductType;
  isStartAtEnabled: boolean;
  startAtDayjs: Dayjs;
  handleStartAtChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleStartAtToggle: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const StyledTableContainer = styled(TableContainer)`
  border: none;
  background-color: #f5f5f5;
  width: 100%;
  height: 100%;
`;
const StyledTableBody = styled(TableBody)`
  border: none;
  background-color: #f5f5f5;
  width: 100%;
`;
const StyledTableRow = styled(TableRow)`
  border: none;
  background-color: #f5f5f5;
  width: 100%;
`;
const StyledTableCell = styled(TableCell)`
  border: none;
  background-color: #f5f5f5 !important;
  width: 100%;
`;
const StyledRightTableCell = styled(TableCell)`
  border: none;
  background-color: #f5f5f5 !important;
  width: 35%;
`;

dayjs.extend(utc);
dayjs.extend(timezone);
const today = dayjs().tz('Asia/Tokyo').format('YYYY-MM-DD');

export const BundleForm = ({
  bundle,
  handleSubmit,
  formData,
  handleBundleNameInputChange,
  handleGenreSelectChange,
  handleSellPriceInputChange,
  handleBundleStockNumberChange,
  isExpiredAtEnabled,
  expiredAtDayjs,
  handleExpiredAtChange,
  imageUrl,
  setImageUrl,
  handleExpiredAtToggle,
  isStartAtEnabled,
  startAtDayjs,
  handleStartAtChange,
  handleStartAtToggle,
}: Props) => {
  return (
    <Box
      sx={{
        paddingX: 7,
        paddingY: 5,
        height: '100%',
        display: 'flex',
        alignItems: 'flex-start',
      }}
    >
      <form onSubmit={handleSubmit} style={{ backgroundColor: '#f5f5f5' }}>
        <StyledTableContainer>
          <StyledTableBody>
            {/* 画像 */}
            <StyledTableRow>
              <StyledRightTableCell>
                {imageUrl ? (
                  <ItemImage imageUrl={imageUrl} height={90} />
                ) : bundle.imageUrl ? (
                  <ItemImage imageUrl={bundle.imageUrl} height={90} />
                ) : (
                  <Box
                    sx={{
                      width: '80px',
                      height: '90px',
                      border: '1px solid gray',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      color: 'gray',
                      borderRadius: '8px',
                    }}
                  >
                    <PhotoIcon />
                  </Box>
                )}
              </StyledRightTableCell>
              <StyledTableCell>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                  }}
                >
                  <ImagePicker
                    kind="item"
                    onImageUploaded={setImageUrl}
                    label={'商品画像を設定'}
                  />
                </Box>
              </StyledTableCell>
            </StyledTableRow>
            {/* バンドル名 */}
            <StyledTableRow>
              <StyledRightTableCell>
                <Typography variant="body2">バンドル名</Typography>
              </StyledRightTableCell>
              <StyledTableCell>
                <TextField
                  name="bundleName"
                  value={formData.bundleName ?? bundle.displayName ?? ''}
                  onChange={handleBundleNameInputChange}
                  fullWidth
                  size="small"
                />
              </StyledTableCell>
            </StyledTableRow>
            {/* ジャンル */}
            <StyledTableRow>
              <StyledRightTableCell>
                <Typography variant="body2">ジャンル</Typography>
              </StyledRightTableCell>
              {/* TODO:なぜか指定なしの場合文字が表示されない */}
              <StyledTableCell>
                <GenreSelect
                  selectedGenreId={
                    formData.genreID ?? bundle.bundleGenre?.id ?? null
                  }
                  onSelect={handleGenreSelectChange}
                  sx={{ width: '100%' }}
                />
              </StyledTableCell>
            </StyledTableRow>
            {/* バンドル単価 */}
            <StyledTableRow>
              <StyledRightTableCell>
                <Typography variant="body2">バンドル単価</Typography>
              </StyledRightTableCell>
              <StyledTableCell>
                <NumericTextField
                  value={
                    formData.sellPrice ?? bundle.bundleSellPrice ?? undefined
                  }
                  onChange={handleSellPriceInputChange}
                  size="small"
                  endSuffix="円"
                  noSpin
                />
              </StyledTableCell>
            </StyledTableRow>
            {/* 残り在庫数 */}
            <StyledTableRow>
              <StyledRightTableCell>
                <Typography variant="body2">残り在庫数</Typography>
              </StyledRightTableCell>
              <StyledTableCell>
                <Box display="flex" alignItems="center">
                  <NumericTextField
                    value={bundle.bundleStockNumber ?? undefined}
                    onChange={() => {}} // バンドルの在庫数は変更不可
                    size="small"
                    endSuffix="点"
                    isReadOnly={true}
                  />
                  <Typography variant="body2" mx={2}>
                    →
                  </Typography>
                  <NumericTextField
                    value={formData.bundleStockNumber ?? undefined}
                    onChange={handleBundleStockNumberChange}
                    size="small"
                    endSuffix="点"
                  />
                </Box>
              </StyledTableCell>
            </StyledTableRow>
            {/* 開始日時 */}
            <StyledTableRow>
              <StyledRightTableCell>
                <Typography variant="body2">開始日時</Typography>
              </StyledRightTableCell>
              <StyledTableCell>
                <RadioGroup
                  row
                  value={isStartAtEnabled ? 'yes' : 'no'}
                  onChange={handleStartAtToggle}
                  sx={{
                    '& .MuiFormControlLabel-root': {
                      fontSize: '0.875rem', // テキストサイズを小さく
                      marginRight: '8px', // 間隔を調整
                    },
                    '& .MuiRadio-root': {
                      padding: '4px', // ラジオボタンの余白を小さく
                    },
                  }}
                >
                  <FormControlLabel
                    value="no"
                    control={<Radio size="small" />} // ラジオボタンを小さく
                    label={<Typography variant="body2">今すぐ</Typography>} // テキストサイズを小さく
                  />
                  <FormControlLabel
                    value="yes"
                    control={<Radio size="small" />} // ラジオボタンを小さく
                    label={<Typography variant="body2">設定する</Typography>} // テキストサイズを小さく
                  />
                </RadioGroup>
                {/* 開始日時フィールド */}
                {isStartAtEnabled && (
                  <TextField
                    name="startAt"
                    type="date"
                    value={
                      startAtDayjs ? startAtDayjs.format('YYYY-MM-DD') : ''
                    }
                    onChange={handleStartAtChange}
                    fullWidth
                    size="small"
                  />
                )}
              </StyledTableCell>
            </StyledTableRow>
            {/* 終了日時 */}
            <StyledTableRow>
              <StyledRightTableCell>
                <Typography variant="body2">終了日時</Typography>
              </StyledRightTableCell>
              <StyledTableCell>
                <RadioGroup
                  row
                  value={isExpiredAtEnabled ? 'yes' : 'no'}
                  onChange={handleExpiredAtToggle}
                  sx={{
                    '& .MuiFormControlLabel-root': {
                      fontSize: '0.875rem', // テキストサイズを小さく
                      marginRight: '8px', // 間隔を調整
                    },
                    '& .MuiRadio-root': {
                      padding: '4px', // ラジオボタンの余白を小さく
                    },
                  }}
                >
                  <FormControlLabel
                    value="no"
                    control={<Radio size="small" />} // ラジオボタンを小さく
                    label={<Typography variant="body2">設定しない</Typography>} // テキストサイズを小さく
                  />
                  <FormControlLabel
                    value="yes"
                    control={<Radio size="small" />} // ラジオボタンを小さく
                    label={<Typography variant="body2">設定する</Typography>} // テキストサイズを小さく
                  />
                </RadioGroup>
                {/* 有効期限フィールド */}
                {isExpiredAtEnabled && (
                  <TextField
                    name="expiredAt"
                    type="date"
                    value={
                      expiredAtDayjs ? expiredAtDayjs.format('YYYY-MM-DD') : ''
                    }
                    onChange={handleExpiredAtChange}
                    fullWidth
                    size="small"
                    inputProps={{ min: today }}
                  />
                )}
              </StyledTableCell>
            </StyledTableRow>
          </StyledTableBody>
        </StyledTableContainer>
      </form>
    </Box>
  );
};
