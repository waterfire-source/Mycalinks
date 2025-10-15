'use client';
import { useState, useEffect } from 'react';
import { Box, Typography, Button } from '@mui/material';
import { CommonModal } from '@/app/ec/(core)/components/modals/CommonModal';
import { PaymentMethodSelect } from '@/app/ec/(core)/feature/order/PaymentMethodSelect';
import { ConvenienceStoreSelect } from '@/app/ec/(core)/feature/order/ConvenienceStoreSelect';
import { EcPaymentMethod, Gmo_Credit_Card } from '@prisma/client';
import { paymentMethods } from '@/app/ec/(core)/constants/payment';
import {
  ConvenienceCode,
  CONVENIENCE_MAP,
} from '@/app/ec/(core)/constants/convenience';
import { CreditCardSelect } from '@/app/ec/(core)/feature/order/CreditCardList';
import { useEcCreditCard } from '@/app/ec/(core)/hooks/useEcCreditCard';

// 支払いステップを表すenum
enum PaymentStepEnum {
  SELECT = 'select',
  CREDIT_INPUT = 'credit-input',
  CONVENIENCE_STORE = 'convenience-store',
  BANK_TRANSFER = 'bank-transfer',
}

interface PaymentMethodManagerProps {
  onPaymentMethodConfirm: (
    method: EcPaymentMethod,
    cardId?: Gmo_Credit_Card['id'],
    cardLast4?: string,
    convenienceCode?: ConvenienceCode,
  ) => void;
  paymentMethodCandidates: EcPaymentMethod[];
  cardLast4?: string | null;
  convenienceCode?: ConvenienceCode | null;
  initialPaymentMethod?: EcPaymentMethod | null;
}

