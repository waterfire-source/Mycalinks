import {
  Box,
  RadioGroup,
  FormControlLabel,
  Radio,
  Button,
  Stack,
  Typography,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Skeleton,
} from '@mui/material';
import { Gmo_Credit_Card } from '@prisma/client';
import { useEffect, useState } from 'react';
import { useEcCreditCard } from '@/app/ec/(core)/hooks/useEcCreditCard';
import { CreditCardForm } from '@/app/ec/(core)/feature/order/CreditCardForm';
import AddIcon from '@mui/icons-material/Add';
import CreditCardIcon from '@mui/icons-material/CreditCard';

// ブランドロゴの色を取得
const getBrandColor = (brand: string): string => {
  const brandColors: Record<string, string> = {
    VISA: '#1A1F71',
    MASTERCARD: '#EB001B',
    JCB: '#003A70',
    DINERS: '#0079BE',
    AMEX: '#006FCF',
    UNKNOWN: '#E20000',
  };

  return brandColors[brand] || '#666';
};

export const CreditCardSelect = ({
  onConfirm,
  onBack,
}: {
  onConfirm: (cardId: Gmo_Credit_Card['id'], cardLast4: string) => void;
  onBack: () => void;
}) => {
  const {
    fetchCreditCardList,
    creditCardList,
    registerCreditCard,
    isProcessing,
  } = useEcCreditCard();
  const [selectedCardId, setSelectedCardId] = useState<
    Gmo_Credit_Card['id'] | null
  >(null);

  const [mode, setMode] = useState<'select' | 'register'>('select');

  // 最初にクレジットカードをフェッチしてくる
  useEffect(() => {
    fetchCreditCardList();
  }, [fetchCreditCardList]);

  // クレジットカード登録
  const handleRegisterCreditCard = async (
    cardToken: string,
    cardLast4: string,
  ) => {
    const cardInfo = await registerCreditCard(cardToken);
    //フェッチし治す
    fetchCreditCardList();

    if (!cardInfo) {
      return;
    }

    //このカードを選択する
    onConfirm(cardInfo.id, cardLast4);
  };

  const handleSubmit = () => {
    if (selectedCardId) {
      const card = creditCardList.find((card) => card.id === selectedCardId);
      const last4 = card?.masked_card_number.slice(-4);
      onConfirm(selectedCardId, last4 ?? '');
    }
  };

  return (
    <Box sx={{ p: 2, px: 0.5 }}>
      {mode === 'select' && (
        <>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            支払い方法を選択
          </Typography>

          {isProcessing ? (
            <Stack spacing={2}>
              {[1].map((i) => (
                <Card key={i} sx={{ border: '1px solid #e0e0e0' }}>
                  <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Skeleton variant="circular" width={20} height={20} />
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{ flex: 1 }}
                      >
                        <Skeleton
                          variant="rectangular"
                          width={60}
                          height={24}
                          sx={{ borderRadius: 1 }}
                        />
                        <Skeleton variant="text" width={150} height={20} />
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>
              ))}
            </Stack>
          ) : creditCardList.length === 0 ? (
            <Card
              sx={{
                backgroundColor: '#f5f5f5',
                border: 'none',
                boxShadow: 'none',
                mb: 2,
              }}
            >
              <CardContent
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  py: 4,
                }}
              >
                <CreditCardIcon sx={{ fontSize: 48, color: '#999', mb: 2 }} />
                <Typography variant="body1" sx={{ color: '#666' }}>
                  クレジットカードが登録されていません
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <RadioGroup
              value={selectedCardId}
              onChange={(e) => {
                const cardId = Number(e.target.value);
                setSelectedCardId(cardId);
              }}
              sx={{ width: '100%', gap: 2 }}
            >
              {creditCardList.map((card) => {
                const brandColor = getBrandColor(card.brand);
                const isSelected = selectedCardId === card.id;

                return (
                  <Card
                    key={card.id}
                    sx={{
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      border: isSelected ? '2px solid' : '1px solid',
                      borderColor: isSelected ? 'primary.main' : '#e0e0e0',
                      '&:hover': {
                        borderColor: 'primary.main',
                        boxShadow: 1,
                      },
                    }}
                    onClick={() => setSelectedCardId(card.id)}
                  >
                    <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 } }}>
                      <FormControlLabel
                        value={card.id}
                        control={
                          <Radio checked={isSelected} sx={{ p: 0, mr: 2 }} />
                        }
                        label={
                          <Stack sx={{ width: '100%' }}>
                            <Stack
                              direction="row"
                              alignItems="center"
                              justifyContent="space-between"
                            >
                              <Stack
                                direction="row"
                                alignItems="center"
                                spacing={1}
                                sx={{ flex: 1, minWidth: 0 }}
                              >
                                <Chip
                                  label={card.brand.toUpperCase()}
                                  size="small"
                                  sx={{
                                    backgroundColor: brandColor,
                                    color: 'white',
                                    fontWeight: 600,
                                    fontSize: '0.7rem',
                                    height: 24,
                                    minWidth: 60,
                                    '& .MuiChip-label': {
                                      px: 1,
                                    },
                                  }}
                                />
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontFamily: 'monospace',
                                    letterSpacing: 0.5,
                                    fontSize: '0.9rem',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {card.masked_card_number}
                                </Typography>
                              </Stack>
                            </Stack>
                          </Stack>
                        }
                        sx={{
                          width: '100%',
                          margin: 0,
                        }}
                      />
                    </CardContent>
                  </Card>
                );
              })}
            </RadioGroup>
          )}

          <Button
            variant="outlined"
            startIcon={
              isProcessing ? <CircularProgress size={16} /> : <AddIcon />
            }
            onClick={() => setMode('register')}
            disabled={isProcessing}
            sx={{
              width: '100%',
              mt: 3,
              py: 1.5,
              borderStyle: 'dashed',
              borderWidth: 2,
              '&:hover': {
                borderStyle: 'dashed',
                borderWidth: 2,
              },
            }}
          >
            {isProcessing
              ? 'カード情報を取得中...'
              : creditCardList.length === 0
              ? '新しいカードを登録'
              : '別のカードを登録'}
          </Button>
        </>
      )}
      {mode === 'register' && (
        <>
          <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
            カード情報を入力
          </Typography>
          <CreditCardForm
            onConfirm={handleRegisterCreditCard}
            onBack={() => setMode('select')}
          />
        </>
      )}

      {mode === 'select' && creditCardList.length > 0 && !isProcessing && (
        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          <Button
            variant="outlined"
            onClick={onBack}
            sx={{
              flex: 1,
              fontSize: '0.7rem',
              py: 1,
            }}
          >
            戻る
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!selectedCardId}
            sx={{
              flex: 2,
              fontSize: '0.7rem',
              py: 1,
            }}
          >
            このカードで支払う
          </Button>
        </Stack>
      )}
    </Box>
  );
};
