import { apiRole, BackendAPI } from '@/api/backendApi/main';
import { type apiPrivilegesType } from '@/types/BackendAPI';
import { checkIfPartOfCron } from '@/utils/day';
import { Sale, SaleStatus } from '@prisma/client';
import { type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendSaleAPI } from '@/app/api/store/[store_id]/sale/api';
import { BackendApiProductService } from '@/api/backendApi/services/product/main';
import { BackendApiSaleService } from '@/api/backendApi/services/sale/main';

//セール登録を行うAPI
//IDを指定することで変更ができる様にもする
export const POST = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [apiRole.pos], //アカウントの種類がuserなら権限に関わらず実行できる
        policies: [], //実行に必要なポリシー
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);

    const { store_id } = API.params;

    const {
      id, //任意のセールID
      display_name, //セール名
      transaction_kind, //セールの種類
      start_datetime, //10分単位で指定できる、セールの開始日時
      discount_amount, //セールの割引量
      end__datetime, //終了日時
      end__total_item_count, //セールを終了するアイテムの合計数
      end__unit_item_count, //セールを終了するそれぞれのアイテムの上限数
      repeat_cron_rule, //繰り返しのCRON設定 特に繰り返さない場合はなしで大丈夫
      sale_end_datetime, //セールの終了日時 end__datetimeが指定されている時は通常それになるが、リピート設定の時はリピートの終了日時
      products, //セールに関わる商品の定義 除外設定もここに含まれる
      departments, //セールに関わる部門の定義

      //更新用
      on_pause, //中止中かどうかを変える
    } = API.body as BackendSaleAPI[0]['request']['body'];

    let saleInfo: Sale | null = null;

    //パラメータの形式が正しいか確認
    (['start_datetime', 'end__datetime', 'sale_end_datetime'] as const).forEach(
      (prop) => {
        if (API.body[prop]) {
          if (new Date(API.body[prop]).getMinutes() % 10 != 0)
            throw new ApiError({
              status: 400,
              messageText: `${prop}の形式が正しくありません`,
            });
        }
      },
    );

    //CRONの形式が正しいか
    (['repeat_cron_rule'] as const).forEach((prop) => {
      if (API.body[prop]) {
        try {
          checkIfPartOfCron(API.body[prop], new Date(), new Date(), new Date());
        } catch (e) {
          //エラーが発生したら
          throw new ApiError({
            status: 400,
            messageText: `${prop}の形式が正しくありません`,
          });
        }
      }
    });

    saleInfo = await API.transaction(async (tx) => {
      let currentSaleInfo: Sale | null = null;

      //IDが指定されている場合
      if (id) {
        //すでにある情報を取得する
        currentSaleInfo = await tx.sale.findUnique({
          where: {
            store_id: parseInt(store_id),
            id,
            status: {
              //終了済みセールの編集はできない
              not: SaleStatus.FINISHED,
            },
          },
        });

        if (!currentSaleInfo) throw new ApiError('notExist');

        //productsが入っているなら、一度既存のものを削除
        if (products) {
          await tx.sale_Product.deleteMany({
            where: {
              sale_id: id,
            },
          });
        }

        //departmentsが入っているなら、一度既存のものを削除
        if (departments) {
          await tx.sale_Department.deleteMany({
            where: {
              sale_id: id,
            },
          });
        }
      } else {
        //指定されていない場合、ちゃんと情報が足りてるか確認
        API.checkField(
          [
            'display_name',
            'transaction_kind',
            'start_datetime',
            'discount_amount',
          ],
          true,
        );
      }

      //作成する
      const updateResult = await tx.sale.upsert({
        where: {
          id: Number(id ?? 0),
        },
        create: {
          store_id: parseInt(store_id),
          //ステータスはdefault値を使う
          display_name: display_name || '',
          transaction_kind,
          start_datetime: start_datetime
            ? new Date(start_datetime)
            : new Date(), //万が一指定されてなかったら今の時間を適当につっこむ
          discount_amount,
          end__datetime: end__datetime
            ? new Date(end__datetime)
            : end__datetime,
          end__total_item_count,
          end__unit_item_count,
          repeat_cron_rule,
          sale_end_datetime: sale_end_datetime
            ? new Date(sale_end_datetime)
            : sale_end_datetime,
          products: {
            //商品の定義
            create: (products || []).map((each) => ({
              product_id: each.product_id,
              rule: each.rule,
            })),
          },
          departments: {
            //部門の定義
            create: (departments || []).map((each) => ({
              item_genre_id: each.item_genre_id,
              item_category_id: each.item_category_id,
              rule: each.rule,
            })),
          },
        },
        update: {
          //ステータスは手動で変えられない
          on_pause, //中止かどうかを変えれる
          transaction_kind,
          display_name,
          start_datetime: start_datetime
            ? new Date(start_datetime)
            : start_datetime,
          discount_amount,
          end__datetime: end__datetime
            ? new Date(end__datetime)
            : end__datetime,
          end__total_item_count,
          end__unit_item_count,
          repeat_cron_rule,
          sale_end_datetime: sale_end_datetime
            ? new Date(sale_end_datetime)
            : sale_end_datetime,
          products: {
            //商品の定義
            create: (products || []).map((each) => ({
              product_id: each.product_id,
              rule: each.rule,
            })),
          },
          departments: {
            //部門の定義
            create: (departments || []).map((each) => ({
              item_genre_id: each.item_genre_id,
              item_category_id: each.item_category_id,
              rule: each.rule,
            })),
          },
        },
      });

      //更新の結果からさらに更新するもの
      const secondUpdateResult = await tx.sale.update({
        where: {
          id: updateResult.id,
        },
        data: {
          //セールの終了日時は通常、end__datetimeになるが、繰り返しがある場合は異なってくる
          sale_end_datetime: !updateResult.repeat_cron_rule
            ? updateResult.end__datetime
            : updateResult.sale_end_datetime,
        },
      });

      return secondUpdateResult;
    });

    //セールのステータスを更新する
    const saleModel = new BackendApiSaleService(API);

    await saleModel.core.updateStatus({
      storeId: parseInt(store_id),
    });

    return API.status(id ? 200 : 201).response({ data: { id: saleInfo.id } });
  },
);

