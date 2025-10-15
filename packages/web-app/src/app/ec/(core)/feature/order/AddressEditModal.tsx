'use client';

import { useForm, FormProvider } from 'react-hook-form';
import { ErrorMessage } from '@hookform/error-message';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Box,
  Typography,
  TextField,
  Button,
  FormHelperText,
  CircularProgress,
} from '@mui/material';
import { useEffect, useState, useRef } from 'react';
import { useAddressSearch } from '@/feature/stocking/hooks/useAddressSearch';
import { CommonModal } from '@/app/ec/(core)/components/modals/CommonModal';
import { useAppAuth } from '@/providers/useAppAuth';
import { CustomError } from '@/api/implement';
import { DisplayAccountInfo } from '@/app/ec/(auth)/order/page';
import { useAlert } from '@/contexts/AlertContext';

export const addressEditSchema = z.object({
  zipCode: z
    .string()
    .regex(/^\d{3}-?\d{4}$|^\d{7}$/, '郵便番号は7桁の数字を入力してください'),
  prefecture: z.string().min(1, '都道府県は必須です'),
  city: z.string().min(1, '市区町村は必須です'),
  address2: z.string().min(1, '住所は必須です'),
  building: z.string().optional(),
});

type AddressEditFormData = z.infer<typeof addressEditSchema>;

interface AddressEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentAddress: DisplayAccountInfo;
  onUpdateSuccess: (updatedInfo: any) => void;
}

export const AddressEditModal = ({
  isOpen,
  onClose,
  currentAddress,
  onUpdateSuccess,
}: AddressEditModalProps) => {
  const { updateUserInfo, getAccountInfo } = useAppAuth();
  const [isUpdating, setIsUpdating] = useState(false);
  const { setAlertState } = useAlert();
  const isInitialMount = useRef(true);

  const methods = useForm<AddressEditFormData>({
    resolver: zodResolver(addressEditSchema),
    defaultValues: currentAddress,
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
    if (isOpen) {
      reset(currentAddress);
      isInitialMount.current = true;
    }
  }, [isOpen, currentAddress, reset]);

  useEffect(() => {
    if (
      watchZipCode &&
      watchZipCode.replace(/-/g, '').length === 7 &&
      !isInitialMount.current
    ) {
      handleAddressSearch();
    }
    if (isInitialMount.current) {
      isInitialMount.current = false;
    }
  }, [watchZipCode, handleAddressSearch]);

  useEffect(() => {
    if (address.prefecture) {
      setValue('prefecture', address.prefecture, { shouldValidate: true });
    }
    if (address.city) {
      setValue('city', address.city, { shouldValidate: true });
    }
    if (address.address2) {
      setValue('address2', address.address2, { shouldValidate: true });
    }
  }, [address, setValue]);

  const onSubmit = async (data: AddressEditFormData) => {
    setIsUpdating(true);
    try {
      const result = await updateUserInfo({
        zipCode: data.zipCode,
        prefecture: data.prefecture,
        city: data.city,
        address2: data.address2,
        building: data.building,
      });
      if (!(result instanceof CustomError)) {
        const newInfo = await getAccountInfo();
        if (!(newInfo instanceof CustomError)) {
          onUpdateSuccess(newInfo);
          window.location.reload();
        }
        onClose();
      } else {
        setAlertState({
          message: '住所の更新に失敗しました',
          severity: 'error',
        });
      }
    } catch (error) {
      setAlertState({
        message: '住所の更新中にエラーが発生しました',
        severity: 'error',
      });
    }
    setIsUpdating(false);
  };

  return (
    <CommonModal isOpen={isOpen} onClose={onClose} title="お届け先変更">
      <FormProvider {...methods}>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          sx={{ pt: 3 }}
        >
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="body2"
              sx={{ mb: 0.5, color: errors.zipCode ? 'error.main' : 'inherit' }}
            >
              郵便番号
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <TextField
                {...register('zipCode')}
                variant="outlined"
                size="small"
                error={!!errors.zipCode}
                sx={{ flexGrow: 1, mr: 1 }}
              />
            </Box>
            <ErrorMessage
              errors={errors}
              name="zipCode"
              render={({ message }) => (
                <FormHelperText error>{message}</FormHelperText>
              )}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography
              variant="body2"
              sx={{
                mb: 0.5,
                color: errors.prefecture ? 'error.main' : 'inherit',
              }}
            >
              都道府県
            </Typography>
            <TextField
              {...register('prefecture')}
              variant="outlined"
              fullWidth
              size="small"
              error={!!errors.prefecture}
            />
            <ErrorMessage
              errors={errors}
              name="prefecture"
              render={({ message }) => (
                <FormHelperText error>{message}</FormHelperText>
              )}
            />
          </Box>

          <Box sx={{ mb: 2 }}>
            <Typography
              variant="body2"
              sx={{ mb: 0.5, color: errors.city ? 'error.main' : 'inherit' }}
            >
              市区町村
            </Typography>
            <TextField
              {...register('city')}
              variant="outlined"
              fullWidth
              size="small"
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

          <Box sx={{ mb: 2 }}>
            <Typography
              variant="body2"
              sx={{
                mb: 0.5,
                color: errors.address2 ? 'error.main' : 'inherit',
              }}
            >
              以降の住所
            </Typography>
            <TextField
              {...register('address2')}
              variant="outlined"
              fullWidth
              size="small"
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

          <Box sx={{ mb: 2 }}>
            <Typography
              variant="body2"
              sx={{
                mb: 0.5,
                color: errors.building ? 'error.main' : 'inherit',
              }}
            >
              建物名など
            </Typography>
            <TextField
              {...register('building')}
              variant="outlined"
              fullWidth
              size="small"
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

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mb: 1 }}
            disabled={isUpdating}
          >
            {isUpdating ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              '変更'
            )}
          </Button>
          <Button
            variant="contained"
            fullWidth
            onClick={onClose}
            sx={{
              bgcolor: '#d3d3d3',
              color: 'white',
            }}
          >
            戻る
          </Button>
        </Box>
      </FormProvider>
    </CommonModal>
  );
};
