'use client';

import { useForm, FormProvider, Controller } from 'react-hook-form';
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
  Select,
  MenuItem,
  FormControl,
} from '@mui/material';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { PATH } from '@/app/ec/(core)/constants/paths';
import { useEffect, useState } from 'react';

export const contactSchema = z.object({
  orderNumber: z.string().min(1, 'ご注文番号は必須です'),
  kind: z.string().min(1, 'お問い合わせの種類は必須です'),
  title: z.string().min(1, '件名は必須です'),
  content: z.string().min(1, 'お問い合わせ内容は必須です'),
});

export type ContactFormData = z.infer<typeof contactSchema>;

export const kinds = [
  { value: 'order', label: '注文内容について' },
  { value: 'payment', label: '支払いについて' },
  { value: 'delivery', label: '配送について' },
  { value: 'return', label: '返品・交換について' },
  { value: 'other', label: 'その他' },
];

export default function ContactPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params.orderId as string;
  const kindFromQuery = searchParams.get('kind');
  const titleFromQuery = searchParams.get('title');
  const [isKindReadOnly, setIsKindReadOnly] = useState(false);
  const [isTitleReadOnly, setIsTitleReadOnly] = useState(false);

  const methods = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      orderNumber: orderId,
      kind: kindFromQuery || '',
      title: titleFromQuery || '',
      content: '',
    },
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = methods;

  // セッションデータの読み込みとクエリパラメータ処理
  useEffect(() => {
    const savedData = sessionStorage.getItem('contactData');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      reset(parsedData);
    } else if (kindFromQuery || titleFromQuery) {
      // セッションデータがなく、クエリパラメータがある場合
      if (kindFromQuery) setIsKindReadOnly(true);
      if (titleFromQuery) setIsTitleReadOnly(true);
      reset({
        orderNumber: orderId,
        kind: kindFromQuery || '',
        title: titleFromQuery || '',
        content: '',
      });
    }
  }, [reset, kindFromQuery, titleFromQuery, orderId]);

  const onSubmit = (data: ContactFormData) => {
    sessionStorage.setItem('contactData', JSON.stringify(data));
    router.push(PATH.ORDER.contactConfirm(orderId));
  };

  return (
    <Container maxWidth="sm" sx={{ py: 1 }}>
      <Typography
        variant="h5"
        component="h1"
        align="center"
        sx={{ mb: 2, fontWeight: 'bold' }}
      >
        お問い合わせ
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
                    color: errors.orderNumber ? 'error.main' : 'inherit',
                  }}
                >
                  ご注文番号
                </Typography>
                <Controller
                  name="orderNumber"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      disabled
                      fullWidth
                      size="small"
                      variant="outlined"
                      error={!!errors.orderNumber}
                    />
                  )}
                />
                <ErrorMessage
                  errors={errors}
                  name="orderNumber"
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
                    color: errors.kind ? 'error.main' : 'inherit',
                  }}
                >
                  お問い合わせの種類
                </Typography>
                <Controller
                  name="kind"
                  control={control}
                  render={({ field }) => (
                    <FormControl fullWidth error={!!errors.kind}>
                      <Select
                        {...field}
                        size="small"
                        displayEmpty
                        disabled={isKindReadOnly}
                      >
                        <MenuItem value="" disabled>
                          選択してください
                        </MenuItem>
                        {kinds.map((kind) => (
                          <MenuItem key={kind.value} value={kind.value}>
                            {kind.label}
                          </MenuItem>
                        ))}
                      </Select>
                      <ErrorMessage
                        errors={errors}
                        name="kind"
                        render={({ message }) => (
                          <FormHelperText error>{message}</FormHelperText>
                        )}
                      />
                    </FormControl>
                  )}
                />
              </Box>

              <Box>
                <Typography
                  variant="body1"
                  sx={{
                    mb: 1,
                    color: errors.title ? 'error.main' : 'inherit',
                  }}
                >
                  件名
                </Typography>
                <Controller
                  name="title"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      size="small"
                      variant="outlined"
                      error={!!errors.title}
                      disabled={isTitleReadOnly}
                    />
                  )}
                />
                <ErrorMessage
                  errors={errors}
                  name="title"
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
                    color: errors.content ? 'error.main' : 'inherit',
                  }}
                >
                  お問い合わせ内容
                </Typography>
                <Controller
                  name="content"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      fullWidth
                      multiline
                      rows={10}
                      size="small"
                      variant="outlined"
                      error={!!errors.content}
                    />
                  )}
                />
                <ErrorMessage
                  errors={errors}
                  name="content"
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