export const PaymentMethodManager = ({
  onPaymentMethodConfirm,
  paymentMethodCandidates,
  cardLast4,
  convenienceCode,
  initialPaymentMethod,
}: PaymentMethodManagerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  // 確定済みの支払い方法
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<EcPaymentMethod | null>(initialPaymentMethod || null);
  const [paymentMethodLabel, setPaymentMethodLabel] = useState('未選択');

  // モーダル内での一時的な選択状態
  const [tempSelectedPaymentMethod, setTempSelectedPaymentMethod] =
    useState<EcPaymentMethod | null>(null);

  const [currentStep, setCurrentStep] = useState<PaymentStepEnum>(
    PaymentStepEnum.SELECT,
  );

  // クレジットカード取得
  const { fetchCreditCardList, creditCardList } = useEcCreditCard();

  useEffect(() => {
    setCurrentStep(PaymentStepEnum.SELECT);
  }, [isOpen]);

  // 初期表示時に決済方法が設定されている場合はラベルを更新
  useEffect(() => {
    if (initialPaymentMethod) {
      const selectedMethod = paymentMethods.find(
        (m) => m.value === initialPaymentMethod,
      );
      if (selectedMethod) {
        setSelectedPaymentMethod(initialPaymentMethod);
        setPaymentMethodLabel(selectedMethod.label);

        // クレジットカードが選択されている場合、カード情報を取得
        if (initialPaymentMethod === EcPaymentMethod.CARD) {
          fetchCreditCardList();
        }
      }
    } else {
      // initialPaymentMethodがnullの場合は未選択状態にリセット
      setSelectedPaymentMethod(null);
      setPaymentMethodLabel('未選択');
    }
  }, [initialPaymentMethod, fetchCreditCardList]);

  // クレジットカードリストが取得できたら、最初のカードで自動確定
  useEffect(() => {
    if (
      initialPaymentMethod === EcPaymentMethod.CARD &&
      creditCardList.length > 0 &&
      !cardLast4 // まだカードが選択されていない場合のみ
    ) {
      const firstCard = creditCardList[0];
      const last4 = firstCard.masked_card_number.slice(-4);

      // confirmPaymentMethodを直接呼ぶ代わりに、同じ処理を実行
      setSelectedPaymentMethod(EcPaymentMethod.CARD);
      const selectedMethod = paymentMethods.find(
        (m) => m.value === EcPaymentMethod.CARD,
      );
      if (selectedMethod) {
        setPaymentMethodLabel(selectedMethod.label);
      }
      onPaymentMethodConfirm(EcPaymentMethod.CARD, firstCard.id, last4);
    }
  }, [initialPaymentMethod, creditCardList, cardLast4, onPaymentMethodConfirm]);

  // 一時的な選択状態の変更（確定前）
  const handleTempPaymentMethodChange = (method: EcPaymentMethod | null) => {
    setTempSelectedPaymentMethod(method);
  };

  // 支払い方法を確定する関数
  const confirmPaymentMethod = (
    method: EcPaymentMethod,
    cardId?: Gmo_Credit_Card['id'],
    cardLast4?: string,
    convenienceCode?: ConvenienceCode,
  ) => {
    setSelectedPaymentMethod(method);
    const selectedMethod = paymentMethods.find((m) => m.value === method);
    if (selectedMethod) {
      setPaymentMethodLabel(selectedMethod.label);
    }
    onPaymentMethodConfirm(method, cardId, cardLast4, convenienceCode);
  };

  const handleModalClose = () => {
    setIsOpen(false);
    setCurrentStep(PaymentStepEnum.SELECT);
    // 一時的な選択状態を確定済みの状態にリセット
    setTempSelectedPaymentMethod(selectedPaymentMethod);
  };

  const handleModalOpen = () => {
    setIsOpen(true);
    // モーダルを開いた時に、一時的な選択状態を現在の確定状態で初期化
    setTempSelectedPaymentMethod(selectedPaymentMethod);
  };

  const getModalTitle = () => {
    switch (currentStep) {
      case PaymentStepEnum.SELECT:
        return 'お支払い方法選択';
      case PaymentStepEnum.CREDIT_INPUT:
        return 'クレジットカード情報入力';
      case PaymentStepEnum.CONVENIENCE_STORE:
        return 'コンビニ決済';
      default:
        return '';
    }
  };

  // 支払い方法選択時のステップ切り替え
  const handlePaymentMethodNext = () => {
    switch (tempSelectedPaymentMethod) {
      // クレジットカードは別モーダルで入力
      case EcPaymentMethod.CARD:
        setCurrentStep(PaymentStepEnum.CREDIT_INPUT);
        break;
      // コンビニ決済は別モーダルで選択
      case EcPaymentMethod.CONVENIENCE_STORE:
        setCurrentStep(PaymentStepEnum.CONVENIENCE_STORE);
        break;
      // その他の支払い方法は即座に確定
      default:
        if (tempSelectedPaymentMethod) {
          confirmPaymentMethod(tempSelectedPaymentMethod);
        }
        setIsOpen(false);
    }
  };

  // クレジットカード情報入力フォームの送信
  const handleCreditCardFormSubmit = (
    cardId: Gmo_Credit_Card['id'],
    cardLast4: string,
  ) => {
    if (tempSelectedPaymentMethod) {
      confirmPaymentMethod(tempSelectedPaymentMethod, cardId, cardLast4);
    }
    setIsOpen(false);
  };

  // コンビニ選択の確定
  const handleConvenienceStoreConfirm = (convenienceCode: ConvenienceCode) => {
    if (tempSelectedPaymentMethod) {
      confirmPaymentMethod(
        tempSelectedPaymentMethod,
        undefined,
        undefined,
        convenienceCode,
      );
    }
    setIsOpen(false);
  };

  // 前のステップに戻る
  const handleBack = () => {
    setCurrentStep(PaymentStepEnum.SELECT);
  };

  return (
    <Box>
      {paymentMethodLabel != '未選択' && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
          <Typography variant="body1">お支払い方法：</Typography>
          <Typography variant="body1">
            {paymentMethodLabel}
            {cardLast4 && ` : ${cardLast4}`}
            {convenienceCode && ` : ${CONVENIENCE_MAP[convenienceCode]}`}
          </Typography>
        </Box>
      )}
      <Box>
        {paymentMethodLabel == '未選択' && (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              size="small"
              sx={{ width: '100%', maxWidth: '250px', m: 1 }}
              onClick={handleModalOpen}
            >
              お支払い方法を選択する
            </Button>
          </Box>
        )}
        {paymentMethodLabel != '未選択' && (
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button
              variant="text"
              color="primary"
              size="small"
              sx={{ textDecoration: 'underline', fontSize: '0.6rem' }}
              onClick={handleModalOpen}
            >
              お支払い方法を変更する
            </Button>
          </Box>
        )}
      </Box>
      <CommonModal
        isOpen={isOpen}
        onClose={handleModalClose}
        title={getModalTitle()}
      >
        {currentStep === PaymentStepEnum.SELECT ? (
          <PaymentMethodSelect
            selectedMethod={tempSelectedPaymentMethod}
            onMethodChange={handleTempPaymentMethodChange}
            onNext={handlePaymentMethodNext}
            paymentMethodCandidates={paymentMethodCandidates}
          />
        ) : currentStep === PaymentStepEnum.CREDIT_INPUT ? (
          <CreditCardSelect
            onConfirm={handleCreditCardFormSubmit}
            onBack={handleBack}
          />
        ) : currentStep === PaymentStepEnum.CONVENIENCE_STORE ? (
          <ConvenienceStoreSelect
            onConfirm={handleConvenienceStoreConfirm}
            onBack={handleBack}
          />
        ) : null}
      </CommonModal>
    </Box>
  );
};
