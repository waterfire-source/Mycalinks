'use client';

import { Box, Typography, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Loader from '@/components/common/Loader';
import { ConfirmationDialog } from '@/components/dialogs/ConfirmationDialog';
import {
  QuantityModal,
  SignatureModal,
} from '@/app/mycalinks/(auth)/assessment/components/modals';
import { useAssessmentLogic } from '@/app/mycalinks/(auth)/assessment/hooks/useAssessmentLogic';
import { Store } from '@prisma/client';
import { TransactionCompletedScreen } from '@/app/mycalinks/(auth)/assessment/components/TransactionCompletedScreen';
import { AssessmentCompletedScreen } from '@/app/mycalinks/(auth)/assessment/components/AssessmentCompletedScreen';
import { AssessmentInProgressScreen } from '@/app/mycalinks/(auth)/assessment/components/AssessmentInProgressScreen';

interface AssessmentMainStepProps {
  selectedStore: Store;
  onBackToStoreSelect: () => void;
}

export const AssessmentMainStep = ({
  selectedStore,
  onBackToStoreSelect,
}: AssessmentMainStepProps) => {
  const {
    // 状態
    transactionInfo,
    selectedItem,
    modalVisible,
    signatureModalVisible,
    alertModalVisible,
    notifyInfo,
    // ハンドラー
    openModal,
    closeModal,
    handleConfirmSignature,
    handleConfirmAssessment,
    handleConfirmQuantityChange,
    // モーダル制御
    setAlertModalVisible,
  } = useAssessmentLogic(selectedStore.id);

  // 取引査定終了後に飛んでしまった場合の買取が完了しています画面
  if (
    !notifyInfo?.purchaseReception ||
    Object.keys(notifyInfo.purchaseReception).length === 0
  ) {
    return <TransactionCompletedScreen />;
  }

  if (notifyInfo?.purchaseReception?.id === 0) return <Loader />;

  return (
    <>
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
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* 店舗選択に戻るボタン */}
          <IconButton
            onClick={onBackToStoreSelect}
            sx={{
              position: 'absolute',
              left: 16,
              color: 'white',
              p: 1,
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography
            sx={{
              textAlign: 'center',
              fontWeight: 'bold',
              fontSize: '14px!important',
              color: 'white',
            }}
          >
            買取待ち状況
          </Typography>
        </Box>

        {/* 査定中または査定完了画面を表示するメインコンポーネント */}
        <Box
          sx={{
            width: '100%',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {!notifyInfo?.purchaseReception?.assessed ? (
            // 査定中
            <AssessmentInProgressScreen notifyInfo={notifyInfo} />
          ) : (
            // 査定完了
            <AssessmentCompletedScreen
              notifyInfo={notifyInfo}
              transactionInfo={transactionInfo}
              onQuantityChange={openModal}
              onConfirmAssessment={() => setAlertModalVisible(true)}
            />
          )}
        </Box>
      </Box>

      {/* 数量変更モーダル */}
      {selectedItem !== null && (
        <QuantityModal
          open={modalVisible}
          item={selectedItem}
          onClose={closeModal}
          onConfirm={handleConfirmQuantityChange}
        />
      )}

      {/* 枚数確定後のモーダル */}
      <ConfirmationDialog
        open={alertModalVisible}
        onClose={() => setAlertModalVisible(false)}
        onConfirm={handleConfirmAssessment}
        title="買取確認"
        message="査定確定後は枚数の変更ができません。よろしいですか？"
        confirmButtonText="署名に進む"
        isCancelButtonVisible={false}
      />

      {/* 署名モーダル */}
      <SignatureModal
        open={signatureModalVisible}
        onClose={() => {}} // 閉じれないように
        onConfirm={handleConfirmSignature}
        transactionInfo={transactionInfo}
      />
    </>
  );
};
