import { CustomError } from '@/api/implement';
import { useAddOriginalPack } from '@/app/auth/(dashboard)/original-pack/create/components/confirm/hooks/useAddOriginalPack';
import { useCreateOriginalPack } from '@/app/auth/(dashboard)/original-pack/create/components/confirm/hooks/useCreateOriginalPack';
import { useSaveLocalStorageOriginalPack } from '@/app/auth/(dashboard)/original-pack/create/components/confirm/hooks/useSaveLocalStorageOriginalPack';
import { useEnclosedProductContext } from '@/app/auth/(dashboard)/original-pack/create/context/EnclosedProductContext';
import { OriginalPackItemType } from '@/app/auth/(dashboard)/original-pack/page';
import { CancelButton } from '@/components/buttons/CancelButton';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import { DetailCard } from '@/components/cards/DetailCard';
import { ImagePicker } from '@/components/cards/ImagePicker';
import NumericTextField from '@/components/inputFields/NumericTextField';
import { RequiredTitle } from '@/components/inputFields/RequiredTitle';
import { PATH } from '@/constants/paths';
import { ItemImage } from '@/feature/item/components/ItemImage';
import { CategorySelect } from '@/feature/item/components/select/CategorySelect';
import { GenreSelect } from '@/feature/item/components/select/GenreSelect';
import { Box, Stack, styled, TextField, Typography } from '@mui/material';
import { ItemCategoryHandle } from '@prisma/client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

interface Props {
  onBack: () => void;
}

