import { Chip } from '@/components/chips/Chip';
import NumericTextField from '@/components/inputFields/NumericTextField';
import { useAddressSearch } from '@/feature/stocking/hooks/useAddressSearch';
import {
  Stack,
  TextField,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Box,
} from '@mui/material';
import { useEffect } from 'react';
import { Controller, FormProvider, UseFormReturn } from 'react-hook-form';
import * as z from 'zod';

export enum PaymentMethod {
  Cash = 'CASH',
  Bank = 'BANK',
}

export enum AccountType {
  Saving = 'SAVING',
  Checking = 'CHECKING',
}

export const consignmentClientSchema = z.object({
  full_name: z.string().min(1, '委託者名は必須です'),
  display_name: z.string().optional(),
  zip_code: z
    .string()
    .regex(/^\d{3}-\d{4}$/, '郵便番号は000-0000の形式で入力してください'),
  prefecture: z.string().min(1, '都道府県は必須です'),
  city: z.string().min(1, '市区町村は必須です'),
  address2: z.string().min(1, '番地は必須です'),
  building: z.string().optional(),
  phone_number: z
    .string()
    .regex(/^[\d-]+$/, '電話番号は数字とハイフンのみ入力してください'),
  fax_number: z.string().optional(),
  email: z
    .string()
    .email('有効なメールアドレスを入力してください')
    .optional()
    .or(z.literal('')),
  commission_cash_price: z
    .number()
    .min(0, '手数料は0以上で入力してください')
    .max(100, '手数料は100以下で入力してください'),
  commission_card_price: z
    .number()
    .min(0, '手数料は0以上で入力してください')
    .max(100, '手数料は100以下で入力してください'),
  payment_cycle: z.string().min(1, '支払サイクルは必須です'),
  commission_payment_method: z.enum([PaymentMethod.Cash, PaymentMethod.Bank]),
  bankName: z.string().optional(),
  branchCode: z.string().optional(),
  accountType: z.enum([AccountType.Saving, AccountType.Checking]).optional(),
  accountNumber: z.string().optional(),
  description: z.string().optional(),
  enabled: z.boolean(),
  display_name_on_receipt: z.boolean().optional(),
});

export type ConsignmentClientFormData = z.infer<
  typeof consignmentClientSchema
> & {
  id?: number;
};

export const initialFormData: ConsignmentClientFormData = {
  full_name: '',
  display_name: '',
  zip_code: '',
  prefecture: '',
  city: '',
  address2: '',
  building: '',
  phone_number: '',
  fax_number: '',
  email: '',
  commission_cash_price: 0,
  commission_card_price: 0,
  payment_cycle: '',
  commission_payment_method: PaymentMethod.Cash,
  bankName: '',
  branchCode: '',
  accountType: AccountType.Saving,
  accountNumber: '',
  description: '',
  enabled: true,
  display_name_on_receipt: true,
};

interface Props {
  methods: UseFormReturn<
    ConsignmentClientFormData,
    any,
    ConsignmentClientFormData
  >;
  onSubmit: (data: ConsignmentClientFormData) => Promise<void>;
}

