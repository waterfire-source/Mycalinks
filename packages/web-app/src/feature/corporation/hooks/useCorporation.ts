import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import { useCallback, useMemo, useState } from 'react';
import { Corporation } from '@prisma/client';

export type CorporationType = {
  id: Corporation['id']; // 法人ID
  name: Corporation['name']; // 法人名
  ceo_name: Corporation['ceo_name']; // 代表者名
  head_office_address: Corporation['head_office_address']; // 本社住所
  phone_number: Corporation['phone_number']; // 電話番号
  kobutsusho_koan_iinkai: Corporation['kobutsusho_koan_iinkai']; // 古物商公安委員会名
  kobutsusho_number: Corporation['kobutsusho_number']; // 古物商許可番号
  invoice_number: Corporation['invoice_number']; //インボイス番号
  zip_code: Corporation['zip_code']; //郵便番号
  square_available: Corporation['square_available']; //スクエア連携済みかどうか

  //以下、ストアデフォルト
  tax_mode: Corporation['tax_mode']; //内税か外税か
  price_adjustment_round_rule: Corporation['price_adjustment_round_rule']; //丸め方
  price_adjustment_round_rank: Corporation['price_adjustment_round_rank']; //丸める桁
  use_wholesale_price_order_column: Corporation['use_wholesale_price_order_column']; //仕入れ値使う時の順番
  use_wholesale_price_order_rule: Corporation['use_wholesale_price_order_rule']; //仕入れ値使う時の順番のやつ
  wholesale_price_keep_rule: Corporation['wholesale_price_keep_rule']; //仕入れ値保持ルール（個別or平均値）
};

export const useCorporation = () => {
  const clientAPI = useMemo(() => createClientAPI(), []);
  const { setAlertState } = useAlert();
  // 法人のstate
  const [corporation, setCorporation] = useState<CorporationType | undefined>(
    undefined,
  );

  // stateを初期化
  const resetCorporation = () => setCorporation(undefined);

  // 法人情報を取得してstateに保存
  const fetchCorporation = useCallback(
    async (isReturn = false) => {
      //返信する場合
      const res = await clientAPI.corporation.getCorporation();
      // エラー時はアラートを出して早期return
      if (res instanceof CustomError) {
        console.error('法人情報の取得に失敗しました。');
        setAlertState({
          message: `${res.status}:${res.message}`,
          severity: 'error',
        });
        return;
      }
      setCorporation(res.corporation);
      if (isReturn) {
        return res.corporation;
      }
    },
    [clientAPI.corporation, setAlertState],
  );

  return {
    corporation,
    resetCorporation,
    fetchCorporation,
  };
};
