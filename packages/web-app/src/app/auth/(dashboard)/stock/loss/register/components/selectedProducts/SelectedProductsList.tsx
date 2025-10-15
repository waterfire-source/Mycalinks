import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Box,
  FormControl,
  Grid,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from '@mui/material';
import { CustomError } from '@/api/implement';
import dayjs from 'dayjs';
import { LossRegisterProductType } from '@/app/auth/(dashboard)/stock/loss/register/components/LossProductType';
import { LossSelectedProductsCard } from '@/app/auth/(dashboard)/stock/loss/register/components/selectedProducts/LossSelectedProductsCard';
import TertiaryButtonWithIcon from '@/components/buttons/TertiaryButtonWithIcon';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { useCreateLoss } from '@/feature/products/loss/hooks/useCreateLoss';
import { useAlert } from '@/contexts/AlertContext';
import { useLossGenres } from '@/feature/products/loss/hooks/useListLossGenres';
import { useRouter } from 'next/navigation';
import { PATH } from '@/constants/paths';
import { useConfirmationModal } from '@/contexts/ConfirmationModalContext';
interface FormData {
  date: string;
  reason: string;
  lossGenreID: number;
}
interface SelectedProductsListProps {
  lossProducts: LossRegisterProductType[];
  setLossProducts: Dispatch<SetStateAction<LossRegisterProductType[]>>;
}

export const SelectedProductsList: React.FC<SelectedProductsListProps> = ({
  lossProducts,
  setLossProducts,
}) => {
  const { lossGenres, fetchLossGenres } = useLossGenres();
  const { createLoss, isLoading } = useCreateLoss();
  const { setAlertState } = useAlert();
  const router = useRouter();
  const initialFormData = useMemo<FormData>(
    () => ({
      date: dayjs().format('YYYY-MM-DD'),
      reason: '',
      lossGenreID: 0,
    }),
    [],
  );
  const [formData, setFormData] = useState<FormData>(initialFormData);

  useEffect(() => {
    fetchLossGenres();
  }, [fetchLossGenres]);

  const handleRegisterLoss = async () => {
    if (formData.lossGenreID === 0 || lossProducts.length === 0) {
      setAlertState({
        message: 'ロス区分を選択し、商品を1つ以上追加してください。',
        severity: 'error',
      });
      return;
    }

    // ロス登録処理
    const payloadProducts = lossProducts.map((product) => ({
      productId: product.id,
      itemCount: product.count ?? 0,
      specificWholesalePrice: product.arrivalPrice,
    }));
    const response = await createLoss({
      reason: formData.reason,
      datetime: new Date(formData.date),
      lossGenreID: formData.lossGenreID,
      products: payloadProducts,
    });
    if (response instanceof CustomError) {
      return;
    }

    setModalVisible(false);
    setLossProducts([]);
    setFormData({
      date: dayjs().format('YYYY-MM-DD'),
      reason: '',
      lossGenreID: 0,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<number>) => {
    setFormData((prevData) => ({
      ...prevData,
      lossGenreID: e.target.value as number,
    }));
  };

  const isDirty = useMemo(() => {
    return (
      formData.date !== initialFormData.date ||
      formData.reason !== initialFormData.reason ||
      formData.lossGenreID !== initialFormData.lossGenreID
    );
  }, [formData, initialFormData]);

  // 画面遷移確認モーダル表示の制御
  const { setModalVisible } = useConfirmationModal();
  useEffect(() => {
    setModalVisible(lossProducts.length > 0 || isDirty);
  }, [lossProducts, isDirty, setModalVisible]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        backgroundColor: 'white',
        border: '1px solid',
        borderColor: 'grey.500',
        borderRadius: '8px',
        boxShadow: 2,
        overflow: 'hidden',
      }}
    >
      {/* SelectedProductsCardは他の部分いて多用されているため一旦loss用に作成 */}
      {/* <Box sx={{ flex: 1, overflowY: 'auto', maxHeight: '50vh', padding: 2 }}> */}
      <LossSelectedProductsCard
        title="ロス登録商品"
        // height={`calc(${'calc(100vh - 525px)'})`}
        lossProducts={lossProducts}
        setLossProducts={setLossProducts}
        sx={{
          display: 'flex',
          height: '80%',
        }}
      />
      {/* </Box> */}
      <Box
        sx={{
          padding: 1,
        }}
      >
        <Grid
          container
          spacing={1}
          alignItems="center"
          paddingBottom={1}
          paddingTop={1}
        >
          <Grid item xs={2.5}>
            <Typography>発生日</Typography>
          </Grid>
          <Grid item xs={5}>
            <TextField
              name="date"
              type="date"
              size="small"
              value={formData.date}
              onChange={handleInputChange}
              fullWidth
              InputLabelProps={{
                shrink: true,
                sx: {
                  color: 'text.primary',
                },
              }}
            />
          </Grid>
        </Grid>

        <Grid container spacing={1} alignItems="center" paddingBottom={1}>
          <Grid item xs={2.5}>
            <Typography>ロス区分</Typography>
          </Grid>
          <Grid item xs={5}>
            <FormControl fullWidth>
              <Select
                name="lossGenreID"
                value={formData.lossGenreID ?? ''}
                onChange={handleSelectChange}
                fullWidth
                size="small"
              >
                <MenuItem value={0}>
                  <Typography>ロス区分を選択</Typography>
                </MenuItem>
                {lossGenres.map((genre) => (
                  <MenuItem
                    key={genre.id}
                    value={genre.id}
                    sx={{
                      backgroundColor: 'common.white',
                      color: 'text.primary',
                    }}
                  >
                    {genre.display_name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Grid container spacing={1} paddingBottom={1}>
          <Grid item xs={2.5}>
            <Typography>理由</Typography>
          </Grid>
          <Grid item xs={9}>
            <TextField
              name="reason"
              size="small"
              multiline
              rows={3}
              value={formData.reason}
              onChange={handleInputChange}
              fullWidth
              InputLabelProps={{
                shrink: true,
                sx: {
                  color: 'text.primary',
                },
              }}
            />
          </Grid>
        </Grid>
      </Box>
      <Box>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            padding: 1,
            backgroundColor: 'white',
            boxShadow: 8,
          }}
        >
          <TertiaryButtonWithIcon
            sx={{ marginRight: 1 }}
            onClick={() => {
              router.push(PATH.STOCK.loss.root);
            }}
          >
            ロス登録をやめる
          </TertiaryButtonWithIcon>
          <PrimaryButton
            sx={{ paddingLeft: 2 }}
            loading={isLoading}
            onClick={handleRegisterLoss}
          >
            ロス登録
          </PrimaryButton>
        </Box>
      </Box>
    </Box>
  );
};
