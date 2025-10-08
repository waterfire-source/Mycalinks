'use client';
import {
  Container,
  Box,
  Typography,
  Stack,
  Card,
  CardContent,
} from '@mui/material';
// import { useSearchParams } from 'next/navigation';
// import { DeckPurchaseOption } from '@/feature/deck/DeckPurchaseOption';

export default function DeckPurchaseOptionPage() {
  // const searchParams = useSearchParams();
  // const deckId = searchParams.get('deckId')
  //   ? Number(searchParams.get('deckId'))
  //   : undefined;
  // const deckCode = searchParams.get('code') // 'deckCode'ではなく'code'で受け取る
  //   ? String(searchParams.get('code'))
  //   : undefined;

  return (
    <Container maxWidth="md">
      <Box sx={{ py: 4 }}>
        <Stack spacing={4} alignItems="center">
          {/* メインタイトル */}
          <Typography
            variant="h2"
            textAlign="center"
            fontWeight="bold"
            sx={{
              color: 'primary.main',
              textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
            }}
          >
            デッキ購入機能　近日公開！
          </Typography>

          {/* 説明カード */}
          <Card sx={{ maxWidth: 600, width: '100%', boxShadow: 3 }}>
            <CardContent>
              <Stack spacing={3}>
                <Typography variant="h4" fontWeight="bold" textAlign="center">
                  デッキレシピを元にカードを購入できます
                </Typography>

                <Stack spacing={2}>
                  <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                    お気に入りのデッキレシピから、必要なカードを簡単に購入できる新機能を準備中です。
                  </Typography>

                  <Typography variant="h5" fontWeight="bold" sx={{ mt: 2 }}>
                    便利な機能：
                  </Typography>

                  <Stack spacing={1.2} sx={{ pl: 2 }}>
                    <Typography variant="body1">
                      • デッキレシピを元に必要なカードを自動追加
                    </Typography>
                    <Typography variant="body1">
                      • カードの状態やレアリティを選択可能
                    </Typography>
                    <Typography variant="body1">
                      • 最安値や最速発送を優先する柔軟な購入オプション
                    </Typography>
                    <Typography variant="body1">
                      • 複数の店舗から最適な商品を自動選択
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Stack>

        {/* コメントアウトされた元のコンポーネント */}
        {/* <Typography variant="h2" textAlign="center" py={2}>
          デッキ購入オプション
        </Typography>
        <DeckPurchaseOption deckId={deckId} deckCode={deckCode} /> */}
      </Box>
    </Container>
  );
}
