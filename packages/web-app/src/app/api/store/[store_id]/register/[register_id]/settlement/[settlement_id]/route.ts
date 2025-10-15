import { BackendAPI } from '@/api/backendApi/main';
import { getRegisterSettlementDef } from '@/app/api/store/[store_id]/register/def';

import { RegisterSettlementKind } from '@prisma/client';
import { BackendApiRegisterService } from '@/api/backendApi/services/register/main';

//レジ精算の情報取得（精算レシートなど用）
export const GET = BackendAPI.defineApi(
  getRegisterSettlementDef,
  async (API, { params }) => {
    const { store_id, register_id, settlement_id } = params;
    const thisRegister = new BackendApiRegisterService(API, register_id);

    const thisRegisterInfo = await thisRegister.core.existingObj;

    const { settlementInfo, receiptCommand } =
      await thisRegister.createSettlementReceipt(settlement_id);

    let closeReceiptCommand: string | null = null;

    //メインレジ、かつ閉店精算だった場合はそのレシートも
    if (
      thisRegisterInfo.is_primary &&
      settlementInfo.kind == RegisterSettlementKind.CLOSE
    ) {
      const res = await thisRegister.createSettlementReceipt(
        settlement_id,
        true,
      );
      closeReceiptCommand = res.receiptCommand;
    }

    return {
      settlementInfo,
      receiptCommand,
      closeReceiptCommand,
    };
  },
);
