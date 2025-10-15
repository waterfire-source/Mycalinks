'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Alert,
  CircularProgress,
  Divider,
  Grid,
} from '@mui/material';
import { MycaAppClient, OpenAPI } from 'api-generator/app-client';
import { getAppHeaders } from '@/utils/appAuth';

export default function ApiTestPage() {
  const [loading, setLoading] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  const testApi = async (testName: string, apiCall: () => Promise<any>) => {
    setLoading(testName);
    setErrors((prev) => ({ ...prev, [testName]: '' }));

    try {
      const result = await apiCall();
      setResults((prev) => ({ ...prev, [testName]: result }));
    } catch (error: any) {
      console.error(`${testName} error:`, error);
      setErrors((prev) => ({
        ...prev,
        [testName]: error.message || JSON.stringify(error),
      }));
    } finally {
      setLoading(null);
    }
  };

  const testReservationReception = () => {
    testApi('ReservationReceptionByMycaUser', async () => {
      const headers = await getAppHeaders();
      const client = new MycaAppClient({
        BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
        HEADERS: headers,
      });
      return await client.reservation.getReservationReceptionByMycaUser({
        storeId: 1,
      });
    });
  };

  const testMycaUserBarcode = () => {
    testApi('mycaUserBarcode', async () => {
      const headers = await getAppHeaders();
      const client = new MycaAppClient({
        BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
        HEADERS: headers,
      });
      return await client.mycaUser.getMycaUserBarcode();
    });
  };

  const testStoreList = () => {
    testApi('storeList', async () => {
      const client = new MycaAppClient({
        BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
      });
      // 全店舗取得を試す
      return await client.store.getAllStore();
    });
  };

  const testItemGenre = () => {
    testApi('itemGenre', async () => {
      const client = new MycaAppClient({
        BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
      });
      return await client.item.getItemGenre({
        storeId: 1,
      });
    });
  };

  // ヘッダー情報のテスト
  const testHeaders = () => {
    testApi('headers', async () => {
      const headers = await getAppHeaders();
      return {
        message: 'ヘッダー情報の確認',
        headers: headers,
        hasToken: !!headers?.MycaToken,
        tokenLength: headers?.MycaToken?.length || 0,
      };
    });
  };

  const renderResult = (testName: string) => {
    const result = results[testName];
    const error = errors[testName];
    const isLoading = loading === testName;

    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            {testName}
          </Typography>

          {isLoading && (
            <Box display="flex" alignItems="center" gap={1}>
              <CircularProgress size={20} />
              <Typography variant="body2">実行中...</Typography>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 1 }}>
              <Typography variant="body2">{error}</Typography>
            </Alert>
          )}

          {result && (
            <Alert severity="success" sx={{ mt: 1 }}>
              <Typography
                variant="body2"
                component="pre"
                sx={{ whiteSpace: 'pre-wrap' }}
              >
                {JSON.stringify(result, null, 2)}
              </Typography>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        AppCustomFetch API テスト
      </Typography>

      <Typography variant="body1" color="textSecondary" sx={{ mb: 3 }}>
        新しく生成されたMycaAppClientのテスト用ページです。
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item>
          <Button
            variant="contained"
            onClick={testReservationReception}
            disabled={loading !== null}
          >
            Myca User 予約
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            onClick={testMycaUserBarcode}
            disabled={loading !== null}
          >
            Myca User Barcode
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            onClick={testStoreList}
            disabled={loading !== null}
            color="secondary"
          >
            Store List
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            onClick={testItemGenre}
            disabled={loading !== null}
            color="info"
          >
            Item Genre
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant="outlined"
            onClick={testHeaders}
            disabled={loading !== null}
            color="warning"
          >
            Test Headers
          </Button>
        </Grid>
      </Grid>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h5" gutterBottom>
        テスト結果
      </Typography>

      {renderResult('ReservationReceptionByMycaUser')}
      {renderResult('mycaUserBarcode')}
      {renderResult('storeList')}
      {renderResult('itemGenre')}
      {renderResult('headers')}

      <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="h6" gutterBottom>
          設定情報
        </Typography>
        <Typography variant="body2">Base URL: {OpenAPI.BASE}</Typography>
        <Typography variant="body2">Version: {OpenAPI.VERSION}</Typography>
      </Box>
    </Box>
  );
}
