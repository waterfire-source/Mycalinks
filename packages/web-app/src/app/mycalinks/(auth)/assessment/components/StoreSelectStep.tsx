'use client';

import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  Button,
  Container,
} from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { useState, useEffect } from 'react';
import { Store } from '@prisma/client';
import { useAlert } from '@/contexts/AlertContext';
import { useStoresWithDraftTransactions } from '@/app/mycalinks/(auth)/assessment/hooks/useStoresWithDraftTransactions';
import Loader from '@/components/common/Loader';

interface StoreSelectStepProps {
  onStoreSelect: (store: Store) => void;
}

export const StoreSelectStep = ({ onStoreSelect }: StoreSelectStepProps) => {
  const { stores, fetchStoresWithDraftTransactions, loading } =
    useStoresWithDraftTransactions();
  const { setAlertState } = useAlert();
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);

  // 下書き取引がある店舗一覧を取得
  useEffect(() => {
    const fetchStores = async () => {
      try {
        await fetchStoresWithDraftTransactions();
      } catch (error) {
        console.error('Failed to fetch stores with draft transactions:', error);
        setAlertState({
          message: '店舗情報の取得に失敗しました',
          severity: 'error',
        });
      }
    };
    fetchStores();
  }, [fetchStoresWithDraftTransactions, setAlertState]);

  useEffect(() => {
    // 店舗が1つの場合は自動で選択
    if (stores.length === 1 && !selectedStore) {
      onStoreSelect(stores[0]);
    }
  }, [onStoreSelect, stores]);

  // 店舗選択ハンドラー
  const handleStoreSelect = (store: Store) => {
    setSelectedStore(store);
  };

  // 次へ進むボタンのハンドラー
  const handleNext = () => {
    if (!selectedStore) {
      setAlertState({
        message: '店舗を選択してください',
        severity: 'error',
      });
      return;
    }

    onStoreSelect(selectedStore);
  };

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: '#f8f8f8',
        position: 'relative',
      }}
    >
      {/* ヘッダー */}
      <Box
        sx={{
          width: '100%',
          backgroundColor: 'primary.main',
          py: 2,
        }}
      >
        <Typography
          sx={{
            textAlign: 'center',
            fontWeight: 'bold',
            fontSize: '14px!important',
            color: 'white',
          }}
        >
          店舗を選択
        </Typography>
      </Box>

      {stores.length === 0 ? (
        <Loader />
      ) : (
        <Container maxWidth="md" sx={{ py: 3 }}>
          {/* 店舗一覧 */}
          <Box
            sx={{
              backgroundColor: 'white',
              borderRadius: 2,
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          >
            <List sx={{ p: 0 }}>
              {stores.map((store) => {
                const isSelected = selectedStore?.id === store.id;

                return (
                  <ListItem key={store.id} disablePadding>
                    <ListItemButton
                      onClick={() => handleStoreSelect(store)}
                      sx={{
                        display: 'flex',
                        gap: 4,
                        alignItems: 'center',
                        py: 3,
                        px: 3,
                        borderBottom: '1px solid',
                        borderColor: 'divider',
                        '&:hover': {
                          backgroundColor: 'action.hover',
                        },
                        ...(isSelected && {
                          backgroundColor: 'primary.50',
                          '&:hover': {
                            backgroundColor: 'primary.100',
                          },
                        }),
                      }}
                    >
                      {/* 選択状態インジケーター */}
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          border: '2px solid',
                          borderColor: isSelected ? 'primary.main' : 'grey.300',
                          backgroundColor: isSelected
                            ? 'primary.main'
                            : 'transparent',
                        }}
                      >
                        {isSelected && (
                          <CheckIcon
                            sx={{
                              color: 'white',
                              width: 16,
                              height: 16,
                            }}
                          />
                        )}
                      </Box>

                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        flex="1"
                      >
                        {/* 店舗名 */}
                        <Box
                          display="flex"
                          flexDirection="column"
                          flex={1}
                          alignItems="flex-start"
                        >
                          <Typography
                            sx={{
                              fontSize: '18px',
                              fontWeight: 'bold',
                              color: 'text.primary',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {store.display_name || ''}
                          </Typography>
                        </Box>

                        {/* 規約同意済みか */}
                        <Box
                          display="flex"
                          flexDirection="column"
                          alignItems="flex-start"
                        >
                          <Typography
                            sx={{
                              fontSize: '14px',
                              fontWeight: 'bold',
                              color: store.buy__is_assessed
                                ? 'primary.main'
                                : 'text.primary',
                            }}
                          >
                            {store.buy__is_assessed ? '査定完了' : '査定中'}
                          </Typography>
                        </Box>
                      </Box>
                    </ListItemButton>
                  </ListItem>
                );
              })}
            </List>
          </Box>

          {/* 次へボタン */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              mt: 4,
              pb: 4,
            }}
          >
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={!selectedStore}
              sx={{
                px: 6,
                py: 1.5,
                fontSize: '16px',
                fontWeight: 'bold',
                borderRadius: 3,
                minWidth: '200px',
              }}
            >
              次へ進む
            </Button>
          </Box>
        </Container>
      )}
    </Box>
  );
};
