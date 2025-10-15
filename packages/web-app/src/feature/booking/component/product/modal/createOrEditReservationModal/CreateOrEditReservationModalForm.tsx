import { Box, Stack, TextField, Typography } from '@mui/material';
import NumericTextField from '@/components/inputFields/NumericTextField';
import dayjs from 'dayjs';
import { FormErrors, ReservationsFormState } from '@/feature/booking';

interface Props {
  formData: ReservationsFormState;
  setFormData: React.Dispatch<React.SetStateAction<ReservationsFormState>>;
  errors: FormErrors;
}

export const CreateOrEditReservationModalForm = ({
  formData,
  setFormData,
  errors,
}: Props) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 2,
      }}
    >
      <Stack direction="row" alignItems="center">
        <Typography variant="body2" sx={{ width: '240px' }}>
          予約受付上限数
        </Typography>
        <NumericTextField
          value={formData.limit_count}
          onChange={(val) =>
            setFormData((prev) => ({
              ...prev,
              limit_count: val,
            }))
          }
          error={!!errors.limit_count}
          helperText={errors.limit_count}
          FormHelperTextProps={{
            sx: {
              backgroundColor: '#f5f5f5',
              margin: 0,
              paddingTop: '4px',
            },
          }}
          sx={{ width: '200px', backgroundColor: 'white' }}
        />
      </Stack>

      <Stack direction="row" alignItems="center">
        <Typography variant="body2" sx={{ width: '240px' }}>
          予約期間
        </Typography>
        <Stack direction="row" alignItems="center" gap={0.5}>
          <TextField
            type="date"
            size="small"
            value={
              formData.start_at
                ? dayjs(formData.start_at).format('YYYY-MM-DD')
                : ''
            }
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                start_at: e.target.value,
              }))
            }
            error={!!errors.start_at}
            helperText={errors.start_at}
            FormHelperTextProps={{
              sx: {
                backgroundColor: '#f5f5f5',
                margin: 0,
                paddingTop: '4px',
              },
            }}
            sx={{ width: '200px', backgroundColor: 'white' }}
            InputLabelProps={{
              shrink: true,
              sx: {
                color: 'black',
              },
            }}
            inputProps={{
              min: dayjs().format('YYYY-MM-DD'),
            }}
          />
          <Typography>~</Typography>
          <TextField
            type="date"
            size="small"
            value={
              formData.end_at ? dayjs(formData.end_at).format('YYYY-MM-DD') : ''
            }
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                end_at: e.target.value,
              }))
            }
            error={!!errors.end_at}
            helperText={errors.end_at}
            FormHelperTextProps={{
              sx: {
                backgroundColor: '#f5f5f5',
                margin: 0,
                paddingTop: '4px',
              },
            }}
            sx={{ width: '200px', backgroundColor: 'white' }}
            InputLabelProps={{
              shrink: true,
              sx: {
                color: 'black',
              },
            }}
            inputProps={{
              min: formData.start_at
                ? dayjs(formData.start_at).format('YYYY-MM-DD')
                : undefined,
            }}
          />
          <Typography>
            （指定日になると自動で予約受付開始・終了します。）
          </Typography>
        </Stack>
      </Stack>

      <Stack direction="row" alignItems="center">
        <Typography variant="body2" sx={{ width: '240px' }}>
          1人当たりの予約上限
        </Typography>
        <NumericTextField
          value={formData.limit_count_per_user}
          onChange={(val) =>
            setFormData((prev) => ({
              ...prev,
              limit_count_per_user: val,
            }))
          }
          error={!!errors.limit_count_per_user}
          helperText={errors.limit_count_per_user}
          FormHelperTextProps={{
            sx: {
              backgroundColor: '#f5f5f5',
              margin: 0,
              paddingTop: '4px',
            },
          }}
          sx={{ width: '200px', backgroundColor: 'white' }}
        />
      </Stack>

      <Stack direction="row" alignItems="center">
        <Typography variant="body2" sx={{ width: '240px' }}>
          1商品あたりの前金
        </Typography>
        <NumericTextField
          value={formData.deposit_price}
          onChange={(val) =>
            setFormData((prev) => ({
              ...prev,
              deposit_price: val,
            }))
          }
          error={!!errors.deposit_price}
          helperText={errors.deposit_price}
          FormHelperTextProps={{
            sx: {
              backgroundColor: '#f5f5f5',
              margin: 0,
              paddingTop: '4px',
            },
          }}
          suffix="円"
          noSpin
          sx={{ width: '200px', backgroundColor: 'white' }}
        />
      </Stack>

      <Stack direction="row" alignItems="center">
        <Typography variant="body2" sx={{ width: '240px' }}>
          残金（受け取り時支払い金）
        </Typography>
        <NumericTextField
          value={formData.remaining_price}
          onChange={(val) =>
            setFormData((prev) => ({
              ...prev,
              remaining_price: val,
            }))
          }
          error={!!errors.remaining_price}
          helperText={errors.remaining_price}
          FormHelperTextProps={{
            sx: {
              backgroundColor: '#f5f5f5',
              margin: 0,
              paddingTop: '4px',
            },
          }}
          suffix="円"
          noSpin
          sx={{ width: '200px', backgroundColor: 'white' }}
        />
      </Stack>

      <Box width={800}>
        <Typography variant="body2">備考</Typography>
        <TextField
          value={formData.description}
          aria-label="備考"
          variant="outlined"
          size="small"
          fullWidth
          multiline
          rows={5}
          sx={{
            backgroundColor: 'white',
          }}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              description: e.target.value,
            }))
          }
          InputProps={{
            sx: {
              color: 'text.primary',
            },
          }}
        />
      </Box>
    </Box>
  );
};