export const OriginalPackConfirmDetailCard = ({ onBack }: Props) => {
  //補充機能の有無を判定
  const searchParams = useSearchParams();
  const isReplenishment = searchParams.get('replenishment') === 'true';
  const id = searchParams.get('id');
  const [selectedOriginalPack, setSelectedOriginalPack] =
    useState<OriginalPackItemType | null>(null);

  //補充、またはオリパ編集の場合、選択されたオリパ・福袋の情報をローカルから取得
  useEffect(() => {
    if (!(isReplenishment || id)) return;
    try {
      const info = localStorage.getItem('productInfo');
      if (info) {
        const productInfo: OriginalPackItemType = JSON.parse(info);
        setSelectedOriginalPack(productInfo);
        localStorage.removeItem('productInfo');
      }
    } catch (e) {
      console.error('productInfo の読み込みに失敗', e);
    }
  }, []);

  //補充のアクション機能
  const {
    form,
    handleAdditionalStockNumberChange,
    addOriginalPack,
    isLoading: isAddLoading,
  } = useAddOriginalPack(selectedOriginalPack?.id ?? 0);

  const {
    originalPack,
    setOriginalPack,
    handleNameChange,
    handleInitStockNumberChange,
    handleSellPriceChange,
    handleGenreChange,
    handleCategoryChange,
    createOriginalPack,
    handleImageUploaded,
    isLoading,
  } = useCreateOriginalPack();
  const { totalWholesalePrice, totalSellPrice } = useEnclosedProductContext();

  const { push } = useRouter();
  const { clearLocalStorageItem } = useSaveLocalStorageOriginalPack();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // 補充機能
      if (isReplenishment) {
        if (isAddLoading) return;
        await addOriginalPack(() => push(PATH.ORIGINAL_PACK.root));
        return;
      } else if (id) {
        // 編集機能
        if (isLoading) return;
        await createOriginalPack(
          () => push(PATH.ORIGINAL_PACK.root),
          false,
          Number(id),
        );
      } else {
        // 新規作成機能
        if (isLoading) return;
        await createOriginalPack(() => push(PATH.ORIGINAL_PACK.root));
      }
      // ローカルストレージからoriginalPackProductsを削除
      clearLocalStorageItem();
    } finally {
      setIsSubmitting(false);
    }
  };
  // 還元率
  const redemptionRate = useMemo(() => {
    // 作成後の販売額合計
    const numerator =
      isReplenishment && selectedOriginalPack
        ? selectedOriginalPack.sell_price * form.additionalStockNumber
        : originalPack.sellPrice * originalPack.initStockNumber;
    if (numerator === 0) return 0;
    return (totalSellPrice / numerator) * 100;
  }, [
    originalPack,
    totalSellPrice,
    form.additionalStockNumber,
    isReplenishment,
    selectedOriginalPack,
  ]);
  // 原価率
  const wholesaleRate = useMemo(() => {
    const numerator =
      isReplenishment && selectedOriginalPack
        ? selectedOriginalPack.sell_price * form.additionalStockNumber
        : originalPack.sellPrice * originalPack.initStockNumber;
    if (numerator === 0) return 0;
    return (totalWholesalePrice / numerator) * 100;
  }, [
    originalPack,
    totalWholesalePrice,
    form.additionalStockNumber,
    isReplenishment,
    selectedOriginalPack,
  ]);

  // 一時保存ハンドラ
  const handleDraftSave = async () => {
    // 編集の場合はidを送って更新処理
    const res = await createOriginalPack(
      () => push(PATH.ORIGINAL_PACK.root),
      true,
      id ? Number(id) : undefined,
      true,
    );
    if (res instanceof CustomError) {
      console.error(res);
      return;
    } else {
      // ローカルストレージからoriginalPackProductsを削除
      clearLocalStorageItem();
    }
  };

  // オリパ編集中の場合、初期値はselectedOriginalPackから取得
  useEffect(() => {
    if (id) {
      setOriginalPack({
        displayName: selectedOriginalPack?.display_name ?? '',
        initStockNumber: selectedOriginalPack?.init_stock_number ?? 0,
        sellPrice: selectedOriginalPack?.sell_price ?? 0,
        genreId: selectedOriginalPack?.genre_id ?? null,
        categoryId: selectedOriginalPack?.category_id ?? null,
        imageUrl: selectedOriginalPack?.image_url ?? null,
      });
    }
  }, [id, selectedOriginalPack, setOriginalPack]);

  // 補充、または一時中断オリパ編集の場合、戻るボタンでオリパ情報を再びローカル保存
  const handleSaveAndBack = () => {
    if (!(isReplenishment || id)) return;
    localStorage.setItem('productInfo', JSON.stringify(selectedOriginalPack));
    onBack();
  };

  const detailCardTitle = useMemo(() => {
    if (isReplenishment) {
      return 'オリパ・福袋・デッキ補充詳細';
    } else if (id) {
      return 'オリパ・福袋・デッキ編集詳細';
    } else {
      return 'オリパ・福袋・デッキ作成詳細';
    }
  }, [isReplenishment, id]);

  return (
    <DetailCard
      title={detailCardTitle}
      content={
        <Stack gap={2}>
          <Stack direction="row" gap={5}>
            <DetailCardItem>
              <Typography>仕入れ値合計</Typography>
              <Typography>{totalWholesalePrice.toLocaleString()}円</Typography>
            </DetailCardItem>
            <DetailCardItem>
              <Typography>販売価格合計</Typography>
              <Typography>{totalSellPrice.toLocaleString()}円</Typography>
            </DetailCardItem>
          </Stack>
          <DetailCardItem>
            <Typography>商品画像</Typography>
            <Stack direction="row" gap={1}>
              <Box sx={{ width: 60, height: 80 }}>
                <ItemImage
                  imageUrl={
                    isReplenishment
                      ? selectedOriginalPack?.image_url ?? null
                      : originalPack.imageUrl
                  }
                  height={80}
                />
              </Box>
              {isReplenishment ? undefined : (
                <ImagePicker
                  kind="product"
                  onImageUploaded={(url: string | null) =>
                    handleImageUploaded(url)
                  }
                />
              )}
            </Stack>
          </DetailCardItem>
          <DetailCardItem>
            <Stack direction="row" gap={1}>
              <RequiredTitle title="商品名" />
            </Stack>
            <TextField
              size="small"
              value={
                isReplenishment
                  ? selectedOriginalPack?.display_name
                  : originalPack.displayName
              }
              onChange={handleNameChange}
              placeholder="商品名"
              sx={{ width: 200 }}
              disabled={isReplenishment}
            />
          </DetailCardItem>
          <DetailCardItem>
            <RequiredTitle title="ジャンル" />
            <GenreSelect
              selectedGenreId={
                isReplenishment
                  ? selectedOriginalPack?.genre_id
                  : originalPack.genreId
              }
              onSelect={handleGenreChange}
              sx={{ width: '50%' }}
              disabled={isReplenishment}
            />
          </DetailCardItem>
          <DetailCardItem>
            <RequiredTitle title="カテゴリ" />
            <CategorySelect
              selectedCategoryId={
                isReplenishment
                  ? selectedOriginalPack?.category_id
                  : originalPack.categoryId
              }
              onSelect={handleCategoryChange}
              sx={{ width: '50%' }}
              filterCategoryHandles={[
                ItemCategoryHandle.ORIGINAL_PACK,
                ItemCategoryHandle.LUCKY_BAG,
                ItemCategoryHandle.DECK,
              ]}
              disabled={isReplenishment}
            />
          </DetailCardItem>
          <DetailCardItem>
            <RequiredTitle title="商品単価" />
            <NumericTextField
              value={
                isReplenishment
                  ? selectedOriginalPack?.sell_price
                  : originalPack.sellPrice
              }
              onChange={(value) => handleSellPriceChange(value)}
              placeholder="商品単価"
              sx={{ width: 200 }}
              noSpin
              disabled={isReplenishment}
            />
          </DetailCardItem>
          <DetailCardItem>
            <RequiredTitle title="作成数" />
            <NumericTextField
              value={
                isReplenishment
                  ? form.additionalStockNumber
                  : originalPack.initStockNumber
              }
              onChange={
                isReplenishment
                  ? (value) => handleAdditionalStockNumberChange(value)
                  : (value) => handleInitStockNumberChange(value)
              }
              min={isReplenishment ? 1 : 0}
              placeholder="作成数"
              sx={{ width: 200 }}
            />
          </DetailCardItem>
          <DetailCardItem>
            <Stack direction="row" gap={1} alignItems="center">
              <Typography>還元率</Typography>
              <Typography variant="caption">
                (封入商品の販売額合計 / 作成後の販売額合計)
              </Typography>
            </Stack>
            <Stack direction="row" gap={1} alignItems="center">
              <Typography>
                {isNaN(redemptionRate) ? '-' : redemptionRate.toFixed(2)}％
              </Typography>
              <Typography variant="caption">
                {isReplenishment && selectedOriginalPack
                  ? `(${totalSellPrice.toLocaleString()}円 / ${(
                      selectedOriginalPack.sell_price *
                      form.additionalStockNumber
                    ).toLocaleString()}円 )`
                  : `( ${totalSellPrice.toLocaleString()}円 / ${(
                      originalPack.sellPrice * originalPack.initStockNumber
                    ).toLocaleString()}円 )`}
              </Typography>
            </Stack>
            <Stack direction="row" gap={1} alignItems="center">
              <Typography>原価率</Typography>
              <Typography variant="caption">
                (封入商品の仕入れ値の合計 / 作成後の販売額合計)
              </Typography>
            </Stack>
            <Stack direction="row" gap={1} alignItems="center">
              <Typography>
                {isNaN(wholesaleRate) ? '-' : wholesaleRate.toFixed(2)}％
              </Typography>
              <Typography variant="caption">
                {isReplenishment && selectedOriginalPack
                  ? `(${totalWholesalePrice.toLocaleString()}円 / ${(
                      selectedOriginalPack.sell_price *
                      form.additionalStockNumber
                    ).toLocaleString()}円 )`
                  : `( ${totalWholesalePrice.toLocaleString()}円 / ${(
                      originalPack.sellPrice * originalPack.initStockNumber
                    ).toLocaleString()}円 )`}
              </Typography>
            </Stack>
          </DetailCardItem>
        </Stack>
      }
      // bottomContentSx={{
      //   height: '120px',
      // }}
      bottomContent={
        <Stack
          direction="row"
          gap={1}
          width="100%"
          justifyContent="space-between"
        >
          <Box display="flex" gap={1}>
            <SecondaryButton
              variant="contained"
              onClick={() => {
                push(PATH.ORIGINAL_PACK.root);
                clearLocalStorageItem();
              }}
            >
              {isReplenishment ? '補充内容を破棄' : '作成内容を破棄'}
            </SecondaryButton>
            {!isReplenishment && (
              <SecondaryButton variant="contained" onClick={handleDraftSave}>
                一時保存
              </SecondaryButton>
            )}
          </Box>
          <Stack direction="row" gap={1}>
            <CancelButton
              onClick={isReplenishment || id ? handleSaveAndBack : onBack}
            >
              {isReplenishment
                ? '補充商品の登録に戻る'
                : '封入商品の登録に戻る'}
            </CancelButton>
            <PrimaryButton loading={isSubmitting} onClick={handleSubmit}>
              {isReplenishment ? '補充' : '作成'}
            </PrimaryButton>
          </Stack>
        </Stack>
      }
    />
  );
};

const DetailCardItem = styled(Stack)({
  gap: 4,
});
