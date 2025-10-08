import { ImagePicker } from '@/components/cards/ImagePicker';
import { ItemImage } from '@/feature/item/components/ItemImage';
import {
  Box,
  FormControl,
  FormControlLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
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

import React, { useEffect } from 'react';
import NumericTextField from '@/components/inputFields/NumericTextField';
import { SetFormDataType } from '@/feature/stock/set/register/SetSetting/SetSetting';
import { BundleSetProductType } from '@/feature/stock/bundle/components/TabTable';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

interface Props {
  set: BundleSetProductType;
  handleSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  imageUrl: string | null;
  setImageUrl:
    | React.Dispatch<React.SetStateAction<string | null>>
    | ((url: string | null) => void);
  formData: SetFormDataType;
  handleSetNameInputChange: (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => void;
  handleExpiredAtChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isExpiredAtEnabled: boolean;
  expiredAtDayjs: Dayjs | undefined;
  handleExpiredAtToggle: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isStartAtEnabled: boolean;
  startAtDayjs: Dayjs;
  handleStartAtChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleStartAtToggle: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleDiscountUnitSelectChange: (e: SelectChangeEvent) => void;
  handleDiscountInputChange: (value: number | undefined) => void;
  setStartAtDayjs: React.Dispatch<React.SetStateAction<Dayjs>>;
  setExpiredAtDayjs: React.Dispatch<React.SetStateAction<Dayjs | undefined>>;
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

export const SetForm = ({
  set,
  handleSubmit,
  formData,
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
  handleDiscountInputChange,
  handleDiscountUnitSelectChange,
  handleSetNameInputChange,
  setStartAtDayjs,
  setExpiredAtDayjs,
}: Props) => {
  // 初期値がある場合の設定
  useEffect(() => {
    if (set.startAt) {
      setStartAtDayjs(dayjs(set.startAt));
    }
    if (set.expiredAt) {
      setExpiredAtDayjs(dayjs(set.expiredAt));
    }
  }, []);

  return (
    <Box sx={{ paddingX: '12px', paddingTop: 2 }}>
      <form onSubmit={handleSubmit}>
        <StyledTableContainer>
          <StyledTableBody>
            {/* 画像 */}
            <StyledTableRow>
              <StyledRightTableCell>
                {imageUrl ? (
                  <ItemImage imageUrl={imageUrl} height={90} />
                ) : set.imageUrl ? (
                  <ItemImage imageUrl={set.imageUrl} height={90} />
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
            {/* セット名 */}
            <StyledTableRow>
              <StyledRightTableCell>
                <Typography variant="body2">セット名</Typography>
              </StyledRightTableCell>
              <StyledTableCell>
                <TextField
                  name="bundleName"
                  value={formData.setName ?? set.displayName ?? ''}
                  onChange={handleSetNameInputChange}
                  fullWidth
                  size="small"
                />
              </StyledTableCell>
            </StyledTableRow>
            {/* 適用割引 */}
            <StyledTableRow>
              <StyledRightTableCell>
                <Typography variant="body2">適用割引</Typography>
              </StyledRightTableCell>
              <StyledTableCell
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                <NumericTextField
                  value={formData.discount ?? 0}
                  onChange={handleDiscountInputChange}
                  size="small"
                  noSpin
                />
                <FormControl
                  size="small"
                  sx={{ minWidth: '61px', marginLeft: 0.5 }}
                >
                  <Select
                    value={formData.discountUnit}
                    onChange={handleDiscountUnitSelectChange}
                  >
                    <MenuItem value="JPY">円</MenuItem>
                    <MenuItem value="%">%</MenuItem>
                  </Select>
                </FormControl>
                <Typography
                  variant="body2"
                  sx={{
                    flexShrink: 0,
                    marginLeft: 0.5,
                  }}
                >
                  引き
                </Typography>
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
