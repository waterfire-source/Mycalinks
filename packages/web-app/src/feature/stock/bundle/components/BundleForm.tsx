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
// このコンポーネントでもdayjsを使用しているため、importしています
import dayjs, { Dayjs } from 'dayjs';
import PhotoIcon from '@mui/icons-material/Photo';
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
  isStartAtEnabled: boolean;
  startAtDayjs: Dayjs;
  handleStartAtChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleStartAtToggle: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const StyledTableContainer = styled(TableContainer)`
  border: none;
  width: 100%;
`;
const StyledTableBody = styled(TableBody)`
  border: none;
  width: 100%;
`;
const StyledTableRow = styled(TableRow)`
  border: none;
  width: 100%;
`;
const StyledContentCell = styled(TableCell)`
  border: none;
  width: 60%;
`;
const StyledTitleCell = styled(TableCell)`
  border: none;
  width: 35%;
`;

dayjs.extend(utc);
dayjs.extend(timezone);
const today = dayjs().tz('Asia/Tokyo').format('YYYY-MM-DD');

export const BundleForm = ({
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
    <Box sx={{ paddingX: '12px', paddingTop: 2, backgroundColor: 'white' }}>
      <form onSubmit={handleSubmit}>
        <StyledTableContainer>
          <StyledTableBody>
            {/* 画像 */}
            <StyledTableRow>
              <StyledTitleCell>
                {imageUrl ? (
                  <Box
                    sx={{
                      width: '60px',
                      height: '80px',
                    }}
                  >
                    <ItemImage imageUrl={imageUrl} height={80} />
                  </Box>
                ) : (
                  <Box
                    sx={{
                      width: '60px',
                      height: '80px',
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
              </StyledTitleCell>
              <StyledContentCell>
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
              </StyledContentCell>
            </StyledTableRow>
            {/* バンドル名 */}
            <StyledTableRow>
              <StyledTitleCell>
                <Typography variant="body2">バンドル名</Typography>
              </StyledTitleCell>
              <StyledContentCell>
                <TextField
                  name="bundleName"
                  value={formData.bundleName ?? ''}
                  onChange={handleBundleNameInputChange}
                  fullWidth
                  size="small"
                />
              </StyledContentCell>
            </StyledTableRow>
            {/* ジャンル */}
            <StyledTableRow>
              <StyledTitleCell>
                <Typography variant="body2">ジャンル</Typography>
              </StyledTitleCell>
              <StyledContentCell>
                <GenreSelect
                  selectedGenreId={formData.genreID}
                  onSelect={handleGenreSelectChange}
                  sx={{ width: '100%' }}
                />
              </StyledContentCell>
            </StyledTableRow>
            {/* バンドル単価 */}
            <StyledTableRow>
              <StyledTitleCell>
                <Typography variant="body2">バンドル単価</Typography>
              </StyledTitleCell>
              <StyledContentCell>
                <NumericTextField
                  value={formData.sellPrice ?? undefined}
                  onChange={handleSellPriceInputChange}
                  size="small"
                  endSuffix="円"
                  noSpin
                />
              </StyledContentCell>
            </StyledTableRow>
            {/* 作成数 */}
            <StyledTableRow>
              <StyledTitleCell>
                <Typography variant="body2">作成数</Typography>
              </StyledTitleCell>
              <StyledContentCell>
                <NumericTextField
                  value={formData.bundleStockNumber ?? undefined}
                  onChange={handleBundleStockNumberChange}
                  size="small"
                  endSuffix="点"
                />
              </StyledContentCell>
            </StyledTableRow>
            {/* 開始日時 */}
            <StyledTableRow>
              <StyledTitleCell>
                <Typography variant="body2">開始日時</Typography>
              </StyledTitleCell>
              <StyledContentCell>
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
              </StyledContentCell>
            </StyledTableRow>
            {/* 終了日時 */}
            <StyledTableRow>
              <StyledTitleCell>
                <Typography variant="body2">終了日時</Typography>
              </StyledTitleCell>
              <StyledContentCell>
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
              </StyledContentCell>
            </StyledTableRow>
          </StyledTableBody>
        </StyledTableContainer>
      </form>
    </Box>
  );
};