//条件を指定して、セールの情報を取得するAPI
export const GET = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: [apiRole.pos], //アカウントの種類がuserなら権限に関わらず実行できる
        policies: [], //実行に必要なポリシー
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);

    const whereQuery: any = {};

    Object.entries(API.query).forEach(([prop, value]: any) => {
      switch (prop) {
        case 'id':
          whereQuery[prop] = parseInt(value || '0');
          break;

        case 'status': //こちらはあくまでもステータス
          whereQuery[prop] = value;
          break;

        case 'on_pause': //中止中かどうか
          whereQuery[prop] =
            value == 'true' ? true : value == 'false' ? false : undefined;
          break;

        default:
          return false;
      }
    });

    let sales: any = []; //セール

    const { store_id } = API.params;

    const selectResult = await API.db.sale.findMany({
      where: {
        ...whereQuery,
        store_id: parseInt(store_id || ''),
      },
      include: {
        products: {
          select: {
            rule: true,
            product_id: true,
            product: {
              select: {
                specialty: {
                  select: {
                    display_name: true,
                  },
                },
                item: {
                  select: {
                    rarity: true,
                    cardnumber: true,
                    expansion: true,
                  },
                },
                display_name: true,
                management_number: true,
              },
            },
          },
        },
        departments: {
          select: {
            rule: true,
            item_genre: {
              select: {
                id: true,
                display_name: true,
              },
            },
            item_category: {
              select: {
                id: true,
                display_name: true,
              },
            },
          },
        },
      },
      orderBy: [
        {
          id: 'desc',
        },
      ],
    });

    selectResult.forEach((s) => {
      s.products?.forEach((p) => {
        const productModel = new BackendApiProductService(API);
        //@ts-expect-error becuase of because of
        p.product.displayNameWithMeta =
          productModel.core.getProductNameWithMeta(p.product);
      });
    });

    sales = BackendAPI.useFlat(selectResult, {
      product__display_name: 'product_name',
    });

    return API.status(200).response({
      data: {
        sales,
      },
    });
  },
);
