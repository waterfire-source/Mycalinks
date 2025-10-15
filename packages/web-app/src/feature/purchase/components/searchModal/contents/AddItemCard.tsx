import React, { useMemo, useState } from 'react';
import { Typography } from '@mui/material';
import { SearchItemDetail } from '@/components/modals/searchModal/SearchDetail';
import { PurchaseSearchDetailContainer } from '@/feature/purchase/components/searchModal/PurchaseSearchDetailContainer';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { DetailCard } from '@/components/cards/DetailCard';
import { useAlert } from '@/contexts/AlertContext';
interface Props {
  selectedItem: SearchItemDetail | null;
  handleDetailsClose: () => void;
}

export const AddItemCard: React.FC<Props> = ({
  selectedItem,
  handleDetailsClose,
}) => {
  const [isAddClicked, setIsAddClicked] = useState<boolean>(false);
  const { setAlertState } = useAlert();
  const [onAddToCartDisabled, setOnAddToCartDisabled] = useState<boolean>(true);

  const content = useMemo(() => {
    if (selectedItem) {
      return (
        <PurchaseSearchDetailContainer
          item={selectedItem}
          isAddClicked={isAddClicked}
          setIsAddClicked={setIsAddClicked}
          setOnAddToCartDisabled={setOnAddToCartDisabled}
        />
      );
    }
    return (
      <Typography
        sx={{
          textAlign: 'center', // 水平中央
          justifyContent: 'center', // 垂直中央
        }}
      >
        商品を選択してください。
        <br />
        選択した商品の詳細がここに表示されます。
      </Typography>
    );
  }, [selectedItem, isAddClicked]);

  const bottomContent = useMemo(() => {
    return (
      <>
        <PrimaryButton
          variant="text"
          color="error"
          onClick={() => {
            handleDetailsClose();
            setOnAddToCartDisabled(true);
          }}
          data-testid="cancel-button"
          sx={{ padding: '8px 30px', fontSize: '12px' }}
        >
          キャンセル
        </PrimaryButton>
        <PrimaryButton
          variant="contained"
          color={'primary'}
          onClick={() => {
            setIsAddClicked(true);
            setAlertState({
              message: `${selectedItem?.display_name}を追加しました。`,
              severity: 'success',
            });
          }}
          disabled={onAddToCartDisabled}
          sx={{ padding: '8px 30px', fontSize: '12px' }}
          data-testid="add-to-cart-button"
        >
          追加
        </PrimaryButton>
      </>
    );
  }, [handleDetailsClose, onAddToCartDisabled, setAlertState]);

  return (
    <DetailCard
      title="追加する商品"
      content={content}
      bottomContent={bottomContent}
      containerSx={{
        width: '30%',
        flexGrow: 1, // 残りのスペースを埋める
        minHeight: 0, // flexbox の正しい動作のために必要
      }}
      dataTestId="product-detail-section"
      contentSx={{
        width: '100%',
        padding: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      bottomContentSx={{
        width: '100%',
        justifyContent: 'flex-end',
        paddingY: 1,
      }}
    />
  );
};
