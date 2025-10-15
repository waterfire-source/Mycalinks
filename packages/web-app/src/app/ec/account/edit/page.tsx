'use client';

import { useForm, FormProvider } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Paper,
  Stack,
  FormHelperText,
  CircularProgress,
} from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAppAuth } from '@/providers/useAppAuth';
import { useEffect, useState } from 'react';
import { CustomError } from '@/api/implement';
import { useAddressSearch } from '@/feature/stocking/hooks/useAddressSearch';
import { PATH } from '@/app/ec/(core)/constants/paths';

export const editAccountSchema = z.object({
  displayName: z.string().min(1, '表示名は必須です'),
  fullName: z.string().min(1, 'お名前は必須です'),
  fullNameRuby: z.string().min(1, 'フリガナは必須です'),
  birthday: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, '正しい形式で入力してください (YYYY-MM-DD)')
    .refine((date) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
      const inputDate = new Date(date);
      const currentDate = new Date();
      return !isNaN(inputDate.getTime()) && inputDate < currentDate;
    }, '生年月日は現在より過去の日付を入力してください'),
  phoneNumber: z
    .string()
    .regex(/^\d{10,11}$/, '電話番号は10桁または11桁の数字を入力してください'),
  mail: z.string().email('有効なメールアドレスを入力してください'),
  zipCode: z
    .string()
    .regex(/^\d{3}-?\d{4}$|^\d{7}$/, '郵便番号は7桁の数字を入力してください'),
  prefecture: z.string().min(1, '都道府県は必須です'),
  city: z.string().min(1, '市区町村は必須です'),
  address2: z.string().min(1, '住所は必須です'),
  building: z.string().optional(),
});

type EditAccountFormData = z.infer<typeof editAccountSchema>;

