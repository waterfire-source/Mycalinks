'use client';

import React, { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Alert,
  CircularProgress,
  Divider,
} from '@mui/material';
import { Download, FileDownload, PictureAsPdf } from '@mui/icons-material';

export default function InvoiceDownloadPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDownloadPdf = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        '/api/internal/ec/order/invoice-pdf/download',
      );

      if (!response.ok) {
        throw new Error('PDFダウンロードに失敗しました');
      }

      // PDFのBlobを取得
      const blob = await response.blob();

      // ダウンロード用のリンクを作成
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `請求書_${new Date().getTime()}.pdf`;

      // ダウンロードを実行
      document.body.appendChild(link);
      link.click();

      // クリーンアップ
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'ダウンロードに失敗しました',
      );
      console.error('PDF download error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPdf = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        '/api/internal/ec/order/invoice-pdf/download',
      );

      if (!response.ok) {
        throw new Error('PDF表示に失敗しました');
      }

      // PDFのBlobを取得
      const blob = await response.blob();

      // 新しいタブでPDFを表示
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');

      // しばらく後にクリーンアップ
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PDF表示に失敗しました');
      console.error('PDF view error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          textAlign: 'center',
          bgcolor: 'white',
        }}
      >
        <PictureAsPdf
          sx={{
            fontSize: 64,
            color: 'primary.main',
            mb: 2,
          }}
        />

        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ fontWeight: 'bold', color: 'primary.main' }}
        >
          請求書ダウンロード
        </Typography>

        <Typography variant="body1" sx={{ mb: 4, color: 'grey.600' }}>
          トレーディングカード代の請求書PDFをダウンロードできます
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" color="primary" gutterBottom>
            ¥ 220,000（税込）
          </Typography>
          <Typography variant="body2" sx={{ color: 'grey.600' }}>
            請求書番号: 153 | 発行日: 2025/08/06
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleDownloadPdf}
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <Download />}
            sx={{
              py: 1.5,
              fontSize: '1.1rem',
              fontWeight: 'bold',
            }}
          >
            {loading ? 'ダウンロード中...' : 'PDFダウンロード'}
          </Button>

          <Button
            variant="outlined"
            size="large"
            onClick={handleViewPdf}
            disabled={loading}
            startIcon={<FileDownload />}
            sx={{ py: 1.5 }}
          >
            PDFプレビュー
          </Button>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mt: 3 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
          <Typography variant="caption" sx={{ color: 'grey.600' }}>
            📋 請求書の内容
            <br />
            • 遊戯王　青眼の白龍
            <br />
            • ポケモンカード　リザードンVMAX
            <br />
            • ポケモンカード　ピカチュウ（プロモ）
            <br />• ワンピースカード　ルフィ（SR）
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
}
