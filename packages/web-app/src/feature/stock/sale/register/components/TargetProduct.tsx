import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Divider,
  CircularProgress,
  Stack,
} from '@mui/material';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { styled } from '@mui/material/styles';
import { CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { useStore } from '@/contexts/StoreContext';
import { useCategory } from '@/feature/category/hooks/useCategory';
import { useGenre } from '@/feature/genre/hooks/useGenre';
import { SaleItem } from '@/app/auth/(dashboard)/stock/sale/register/page';
import { ProductList } from '@/feature/stock/sale/register/components/ProductList';
import { SaleRule } from '@prisma/client';
import { useSearchParams } from 'next/navigation';
import AlertConfirmationModal from '@/components/modals/AlertConfirmationModal';
import { useRouter } from 'next/navigation';
import { PATH } from '@/constants/paths';
import { ProductSelectModal } from '@/components/modals/sale/ProductSelectModal';
import { useSale } from '@/feature/stock/sale/hooks/useSale';
import { useConfirmationModal } from '@/contexts/ConfirmationModalContext';

// スタイル付きのButtonコンポーネント
const StyledButton = styled(Button)(({ theme }) => ({
  minWidth: '100px',
  '&.selected': {
    color: 'white',
    backgroundColor: theme.palette.grey[700],
    '&:hover': {
      backgroundColor: theme.palette.grey[800],
    },
  },
  '&:not(.selected)': {
    color: theme.palette.grey[800],
    backgroundColor: theme.palette.grey[200],
  },
}));

interface TargetProductProps {
  selectedSale: SaleItem;
  setSelectedSale: React.Dispatch<React.SetStateAction<SaleItem>>;
}

export const TargetProduct: React.FC<TargetProductProps> = ({
  selectedSale,
  setSelectedSale,
}) => {
  // コンテナの参照とリストの高さ管理
  const containerRef = useRef<HTMLDivElement>(null);
  const [productListHeight, setProductListHeight] = useState<number>(0);

  // カテゴリとジャンルの管理
  const { category, fetchCategoryList } = useCategory();
  const { genre, fetchGenreList } = useGenre();

  // ルーティング関連
  const router = useRouter();
  const searchParams = useSearchParams();
  const type = searchParams.get('type');
  const saleId = searchParams.get('id');
  const isCopy = searchParams.get('copy');

  // ローディング状態
  const [isLoading, setIsLoading] = useState(false);

  // アラートモーダル関連
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertType, setAlertType] = useState<'cancel' | 'change' | null>(null); // 破棄 or タイプ変更

  // 商品選択モーダル
  const [isProductSelectModalOpen, setIsProductSelectModalOpen] =
    useState(false);

  // API関連
  const { store } = useStore();
  const { setAlertState } = useAlert();
  const { createSale, updateSale } = useSale();

  // 選択モード
  const [mode] = useState<'byGenre' | 'individual'>(
    type === 'department' ? 'byGenre' : 'individual',
  );

  const [clickedMode, setClickedMode] = useState<
    'byGenre' | 'individual' | null
  >(null);

  // 選択状態の初期化と管理
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    selectedSale.departments.map((d) => String(d.itemGenreId)),
  );
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    selectedSale.departments.map((d) => String(d.itemCategoryId)),
  );

  // 高さを計算するための useEffect
  useEffect(() => {
    const calculateHeight = () => {
      setIsLoading(true);
      if (containerRef.current) {
        const containerHeight = containerRef.current.clientHeight;
        // ヘッダー(70px)、フッター(72px)、商品選択ヘッダー(70px),ボーダー(2px)は共通
        const commonHeight = 70 + 72 + 70 + 2;

        // ジャンル選択モードの場合はジャンルとカテゴリ(270px)を引く
        const modeSpecificHeight = mode === 'byGenre' ? 200 : 0;

        const calculatedHeight =
          containerHeight - (commonHeight + modeSpecificHeight);
        setProductListHeight(Math.max(calculatedHeight, 200));
        setIsLoading(false);
      }
      setIsLoading(false);
    };
    calculateHeight();
    window.addEventListener('resize', calculateHeight);
    window.visualViewport?.addEventListener('resize', calculateHeight);
    return () => {
      window.removeEventListener('resize', calculateHeight);
      window.visualViewport?.removeEventListener('resize', calculateHeight);
    };
  }, []);

  // 選択状態が変更されたときに SaleItem を更新
  useEffect(() => {
    if (mode === 'byGenre') {
      // ジャンルとカテゴリの組み合わせを作成し、重複を排除
      const combinations = selectedGenres.flatMap((genreId) =>
        selectedCategories.map((categoryId) => ({
          genreId: Number(genreId),
          categoryId: Number(categoryId),
          genreName:
            genre?.itemGenres.find((g) => String(g.id) === genreId)
              ?.display_name || '',
          categoryName:
            category?.itemCategories.find((c) => String(c.id) === categoryId)
              ?.display_name || '',
        })),
      );

      // 重複を排除するためのユニークキーを作成
      const uniqueCombinations = Array.from(
        new Map(
          combinations.map((item) => [
            `${item.genreId}-${item.categoryId}`,
            {
              rule: SaleRule.exclude,
              itemGenreId: item.genreId,
              itemGenreDisplayName: item.genreName,
              itemCategoryId: item.categoryId,
              itemCategoryDisplayName: item.categoryName,
            },
          ]),
        ).values(),
      );

      setSelectedSale((prev) => ({
        ...prev,
        departments: uniqueCombinations,
      }));
    }
  }, [selectedGenres, selectedCategories, mode, genre, category]);

  useEffect(() => {
    if (mode === 'byGenre') {
      fetchGenreList();
      fetchCategoryList();
    }
  }, [mode]);

  const handleCloseAlert = () => {
    setAlertType(null);
    setIsAlertOpen(false);
  };

  // 画面遷移確認モーダル表示の制御
  const { setModalVisible } = useConfirmationModal();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async () => {
    const validationErrors: string[] = [];

    if (!selectedSale.displayName) {
      validationErrors.push('セール名を入力してください');
    }
    if (!selectedSale.discountAmount) {
      validationErrors.push('割引額を入力してください');
    }
    if (!selectedSale.startDatetime) {
      validationErrors.push('開始日時を入力してください');
    }

    if (validationErrors.length > 0) {
      setAlertState({
        message: validationErrors.join('\n'),
        severity: 'error',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const id = !isCopy && saleId ? Number(saleId) : null;
      const body = {
        displayName: selectedSale.displayName,
        transactionKind: selectedSale.transactionKind,
        startDatetime: selectedSale.startDatetime,
        discountAmount: selectedSale.discountAmount,
        endDatetime: selectedSale.endDatetime,
        endTotalItemCount: selectedSale.endTotalItemCount,
        endUnitItemCount: selectedSale.endUnitItemCount,
        repeatCronRule: selectedSale.repeatCronRule,
        saleEndDatetime: selectedSale.saleEndDatetime,
        products: selectedSale.products.map((p) => ({
          productId: p.productId,
          rule: type === 'department' ? SaleRule.exclude : SaleRule.include,
        })),
        departments:
          type === 'department'
            ? selectedSale.departments.map((d) => ({
                itemCategoryId: d.itemCategoryId,
                itemGenreId: d.itemGenreId,
                rule: SaleRule.include,
              }))
            : [],
        onPause: selectedSale.onPause,
      };

      let result;
      if (id) {
        // 編集
        result = await updateSale({
          storeID: store.id,
          body: {
            ...body,
            id: id,
          },
        });
      } else {
        // 作成
        result = await createSale({
          storeID: store.id,
          body,
        });
      }
      setModalVisible(false);
      if (result instanceof CustomError) return;
      router.push(PATH.STOCK.sale.root);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmAction = () => {
    if (alertType === 'cancel') {
      router.push(PATH.STOCK.sale.root);
    } else if (alertType === 'change') {
      const newSearchParams = new URLSearchParams(searchParams);
      const newType = clickedMode === 'byGenre' ? 'department' : 'item';
      newSearchParams.set('type', newType);
      const newPath = `${
        PATH.STOCK.sale.register
      }?${newSearchParams.toString()}`;
      window.location.href = newPath;
    }
  };

  return (
    <Stack height="100%" overflow="auto">
      <Box
        ref={containerRef}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* ヘッダー */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            p: 2,
            height: '70px',
          }}
        >
          <Typography variant="h2">対象商品</Typography>
          <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
            <StyledButton
              variant="contained"
              className={mode === 'byGenre' ? 'selected' : ''}
              onClick={() => {
                if (mode !== 'byGenre') {
                  setAlertType('change');
                  setClickedMode('byGenre');
                  setIsAlertOpen(true);
                }
              }}
              size="small"
            >
              ジャンル・カテゴリを指定して作成
            </StyledButton>
            <StyledButton
              variant="contained"
              className={mode === 'individual' ? 'selected' : ''}
              onClick={() => {
                if (mode !== 'individual') {
                  setAlertType('change');
                  setClickedMode('individual');
                  setIsAlertOpen(true);
                }
              }}
              size="small"
            >
              対象商品を個別に選択して作成
            </StyledButton>
          </Box>
        </Box>
        <Divider />
        {mode === 'byGenre' && (
          <Box
            sx={{
              p: 2,
              pr: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 1,
              // height: '240px',
            }}
          >
            {/* ジャンル選択 */}
            <Box>
              <Typography variant="body1" sx={{ mb: 1 }}>
                ジャンル
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  overflowX: 'auto',
                  whiteSpace: 'nowrap',
                  pb: 1, // Add padding to show scrollbar
                }}
              >
                {!genre ? (
                  <CircularProgress />
                ) : (
                  genre.itemGenres.map((g) => (
                    <StyledButton
                      key={g.id}
                      className={
                        selectedGenres.includes(String(g.id)) ? 'selected' : ''
                      }
                      onClick={() => {
                        setSelectedGenres((prev) =>
                          prev.includes(String(g.id))
                            ? prev.filter((id) => id !== String(g.id))
                            : [...prev, String(g.id)],
                        );
                      }}
                      sx={{
                        borderRadius: '20px',
                        px: 2,
                        py: 1,
                        flexShrink: 0, // Prevent buttons from shrinking
                      }}
                    >
                      {g.display_name}
                    </StyledButton>
                  ))
                )}
              </Box>
            </Box>

            {/* カテゴリ選択 */}
            <Box>
              <Typography variant="body1" sx={{ mb: 1 }}>
                カテゴリ
              </Typography>
              <Box
                sx={{
                  display: 'flex',
                  gap: 1,
                  overflowX: 'auto',
                  whiteSpace: 'nowrap',
                }}
              >
                {!category ? (
                  <CircularProgress />
                ) : (
                  category.itemCategories.map((c) => (
                    <StyledButton
                      key={c.id}
                      className={
                        selectedCategories.includes(String(c.id))
                          ? 'selected'
                          : ''
                      }
                      onClick={() => {
                        setSelectedCategories((prev) =>
                          prev.includes(String(c.id))
                            ? prev.filter((id) => id !== String(c.id))
                            : [...prev, String(c.id)],
                        );
                      }}
                      sx={{
                        borderRadius: '20px',
                        px: 2,
                        py: 1,
                        flexShrink: 0,
                      }}
                    >
                      {c.display_name}
                    </StyledButton>
                  ))
                )}
              </Box>
            </Box>
          </Box>
        )}
        {/* 商品選択 */}
        <Box
          sx={{
            pl: 3,
            pr: 3,
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              height: '80px',
            }}
          >
            {mode === 'byGenre' && (
              <Typography variant="h2" sx={{ mb: 'auto', mt: 'auto' }}>
                除外商品
              </Typography>
            )}
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
                overflowX: 'auto',
                whiteSpace: 'nowrap',
              }}
            >
              <PrimaryButton
                variant="contained"
                sx={{
                  px: 2,
                  py: 1,
                  flexShrink: 0,
                  backgroundColor: 'grey.300',
                  color: 'grey.800',
                  '&:hover': {
                    backgroundColor: 'grey.500',
                  },
                  mb: 'auto',
                  mt: 'auto',
                }}
                onClick={() => {
                  setIsProductSelectModalOpen(true);
                }}
                size="small"
              >
                {mode === 'byGenre' ? '除外商品の選択' : '対象商品の選択'}
              </PrimaryButton>
            </Box>
            <Box sx={{ flex: 1 }} />
            <Typography variant="h2" sx={{ mb: 'auto', mt: 'auto' }}>
              {selectedSale.products.length}商品
            </Typography>
          </Box>
        </Box>
        <Divider />
        {isLoading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <ProductList
            selectedSale={selectedSale}
            setSelectedSale={setSelectedSale}
            sx={{
              height: `${productListHeight}px`,
              overflow: 'auto',
            }}
          />
        )}
      </Box>
      <Stack
        direction="row"
        sx={{
          p: 2,
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 2,
          borderTop: 1,
          borderColor: 'divider',
          height: '72px',
        }}
      >
        <PrimaryButton
          variant="text"
          color="primary"
          onClick={() => {
            setIsAlertOpen(true);
            setAlertType('cancel');
          }}
        >
          {!isCopy && saleId ? '編集をやめる' : '作成をやめる'}
        </PrimaryButton>
        <PrimaryButton
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          loading={isSubmitting}
        >
          {!isCopy && saleId ? '編集' : '作成'}
        </PrimaryButton>
      </Stack>
      <AlertConfirmationModal
        isOpen={isAlertOpen}
        onClose={handleCloseAlert}
        onConfirm={handleConfirmAction}
        message={'編集内容が破棄されます。よろしいですか？'}
        confirmButtonText={'破棄'}
        cancelButtonText="キャンセル"
      />
      <ProductSelectModal
        open={isProductSelectModalOpen}
        onClose={() => setIsProductSelectModalOpen(false)}
        saleRule={type === 'department' ? SaleRule.exclude : SaleRule.include}
        selectedSale={selectedSale}
        setSelectedSale={setSelectedSale}
      />
    </Stack>
  );
};
