import React, { useState, useMemo, useEffect } from 'react';
import { Modal, Box, Typography, Stack, Divider } from '@mui/material';
import { FaTimes } from 'react-icons/fa';
import PrimaryButtonWithIcon from '@/components/buttons/PrimaryButtonWithIcon';
import TertiaryButtonWithIcon from '@/components/buttons/TertiaryButtonWithIcon';
import NumericTextField from '@/components/inputFields/NumericTextField';
import { HelpIcon } from '@/components/common/HelpIcon';
import { type ProductSearchResult } from '@/feature/ec/stock/utils/unifyPricingUtils';

interface CardGroup {
  cardId: string; // item_myca_item_idベースのID
  displayName: string; // 表示用の名前（displayNameWithMeta）
  products: ProductSearchResult[];
  unifyTargetCount: number;
  unifyPrice: number | undefined;
}

interface Props {
  open: boolean;
  onClose: () => void;
  baseProducts: ProductSearchResult[];
  onConfirm: (unifyPricesByCard: { [cardId: string]: number }) => void;
  loading?: boolean;
  unifyTargetProducts?: ProductSearchResult[]; // 統一対象商品の配列を追加
  defaultPrices?: { [cardId: string]: number }; // デフォルト価格を追加
}

export const PriceUnificationConfirmModal: React.FC<Props> = ({
  open,
  onClose,
  baseProducts,
  onConfirm,
  loading = false,
  unifyTargetProducts = [],
  defaultPrices = {},
}) => {
  // カード別の統一価格を管理（cardIdベース）
  const [unifyPricesByCard, setUnifyPricesByCard] = useState<{
    [cardId: string]: number | undefined;
  }>({});

  // モーダルが開いた時にデフォルト価格を設定
  useEffect(() => {
    if (open && Object.keys(defaultPrices).length > 0) {
      setUnifyPricesByCard(defaultPrices);
    }
  }, [open, defaultPrices]);

  // カード別にグループ化
  const cardGroups = useMemo(() => {
    const groups: { [cardId: string]: CardGroup } = {};

    baseProducts.forEach((product) => {
      const cardId = String(product.item_myca_item_id || '不明');
      const displayName = String(product.displayNameWithMeta || '不明な商品');

      if (!groups[cardId]) {
        // 統一対象商品数を計算（同じcardIdの統一対象商品をカウント）
        const targetCountForCard = unifyTargetProducts.filter(
          (targetProduct) => {
            const targetCardId = String(
              targetProduct.item_myca_item_id || '不明',
            );
            return targetCardId === cardId;
          },
        ).length;

        groups[cardId] = {
          cardId,
          displayName,
          products: [],
          unifyTargetCount: targetCountForCard,
          unifyPrice: undefined,
        };
      }

      groups[cardId].products.push(product);
    });

    // 統一対象商品が1個以上のグループのみを返す
    return Object.values(groups).filter((group) => group.unifyTargetCount > 1);
  }, [baseProducts, unifyTargetProducts]);

  const handlePriceChange = (cardId: string, price: number | undefined) => {
    setUnifyPricesByCard((prev) => ({
      ...prev,
      [cardId]: price,
    }));
  };

  const handleConfirm = () => {
    const validPrices: { [cardId: string]: number } = {};

    // 価格が入力されているカードのみを対象とする
    Object.entries(unifyPricesByCard).forEach(([cardId, price]) => {
      if (price && price > 0) {
        validPrices[cardId] = price;
      }
    });

    if (Object.keys(validPrices).length > 0) {
      onConfirm(validPrices);
    }
  };

  // すべてのカードで価格が入力されているかチェック
  const isAllPricesValid = cardGroups.every((group) => {
    const price = unifyPricesByCard[group.cardId];
    return price && price > 0;
  });

  return (
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 700,
          maxWidth: '80%',
          maxHeight: '90%',
          overflow: 'auto',
          bgcolor: 'white',
          borderRadius: 2,
          boxShadow: 24,
          pt: 2,
          pr: 5,
          pl: 5,
          pb: 3,
        }}
      >
        {/* 閉じるボタン */}
        <FaTimes
          size={30}
          onClick={onClose}
          style={{
            position: 'absolute',
            right: '10px',
            top: '10px',
            color: 'grey.600',
            backgroundColor: 'white',
            cursor: 'pointer',
            borderRadius: '50%',
            padding: '5px',
          }}
        />

        {/* タイトル */}
        <Stack direction="row" alignItems="center" mb={3}>
          <Typography variant="h2" fontWeight="bold" color="primary.main">
            管理番号の異なる同じ商品の表示
          </Typography>
          <HelpIcon helpArchivesNumber={4512} />
        </Stack>

        {/* 説明文 */}
        <Typography variant="body2" sx={{ mb: 2 }}>
          同商品・同状態で異なる管理番号の商品を表示しようとしています。
          <br />
          お客様の混乱を避けるため、追加画像またはメモの設定をお願いします。
          <br />
          追加画像・メモの設定をしない場合は出品価格を統一してください。
          <br />
          ※すでに表示されている同条件の商品も設定した金額になります。ご注意ください。
        </Typography>

        {/* カード別統一価格入力 */}
        <Divider sx={{ my: 1 }} />
        <Stack spacing={2} sx={{ mb: 3 }}>
          {cardGroups.map((group) => (
            <Stack key={group.cardId} spacing={1}>
              <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                {group.displayName}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                対象商品: {group.unifyTargetCount}個
              </Typography>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography variant="body2" sx={{ minWidth: '120px' }}>
                  統一出品価格:
                </Typography>
                <NumericTextField
                  value={unifyPricesByCard[group.cardId]}
                  onChange={(value) => handlePriceChange(group.cardId, value)}
                  sx={{ width: '150px' }}
                  inputProps={{
                    min: 1,
                    max: 999999,
                  }}
                  InputProps={{
                    endAdornment: <Typography>円</Typography>,
                  }}
                  placeholder="価格を入力"
                />
              </Stack>
              {group !== cardGroups[cardGroups.length - 1] && (
                <Divider sx={{ mt: 1 }} />
              )}
            </Stack>
          ))}
        </Stack>

        {/* ボタン */}
        <Box display="flex" justifyContent="flex-end" gap={2}>
          <TertiaryButtonWithIcon onClick={onClose}>
            表示をやめる
          </TertiaryButtonWithIcon>
          <PrimaryButtonWithIcon
            loading={loading}
            onClick={handleConfirm}
            disabled={!isAllPricesValid}
          >
            金額を統一して表示
          </PrimaryButtonWithIcon>
        </Box>
      </Box>
    </Modal>
  );
};
