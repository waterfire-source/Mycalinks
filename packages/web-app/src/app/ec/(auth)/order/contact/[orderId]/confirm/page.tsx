'use client';

import { useEffect, useState } from 'react';
import * as z from 'zod';
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  Stack,
} from '@mui/material';
import { useParams, useRouter } from 'next/navigation';
import { useEcOrderContact } from '@/app/ec/(core)/hooks/useEcOrderContact';
import { PATH } from '@/app/ec/(core)/constants/paths';
import {
  contactSchema,
  kinds,
} from '@/app/ec/(auth)/order/contact/[orderId]/page';

export default function ContactConfirmPage() {
  const router = useRouter();
  const params = useParams();
  const orderId = params.orderId as string;
  const [contactData, setContactData] = useState<z.infer<
    typeof contactSchema
  > | null>(null);
  const { createOrderContact } = useEcOrderContact();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const data = sessionStorage.getItem('contactData');
    if (data) {
      setContactData(JSON.parse(data));
    } else {
      router.push(PATH.TOP);
    }
  }, [router]);

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      if (contactData) {
        const params = {
          kind: contactData.kind,
          title: contactData.title,
          content: contactData.content,
        };

        await createOrderContact(orderId, params);
        sessionStorage.removeItem('contactData');
        router.push(PATH.ORDER.contactResult(orderId));
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  if (!contactData) {
    return null;
  }

  return (
    <Container maxWidth="sm" sx={{ py: 1 }}>
      <Typography
        variant="h5"
        component="h1"
        align="center"
        sx={{ mb: 2, fontWeight: 'bold' }}
      >
        入力内容の確認
      </Typography>
      <Paper elevation={2} sx={{ p: 3, borderRadius: '8px' }}>
        <Stack spacing={2}>
          <Box>
            <Typography variant="body1" gutterBottom>
              【ご注文番号】
            </Typography>
            <Typography variant="body1">{contactData.orderNumber}</Typography>
          </Box>

          <Box>
            <Typography variant="body1" gutterBottom>
              【お問い合わせの種類】
            </Typography>
            <Typography variant="body1">
              {kinds.find((k) => k.value === contactData.kind)?.label}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body1" gutterBottom>
              【件名】
            </Typography>
            <Typography
              variant="body1"
              sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
            >
              {contactData.title}
            </Typography>
          </Box>

          <Box>
            <Typography variant="body1" gutterBottom>
              【お問い合わせ内容】
            </Typography>
            <Typography
              variant="body1"
              sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
            >
              {contactData.content}
            </Typography>
          </Box>

          <Box sx={{ mt: 2 }}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSubmit}
              disabled={isLoading}
              sx={{
                mt: 1,
                mb: 2,
                py: 1.5,
              }}
            >
              送信する
            </Button>
            <Button
              fullWidth
              variant="outlined"
              onClick={handleBack}
              disabled={isLoading}
              sx={{
                py: 1.5,
                color: '#fff',
                borderColor: 'grey.500',
                backgroundColor: 'grey.500',
              }}
            >
              修正する
            </Button>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
}
