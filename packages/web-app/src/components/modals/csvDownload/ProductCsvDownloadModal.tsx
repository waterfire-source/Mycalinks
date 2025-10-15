import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  TextField,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { createClientAPI, CustomError } from '@/api/implement';
import { useStore } from '@/contexts/StoreContext';
import dayjs from 'dayjs';
import { useAlert } from '@/contexts/AlertContext';
import { StyleUtil } from '@/utils/style';
import CustomDialog from '@/components/dialogs/CustomDialog';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import { useGenre } from '@/feature/genre/hooks/useGenre';
import { useCategory } from '@/feature/category/hooks/useCategory';

const clientAPI = createClientAPI();

interface ProductCsvDownloadModalProps {}

export const ProductCsvDownloadModal: React.FC<
  ProductCsvDownloadModalProps
> = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [csvSpecificDate, setCsvSpecificDate] = useState<Date | undefined>(
    undefined,
  );
  const [isDownloading, setIsDownloading] = useState(false);
  const { store } = useStore();
  const { setAlertState } = useAlert();
  const { genre, fetchGenreList } = useGenre();
  const { category, fetchCategoryList } = useCategory();

  const [selectedGenreId, setSelectedGenreId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null,
  );

  useEffect(() => {
    fetchGenreList();
    fetchCategoryList();
  }, []);

  const handleCategoryChange = (event: SelectChangeEvent<string>) => {
    setSelectedCategoryId(
      event.target.value === 'all' ? null : Number(event.target.value),
    );
  };

  const handleGenreChange = (event: SelectChangeEvent<string>) => {
    setSelectedGenreId(
      event.target.value === 'all' ? null : Number(event.target.value),
    );
  };

  const handleClickDownload = async () => {
    setIsDownloading(true);

    const res = await clientAPI.product.getCsvFile({
      storeID: store.id!,
      specificDate: csvSpecificDate,
      itemGenreId: selectedGenreId,
      itemCategoryId: selectedCategoryId,
    });

    if (res instanceof CustomError) {
      setAlertState({
        message: `${res.status}:${res.message}`,
        severity: 'error',
      });
      setIsDownloading(false);
      return;
    }

    setAlertState({
      message: `ダウンロードに成功しました。`,
      severity: 'success',
    });

    setIsDownloading(false);
    window.location.href = res.fileUrl;
  };

  return (
    <>
      <PrimaryButton onClick={() => setIsOpen(true)} sx={{ width: 130 }}>
        ダウンロード
      </PrimaryButton>
      <CustomDialog
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="在庫情報ダウンロード"
      >
        <Box
          sx={{
            ...StyleUtil.flex.row,
            ...StyleUtil.flex.allCenter,
            gap: 2,
            m: 3,
          }}
        >
          {/* ジャンル選択 */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>ジャンル</InputLabel>
            <Select
              value={selectedGenreId !== null ? String(selectedGenreId) : 'all'}
              onChange={handleGenreChange}
            >
              <MenuItem value="all">すべて</MenuItem>
              {genre?.itemGenres.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.display_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* カテゴリ選択 */}
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>カテゴリ</InputLabel>
            <Select
              value={
                selectedCategoryId !== null ? String(selectedCategoryId) : 'all'
              }
              onChange={handleCategoryChange}
            >
              <MenuItem value="all">すべて</MenuItem>
              {category?.itemCategories.map((item) => (
                <MenuItem key={item.id} value={item.id}>
                  {item.display_name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box
          sx={{
            ...StyleUtil.flex.row,
            ...StyleUtil.flex.allCenter,
            gap: 2,
            m: 3,
          }}
        >
          <Typography variant="body1" component="p">
            特定の日付の在庫数を取得
          </Typography>
          <TextField
            type="date"
            value={
              csvSpecificDate ? dayjs(csvSpecificDate).format('YYYY-MM-DD') : ''
            }
            onChange={(e) => setCsvSpecificDate(new Date(e.target.value))}
            sx={{ width: 150, backgroundColor: 'white' }}
            inputProps={{ max: dayjs().format('YYYY-MM-DD') }}
          />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button
            variant="contained"
            onClick={() => setIsOpen(false)}
            sx={{ bgcolor: 'grey.500', color: 'white' }}
          >
            キャンセル
          </Button>
          <PrimaryButtonWithIcon
            onClick={handleClickDownload}
            sx={{ width: 130 }}
          >
            {isDownloading ? (
              <CircularProgress sx={{ color: 'white' }} size={20} />
            ) : (
              'ダウンロード'
            )}
          </PrimaryButtonWithIcon>
        </Box>
      </CustomDialog>
    </>
  );
};
