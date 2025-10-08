import { useAlert } from '@/contexts/AlertContext';
import { RegisterCheckTiming, TransactionPaymentMethod } from '@prisma/client';
import { useState } from 'react';
export interface RegisterForm {
  registerName: string;
  sellPaymentMethod: TransactionPaymentMethod[];
  buyPaymentMethod: TransactionPaymentMethod[];
  registerCheckTiming: RegisterCheckTiming;
  cashReset: boolean;
  resetAmount: number;
  autoPrintReceiptEnabled: boolean;
}
export const useRegisterForm = () => {
  const { setAlertState } = useAlert();
  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    registerName: '',
    sellPaymentMethod: [],
    buyPaymentMethod: [],
    registerCheckTiming: RegisterCheckTiming.BEFORE_CLOSE,
    cashReset: false,
    resetAmount: 0,
    autoPrintReceiptEnabled: true,
  });
  // レジ情報を作成する前に入力チェック
  const isValidate = () => {
    if (!registerForm.registerName) {
      setAlertState({
        message: 'レジ名を入力してください',
        severity: 'error',
      });
      return false;
    }
    if (registerForm.cashReset && registerForm.resetAmount === undefined) {
      setAlertState({
        message: 'リセット金額を入力してください',
        severity: 'error',
      });
      return false;
    }
    if (registerForm.sellPaymentMethod.length === 0) {
      setAlertState({
        message: '販売時支払い方法を選択してください',
        severity: 'error',
      });
      return false;
    }
    if (registerForm.buyPaymentMethod.length === 0) {
      setAlertState({
        message: '買取時支払い方法を選択してください',
        severity: 'error',
      });
      return false;
    }
    return true;
  };
  return { registerForm, setRegisterForm, isValidate };
};
