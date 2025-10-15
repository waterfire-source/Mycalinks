import { apiRole, BackendAPI } from '@/api/backendApi/main';
import { type apiPrivilegesType } from '@/types/BackendAPI';
import { Sale, SaleStatus } from '@prisma/client';
import { type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendApiSaleService } from '@/api/backendApi/services/sale/main';

//特定の商品のセール情報を取得する
export const GET = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [apiRole.pos], //アカウントの種類がuserなら権限に関わらず実行できる
        policies: [], //実行に必要なポリシー
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);

    const { store_id, product_id } = API.params;

    const { transaction_kind } = API.query;

    if (!transaction_kind) throw new ApiError('notEnough');

    //商品情報を取得する
    const thisProductInfo = await API.db.product.findUniqueExists({
      where: {
        id: parseInt(product_id),
        store_id: parseInt(store_id),
      },
      include: {
        item: true,
      },
    });

    if (!thisProductInfo) throw new ApiError('notExist');

    //委託在庫はこの時点で除く
    if (thisProductInfo.consignment_client_id) {
      return API.status(200).response({ data: [] });
    }

    //とりあえず中止中じゃない、開催中のこのストアのこの種類のセールを全て取得する

    const candidateSales = await API.db.sale.findMany({
      where: {
        store_id: parseInt(store_id),
        transaction_kind,
        status: SaleStatus.ON_HELD,
        on_pause: {
          not: true,
        },
      },
      include: {
        products: true,
        product_history: true,
        departments: true,
      },
    });

    type resultSaleDataType = {
      sale: Sale | null;
      allowedItemCount: number; //-1で無制限
      originalPrice: number; //元々の価格
      discountPrice: number; //割引分の価格
      resultPrice: number; //最終的な価格
    };

    const thisProductSaleInfo: Array<resultSaleDataType> = [];

    //部門関連のやつが一つでも入っていた場合、情報を取得していく

    console.log(
      `${candidateSales.length}個のセールのなかから商品${thisProductInfo.id}に関係するセールを見つけます`,
    );

    //一度に商品が属すことができるセールは一つであるため、一つ見つかったらすぐに結果を返す
    candidateLoop: for (const eachSale of candidateSales) {
      //セールに対象か確認
      const saleModel = new BackendApiSaleService(API);

      const checkRes = await saleModel.core.checkIfAttachableSale({
        transaction_kind,
        saleInfo: {
          id: eachSale.id,
          info: eachSale, //キャッシュを渡す
        },
        productInfo: {
          id: thisProductInfo.id,
          info: {
            //キャッシュを渡す
            product: thisProductInfo,
          },
        },
      });

      if (!checkRes) continue candidateLoop;

      thisProductSaleInfo.push(checkRes); //セール候補に追加する

      console.log(`セール${eachSale.id}は候補に入っています`);
    }

    return API.status(200).response({ data: thisProductSaleInfo });
  },
);
