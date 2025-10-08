import { apiRole, BackendAPI } from '@/api/backendApi/main';
import { type apiPrivilegesType } from '@/types/BackendAPI';
import { Stocking, StockingStatus } from '@prisma/client';
import { type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendApiStoreShipmentService } from '@/api/backendApi/services/store-shipment/main';

//IDを指定することでキャンセルができる
//出荷が紐づいている入荷だった場合、キャンセルすると同時に出荷の方もキャンセルされる

export const POST = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [apiRole.pos], //アカウントの種類がuserなら権限に関わらず実行できる
        policies: [], //実行に必要なポリシー
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);

    const { store_id, stocking_id } = API.params;

    let stockingInfo: Stocking | null = null;

    stockingInfo = await API.transaction(async (tx) => {
      //すでにある情報を取得する
      const currentStockingInfo = await tx.stocking.findUnique({
        where: {
          store_id: parseInt(store_id),
          id: parseInt(stocking_id),
          //未入荷のものだけ
          // status: StockingStatus.NOT_YET,
        },
        include: {
          from_store_shipment: {
            select: {
              id: true,
              store_id: true,
            },
          },
        },
      });

      if (!currentStockingInfo) throw new ApiError('notExist');

      if (currentStockingInfo.status != StockingStatus.NOT_YET)
        throw new ApiError({
          status: 400,
          messageText: `入荷済みか、もしくはすでにキャンセルされています`,
        });

      let updateResult: Stocking;

      //出荷元が紐づいているかどうかで処理を変える
      if (currentStockingInfo.from_store_shipment?.id) {
        const storeShipmentService = new BackendApiStoreShipmentService(
          API,
          currentStockingInfo.from_store_shipment.id,
        );
        storeShipmentService.resetIds({
          storeShipmentId: currentStockingInfo.from_store_shipment.id,
          storeId: currentStockingInfo.from_store_shipment.store_id,
        });

        const rollbackRes = await storeShipmentService.core.rollback();

        console.log(rollbackRes);

        updateResult = rollbackRes.stocking;
      } else {
        //更新する
        updateResult = await tx.stocking.update({
          where: {
            id: currentStockingInfo.id,
          },
          data: {
            //ステータスはキャンセルにだけできる
            status: StockingStatus.CANCELED,
          },
        });
      }

      return updateResult;
    });

    return API.status(200).response({ data: { id: stockingInfo.id } });
  },
);