export default function AccountEdit() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getAccountInfo } = useAppAuth();
  const [defaultValues, setDefaultValues] = useState({
    displayName: '',
    fullName: '',
    fullNameRuby: '',
    birthday: '',
    phoneNumber: '',
    mail: '',
    zipCode: '',
    prefecture: '',
    city: '',
    address2: '',
    building: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUserData, setIsUserData] = useState(true);

  // クエリパラメータから未入力項目を取得
  const missingFields = searchParams.get('missing')?.split(',') || [];

  // フィールド名のマッピング（API名 → フォーム名）
  const fieldMapping: Record<string, string> = {
    display_name: 'displayName',
    full_name: 'fullName',
    full_name_ruby: 'fullNameRuby',
    birthday: 'birthday',
    phone_number: 'phoneNumber',
    mail: 'mail',
    zip_code: 'zipCode',
    prefecture: 'prefecture',
    city: 'city',
    address2: 'address2',
  };

  // 未入力フィールドをフォーム名に変換
  const missingFormFields = missingFields
    .map((field) => fieldMapping[field])
    .filter(Boolean);

  // フィールドが未入力項目かどうかを判定する関数
  const isMissingField = (fieldName: string) =>
    missingFormFields.includes(fieldName);

  const handleBack = () => {
    router.back();
  };

  // 共通のフィールドスタイル関数
  const getFieldProps = (fieldName: string) => ({
    labelProps: {
      fontWeight: isMissingField(fieldName) ? 'bold' : 'normal',
    },
    textFieldProps: {
      error:
        !!errors[fieldName as keyof typeof errors] || isMissingField(fieldName),
    },
    showMissingIndicator: isMissingField(fieldName),
  });

  const methods = useForm<EditAccountFormData>({
    resolver: zodResolver(editAccountSchema),
    defaultValues,
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = methods;

  const watchZipCode = watch('zipCode');

  const { address, handleAddressSearch } = useAddressSearch(
    watchZipCode?.replace(/-/g, '') || '',
  );

  useEffect(() => {
    const fetchAccountInfo = async () => {
      try {
        setIsLoading(true);
        const userData = await getAccountInfo();

        if (userData && !(userData instanceof CustomError)) {
          const formattedData = {
            displayName: userData.display_name || '',
            fullName: userData.full_name || '',
            fullNameRuby: userData.full_name_ruby || '',
            birthday: userData.birthday || '',
            phoneNumber: userData.phone_number || '',
            mail: userData.mail || '',
            zipCode: userData.zip_code || '',
            prefecture: userData.prefecture || '',
            city: userData.city || '',
            address2: userData.address2 || '',
            building: userData.building || '',
            password: '',
            confirmPassword: '',
          };

          setDefaultValues(formattedData);
          reset(formattedData);
        }
      } catch (error) {
        setIsUserData(false);
        console.error('アカウント情報の取得に失敗しました:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccountInfo();
  }, [getAccountInfo, reset]);

  useEffect(() => {
    if (watchZipCode && watchZipCode.replace(/-/g, '').length === 7) {
      handleAddressSearch();
    }
  }, [watchZipCode, handleAddressSearch]);

  useEffect(() => {
    if (address.prefecture) {
      setValue('prefecture', address.prefecture);
    }
    if (address.city) {
      setValue('city', address.city);
    }
    if (address.address2) {
      setValue('address2', address.address2);
    }
  }, [address, setValue]);

  const onSubmit = (data: EditAccountFormData) => {
    sessionStorage.setItem('userData', JSON.stringify(data));
    router.push(PATH.ACCOUNT.editConfirm);
  };

  if (isLoading) {
    return (
      <Container maxWidth="sm" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (!isUserData) {
    return (
      <Container maxWidth="sm" sx={{ py: 4, textAlign: 'center' }}>
        <Paper
          elevation={2}
          sx={{ p: 2, borderRadius: '8px', fontSize: '0.875rem' }}
        >
          会員情報を編集するユーザーが存在しません
          <Button
            onClick={handleBack}
            fullWidth
            variant="outlined"
            sx={{
              mt: 10,
              color: '#c34646',
              borderColor: '#c34646',
              '&:hover': {
                borderColor: '#a93939',
              },
            }}
            disabled={isLoading}
          >
            戻る
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: 1 }}>
      <Typography
        variant="h5"
        component="h1"
        align="center"
        sx={{ mb: 2, fontWeight: 'bold' }}
      >
        会員情報を入力
      </Typography>
      <Paper elevation={2} sx={{ p: 3, borderRadius: '8px' }}>
        <FormProvider {...methods}>
          <Box component="form" onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={2}>
              <Box>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 1,
                    color: errors.displayName ? 'error.main' : 'inherit',
                    fontWeight: isMissingField('displayName')
                      ? 'bold'
                      : 'normal',
                  }}
                >
                  表示名
                  {isMissingField('displayName') && (
                    <Typography
                      component="span"
                      sx={{ color: 'error.main', ml: 1 }}
                    >
                      (未入力)
                    </Typography>
                  )}
                </Typography>
                <TextField
                  {...register('displayName')}
                  fullWidth
                  size="small"
                  variant="outlined"
                  error={!!errors.displayName}
                />
                <ErrorMessage
                  errors={errors}
                  name="displayName"
                  render={({ message }) => (
                    <FormHelperText error>{message}</FormHelperText>
                  )}
                />
                {isMissingField('displayName') && !errors.displayName && (
                  <FormHelperText sx={{ color: 'error.main' }}>
                    この項目の入力が必要です
                  </FormHelperText>
                )}
              </Box>

              <Box>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 1,
                    color: errors.fullName ? 'error.main' : 'inherit',
                  }}
                >
                  お名前
                </Typography>
                <TextField
                  {...register('fullName')}
                  fullWidth
                  size="small"
                  variant="outlined"
                  error={!!errors.fullName}
                />
                <ErrorMessage
                  errors={errors}
                  name="fullName"
                  render={({ message }) => (
                    <FormHelperText error>{message}</FormHelperText>
                  )}
                />
              </Box>

              <Box>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 1,
                    color: errors.fullNameRuby ? 'error.main' : 'inherit',
                  }}
                >
                  フリガナ
                </Typography>
                <TextField
                  {...register('fullNameRuby')}
                  fullWidth
                  size="small"
                  variant="outlined"
                  error={!!errors.fullNameRuby}
                />
                <ErrorMessage
                  errors={errors}
                  name="fullNameRuby"
                  render={({ message }) => (
                    <FormHelperText error>{message}</FormHelperText>
                  )}
                />
              </Box>

              <Box>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 1,
                    color: errors.birthday ? 'error.main' : 'inherit',
                  }}
                >
                  生年月日 (YYYY-MM-DD)
                </Typography>
                <TextField
                  {...register('birthday', {
                    onChange: (e) => {
                      let value = e.target.value.replace(/[^\d]/g, '');
                      if (value.length > 4) {
                        value = `${value.substring(0, 4)}-${value.substring(
                          4,
                        )}`;
                      }
                      if (value.length > 7) {
                        value = `${value.substring(0, 7)}-${value.substring(
                          7,
                        )}`;
                      }
                      if (value.length > 10) {
                        value = value.substring(0, 10);
                      }
                      e.target.value = value;
                    },
                  })}
                  fullWidth
                  placeholder="YYYY-MM-DD"
                  size="small"
                  variant="outlined"
                  error={!!errors.birthday}
                  inputProps={{
                    maxLength: 10,
                    inputMode: 'numeric',
                  }}
                />
                <ErrorMessage
                  errors={errors}
                  name="birthday"
                  render={({ message }) => (
                    <FormHelperText error>{message}</FormHelperText>
                  )}
                />
              </Box>

              <Box>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 1,
                    color: errors.phoneNumber ? 'error.main' : 'inherit',
                    fontWeight:
                      getFieldProps('phoneNumber').labelProps.fontWeight,
                  }}
                >
                  電話番号 (ハイフンなし)
                  {getFieldProps('phoneNumber').showMissingIndicator && (
                    <Typography
                      component="span"
                      sx={{ color: 'error.main', ml: 1 }}
                    >
                      (未入力)
                    </Typography>
                  )}
                </Typography>
                <TextField
                  {...register('phoneNumber', {
                    onChange: (e) => {
                      const value = e.target.value.replace(/[^\d]/g, '');
                      e.target.value = value;
                    },
                  })}
                  fullWidth
                  size="small"
                  variant="outlined"
                  error={getFieldProps('phoneNumber').textFieldProps.error}
                  sx={getFieldProps('phoneNumber').textFieldProps.sx}
                  inputProps={{
                    maxLength: 11,
                    inputMode: 'numeric',
                  }}
                />
                <ErrorMessage
                  errors={errors}
                  name="phoneNumber"
                  render={({ message }) => (
                    <FormHelperText error>{message}</FormHelperText>
                  )}
                />
                {getFieldProps('phoneNumber').showMissingIndicator &&
                  !errors.phoneNumber && (
                    <FormHelperText sx={{ color: 'error.main' }}>
                      この項目の入力が必要です
                    </FormHelperText>
                  )}
              </Box>

              <Box>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 1,
                    color: errors.mail ? 'error.main' : 'inherit',
                  }}
                >
                  メールアドレス
                </Typography>
                <TextField
                  {...register('mail')}
                  fullWidth
                  type="email"
                  size="small"
                  variant="outlined"
                  error={!!errors.mail}
                />
                <ErrorMessage
                  errors={errors}
                  name="mail"
                  render={({ message }) => (
                    <FormHelperText error>{message}</FormHelperText>
                  )}
                />
              </Box>

              <Box>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 1,
                    color: errors.zipCode ? 'error.main' : 'inherit',
                  }}
                >
                  郵便番号
                </Typography>
                <TextField
                  {...register('zipCode', {
                    onChange: (e) => {
                      let value = e.target.value.replace(/[^\d]/g, '');
                      if (value.length > 3) {
                        value = `${value.substring(0, 3)}-${value.substring(
                          3,
                        )}`;
                      }
                      if (value.length > 8) {
                        value = value.substring(0, 8);
                      }
                      e.target.value = value;
                    },
                  })}
                  fullWidth
                  placeholder="123-4567"
                  size="small"
                  variant="outlined"
                  error={!!errors.zipCode}
                  inputProps={{
                    maxLength: 8,
                    inputMode: 'numeric',
                  }}
                />
                <ErrorMessage
                  errors={errors}
                  name="zipCode"
                  render={({ message }) => (
                    <FormHelperText error>{message}</FormHelperText>
                  )}
                />
              </Box>

              <Box>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 1,
                    color: errors.prefecture ? 'error.main' : 'inherit',
                    fontWeight:
                      getFieldProps('prefecture').labelProps.fontWeight,
                  }}
                >
                  都道府県
                  {getFieldProps('prefecture').showMissingIndicator && (
                    <Typography
                      component="span"
                      sx={{ color: 'error.main', ml: 1 }}
                    >
                      (未入力)
                    </Typography>
                  )}
                </Typography>
                <TextField
                  {...register('prefecture')}
                  fullWidth
                  size="small"
                  variant="outlined"
                  error={getFieldProps('prefecture').textFieldProps.error}
                  sx={getFieldProps('prefecture').textFieldProps.sx}
                />
                <ErrorMessage
                  errors={errors}
                  name="prefecture"
                  render={({ message }) => (
                    <FormHelperText error>{message}</FormHelperText>
                  )}
                />
                {getFieldProps('prefecture').showMissingIndicator &&
                  !errors.prefecture && (
                    <FormHelperText sx={{ color: 'error.main' }}>
                      この項目の入力が必要です
                    </FormHelperText>
                  )}
              </Box>

              <Box>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 1,
                    color: errors.city ? 'error.main' : 'inherit',
                  }}
                >
                  市区町村
                </Typography>
                <TextField
                  {...register('city')}
                  fullWidth
                  size="small"
                  variant="outlined"
                  error={!!errors.city}
                />
                <ErrorMessage
                  errors={errors}
                  name="city"
                  render={({ message }) => (
                    <FormHelperText error>{message}</FormHelperText>
                  )}
                />
              </Box>

              <Box>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 1,
                    color: errors.address2 ? 'error.main' : 'inherit',
                  }}
                >
                  以降の住所
                </Typography>
                <TextField
                  {...register('address2')}
                  fullWidth
                  size="small"
                  variant="outlined"
                  error={!!errors.address2}
                />
                <ErrorMessage
                  errors={errors}
                  name="address2"
                  render={({ message }) => (
                    <FormHelperText error>{message}</FormHelperText>
                  )}
                />
              </Box>

              <Box>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 1,
                    color: errors.building ? 'error.main' : 'inherit',
                  }}
                >
                  建物名など
                </Typography>
                <TextField
                  {...register('building')}
                  fullWidth
                  size="small"
                  variant="outlined"
                  error={!!errors.building}
                />
                <ErrorMessage
                  errors={errors}
                  name="building"
                  render={({ message }) => (
                    <FormHelperText error>{message}</FormHelperText>
                  )}
                />
              </Box>

              <Box sx={{ mt: 2 }}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{
                    mt: 1,
                    mb: 2,
                    py: 1.5,
                    bgcolor: '#c34646',
                    '&:hover': {
                      bgcolor: '#a93939',
                    },
                  }}
                >
                  入力内容を確認
                </Button>
              </Box>
            </Stack>
          </Box>
        </FormProvider>
      </Paper>
    </Container>
  );
}
