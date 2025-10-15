// レシートプリンターにコマンドを送信

import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { DeviceType } from '@prisma/client';
import { sendCommandToReceiptPrinterApi } from 'api-generator';
import { ApiEvent } from 'backend-core';

export const POST = BackendAPI.create(
  sendCommandToReceiptPrinterApi,
  async (API, { params, body }) => {
    const { store_id } = params;

    let { eposCommand } = body;

    //この店のレシートプリンターを取得
    const device = await API.db.device.findUnique({
      where: {
        store_id,
        store_id_type: {
          store_id,
          type: DeviceType.RECEIPT_PRINTER,
        },
      },
    });

    if (!device) throw new ApiError('notExist');

    //コマンドを送信する
    const apiEvent = new ApiEvent({
      type: 'receiptPrinterCommand',
      service: API,
      obj: {
        device_id: device.id,
        store_id,
        command: eposCommand,
      },
    });

    await apiEvent.emit();

    //最終利用日時を更新する
    await API.db.device.update({
      where: { id: device.id },
      data: { last_used_at: new Date() },
    });
  },
);