export const CreateOrEditClientForm = ({ methods, onSubmit }: Props) => {
  const { control, watch, handleSubmit, setValue } = methods;
  const watchedZipCode = watch('zip_code');
  const { address, handleAddressSearch } = useAddressSearch(watchedZipCode);

  // 住所検索結果をフォームに反映
  useEffect(() => {
    if (address.prefecture || address.city || address.address2) {
      setValue('prefecture', address.prefecture);
      setValue('city', address.city);
      setValue('address2', address.address2);
    }
  }, [address, setValue]);

  return (
    <FormProvider {...methods}>
      <form id="consignment-form" onSubmit={handleSubmit(onSubmit)}>
        <Stack spacing={2}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="body1" sx={{ minWidth: 180 }}>
              委託者名
            </Typography>
            <Controller
              control={control}
              name="full_name"
              render={({ field, fieldState: { error } }) => (
                <Box display="flex" gap={1} alignItems="center" width="100%">
                  <Box flexShrink={0}>
                    <Chip text="必須" variant="secondary" />
                  </Box>
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    placeholder="名前"
                    error={!!error?.message}
                    helperText={error?.message}
                    InputProps={{
                      sx: {
                        backgroundColor: 'white',
                      },
                    }}
                  />
                </Box>
              )}
            />
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant="body1" sx={{ minWidth: 180 }}>
              表示名
            </Typography>
            <Controller
              control={control}
              name="display_name"
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  fullWidth
                  size="small"
                  placeholder="表示名"
                  sx={{ ml: 4.5 }}
                  error={!!error?.message}
                  helperText={error?.message}
                  InputProps={{
                    sx: {
                      backgroundColor: 'white',
                    },
                  }}
                />
              )}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="body1" sx={{ minWidth: 180 }}>
              郵便番号
            </Typography>
            <Controller
              control={control}
              name="zip_code"
              render={({ field, fieldState: { error } }) => (
                <Box display="flex" gap={1} alignItems="center" width="100%">
                  <Box flexShrink={0}>
                    <Chip text="必須" variant="secondary" />
                  </Box>
                  <TextField
                    {...field}
                    size="small"
                    placeholder="305-0003"
                    sx={{ mr: 2 }}
                    InputProps={{
                      sx: {
                        backgroundColor: 'white',
                      },
                    }}
                    error={!!error?.message}
                    helperText={error?.message}
                  />
                </Box>
              )}
            />
            <Button
              variant="outlined"
              size="small"
              onClick={handleAddressSearch}
              disabled={!watchedZipCode}
              sx={{ backgroundColor: 'white', flexShrink: 0 }}
            >
              住所検索
            </Button>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="body1" sx={{ minWidth: 180 }}>
              都道府県・市区町村
            </Typography>
            <Controller
              control={control}
              name="prefecture"
              render={({ field, fieldState: { error } }) => (
                <Box display="flex" gap={1} alignItems="center" width="100%">
                  <Box flexShrink={0}>
                    <Chip text="必須" variant="secondary" />
                  </Box>
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    placeholder=""
                    sx={{ mr: 1 }}
                    InputProps={{
                      sx: {
                        backgroundColor: 'white',
                      },
                    }}
                    error={!!error?.message}
                    helperText={error?.message}
                  />
                </Box>
              )}
            />
            <Controller
              control={control}
              name="city"
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  fullWidth
                  size="small"
                  placeholder=""
                  InputProps={{
                    sx: {
                      backgroundColor: 'white',
                    },
                  }}
                  error={!!error?.message}
                  helperText={error?.message}
                />
              )}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="body1" sx={{ minWidth: 180 }}>
              番地・建物名
            </Typography>
            <Controller
              control={control}
              name="address2"
              render={({ field, fieldState: { error } }) => (
                <Box display="flex" gap={1} alignItems="center" width="100%">
                  <Box flexShrink={0}>
                    <Chip text="必須" variant="secondary" />
                  </Box>
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    placeholder=""
                    sx={{ mr: 1 }}
                    InputProps={{
                      sx: {
                        backgroundColor: 'white',
                      },
                    }}
                    error={!!error?.message}
                    helperText={error?.message}
                  />
                </Box>
              )}
            />
            <Controller
              control={control}
              name="building"
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  size="small"
                  placeholder=""
                  InputProps={{
                    sx: {
                      backgroundColor: 'white',
                    },
                  }}
                />
              )}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="body1" sx={{ minWidth: 180 }}>
              電話番号
            </Typography>
            <Controller
              control={control}
              name="phone_number"
              render={({ field, fieldState: { error } }) => (
                <Box display="flex" gap={1} alignItems="center" width="100%">
                  <Box flexShrink={0}>
                    <Chip text="必須" variant="secondary" />
                  </Box>
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    placeholder="0120-123-456"
                    InputProps={{
                      sx: {
                        backgroundColor: 'white',
                      },
                    }}
                    error={!!error?.message}
                    helperText={error?.message}
                  />
                </Box>
              )}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="body1" sx={{ minWidth: 180 }}>
              FAX
            </Typography>
            <Controller
              control={control}
              name="fax_number"
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  size="small"
                  placeholder="0120-123-456"
                  sx={{ ml: 4.5 }}
                  InputProps={{
                    sx: {
                      backgroundColor: 'white',
                    },
                  }}
                />
              )}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="body1" sx={{ minWidth: 180 }}>
              メール
            </Typography>
            <Controller
              control={control}
              name="email"
              render={({ field, fieldState: { error } }) => (
                <TextField
                  {...field}
                  fullWidth
                  size="small"
                  placeholder="example@mail.com"
                  sx={{ ml: 4.5 }}
                  InputProps={{
                    sx: {
                      backgroundColor: 'white',
                    },
                  }}
                  error={!!error?.message}
                  helperText={error?.message}
                />
              )}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="body1" sx={{ minWidth: 180 }}>
              手数料(現金)
            </Typography>
            <Controller
              control={control}
              name="commission_cash_price"
              render={({ field, fieldState: { error } }) => (
                <NumericTextField
                  {...field}
                  sx={{ width: '100px', mr: 1, ml: 4.5 }}
                  InputProps={{
                    sx: {
                      backgroundColor: 'white',
                    },
                  }}
                  suffix="%"
                  error={!!error?.message}
                  helperText={error?.message}
                />
              )}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="body1" sx={{ minWidth: 180 }}>
              委託手数料(カード等)
            </Typography>
            <Controller
              control={control}
              name="commission_card_price"
              render={({ field, fieldState: { error } }) => (
                <NumericTextField
                  {...field}
                  sx={{ width: '100px', mr: 1, ml: 4.5 }}
                  InputProps={{
                    sx: {
                      backgroundColor: 'white',
                    },
                  }}
                  suffix="%"
                  error={!!error?.message}
                  helperText={error?.message}
                />
              )}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="body1" sx={{ minWidth: 180 }}>
              支払サイクル
            </Typography>
            <Controller
              control={control}
              name="payment_cycle"
              render={({ field, fieldState: { error } }) => (
                <Box display="flex" gap={1} alignItems="center" width="100%">
                  <Box flexShrink={0}>
                    <Chip text="必須" variant="secondary" />
                  </Box>
                  <TextField
                    {...field}
                    fullWidth
                    size="small"
                    placeholder=""
                    error={!!error?.message}
                    helperText={error?.message}
                    InputProps={{
                      sx: {
                        backgroundColor: 'white',
                      },
                    }}
                  />
                </Box>
              )}
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="body1" sx={{ minWidth: 180 }}>
              支払方法
            </Typography>
            <RadioGroup
              row
              value={watch('commission_payment_method')}
              onChange={(e) =>
                setValue(
                  'commission_payment_method',
                  e.target.value as PaymentMethod,
                )
              }
            >
              <FormControlLabel
                value={PaymentMethod.Cash}
                control={<Radio />}
                label="現金"
              />
              <FormControlLabel
                value={PaymentMethod.Bank}
                control={<Radio />}
                label="銀行振込"
              />
            </RadioGroup>
          </Box>

          {watch('commission_payment_method') === PaymentMethod.Bank && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="body1" sx={{ minWidth: 180 }}>
                振込先情報
              </Typography>
              <Stack spacing={1.5} ml={4}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography
                    variant="body2"
                    color="grey.600"
                    sx={{ minWidth: 80 }}
                  >
                    銀行名
                  </Typography>
                  <Controller
                    control={control}
                    name="bankName"
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size="small"
                        placeholder=""
                        InputProps={{
                          sx: {
                            backgroundColor: 'white',
                          },
                        }}
                      />
                    )}
                  />
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography
                    variant="body2"
                    color="grey.600"
                    sx={{ minWidth: 80 }}
                  >
                    支店名
                  </Typography>
                  <Controller
                    control={control}
                    name="branchCode"
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size="small"
                        placeholder=""
                        InputProps={{
                          sx: {
                            backgroundColor: 'white',
                          },
                        }}
                      />
                    )}
                  />
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography
                    variant="body2"
                    color="grey.600"
                    sx={{ minWidth: 80 }}
                  >
                    口座種別
                  </Typography>
                  <RadioGroup
                    row
                    value={watch('accountType')}
                    onChange={(e) =>
                      setValue('accountType', e.target.value as AccountType)
                    }
                  >
                    <FormControlLabel
                      value={AccountType.Saving}
                      control={<Radio />}
                      label="普通"
                    />
                    <FormControlLabel
                      value={AccountType.Checking}
                      control={<Radio />}
                      label="当座"
                    />
                  </RadioGroup>
                </Box>

                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Typography
                    variant="body2"
                    color="grey.600"
                    sx={{ minWidth: 80 }}
                  >
                    口座番号
                  </Typography>
                  <Controller
                    control={control}
                    name="accountNumber"
                    render={({ field }) => (
                      <TextField
                        {...field}
                        fullWidth
                        size="small"
                        placeholder=""
                        InputProps={{
                          sx: {
                            backgroundColor: 'white',
                          },
                        }}
                      />
                    )}
                  />
                </Box>
              </Stack>
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="body1" sx={{ minWidth: 180 }}>
              ステータス
            </Typography>
            <RadioGroup
              row
              value={watch('enabled') ? 'active' : 'inactive'}
              onChange={(e) => setValue('enabled', e.target.value === 'active')}
            >
              <FormControlLabel
                value="active"
                control={<Radio />}
                label="有効"
              />
              <FormControlLabel
                value="inactive"
                control={<Radio />}
                label="無効"
              />
            </RadioGroup>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Typography variant="body1" sx={{ minWidth: 180 }}>
              レシート印刷
            </Typography>
            <RadioGroup
              row
              value={watch('display_name_on_receipt') ? 'active' : 'inactive'}
              onChange={(e) =>
                setValue('display_name_on_receipt', e.target.value === 'active')
              }
            >
              <FormControlLabel
                value="active"
                control={<Radio />}
                label="する"
              />
              <FormControlLabel
                value="inactive"
                control={<Radio />}
                label="しない"
              />
            </RadioGroup>
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              mb: 2,
            }}
          >
            <Typography variant="body1" sx={{ minWidth: 180, mt: 1 }}>
              備考
            </Typography>

            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <TextField
                  {...field}
                  fullWidth
                  multiline
                  rows={3}
                  size="small"
                  placeholder=""
                  sx={{ backgroundColor: 'white', ml: 4.5 }}
                />
              )}
            />
          </Box>
        </Stack>
      </form>
    </FormProvider>
  );
};
