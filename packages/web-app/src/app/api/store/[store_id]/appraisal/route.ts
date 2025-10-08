import { BackendAPI } from '@/api/backendApi/main';
import {
  ItemCategoryHandle,
  Prisma,
  ProductStockHistorySourceKind,
} from '@prisma/client';
import { ApiError } from '@/api/backendApi/error/apiError';
import {
  ApiResponse,
  createAppraisalApi,
  getAppraisalApi,
} from 'api-generator';
import { BackendApiProductService } from '@/api/backendApi/services/product/main';

//鑑定作成API
export const POST = BackendAPI.create(
  createAppraisalApi,
  async (API, { params, body }) => {
    //コールバック関数でAPIとパラメータ

    const staff_account_id = API.resources.actionAccount?.id;

    if (!staff_account_id) throw new ApiError('noStaffAccount');

    //鑑定を作りつつ、鑑定対象商品の在庫を減らす
    //また、仕入れをおさえる

    const result = await API.transaction(async (tx) => {
      //鑑定を作る
      const createAppraisalRes = await tx.appraisal.create({
        data: {
          store_id: params.store_id, //Numberでキャストされているのでこれでおk
          ...body, //フィールドセーフなのでこれでおk
          staff_account_id,
          products: undefined, //products以外bodyに準拠
        },
      });

      const allProductCount = body.products.reduce(
        (curSum, e) => curSum + e.item_count,
        0,
      );
      //一枚あたりの鑑定費用
      const appraisalUnitFee = Math.round(body.appraisal_fee / allProductCount);

      //それぞれの商品を確認していく
      //商品を跨いだらコンフリクトしないため、並列処理
      await Promise.all(
        body.products.map(async (product) => {
          const thisProduct = new BackendApiProductService(
            API,
            product.product_id,
          );

          //同じ商品同士だとコンフリクトする可能性があるため、直列処理
          for (let i = 0; i < product.item_count; i++) {
            //在庫を減少させつつ、仕入れ値を取得する
            const changeRes = await thisProduct.core.decreaseStock({
              decreaseCount: 1,
              source_kind: ProductStockHistorySourceKind.appraisal_create,
              source_id: createAppraisalRes.id,
            });

            //この変動で使った仕入れ値を取得する
            const wholesale_price =
              changeRes.recordInfo?.totalWholesalePrice ?? 0;

            //レコードを登録
            const createRes = await tx.appraisal_Product.create({
              data: {
                appraisal: {
                  connect: {
                    id: createAppraisalRes.id,
                  },
                },
                product: {
                  connect: {
                    id: product.product_id,
                    store_id: params.store_id, //[TODO] 本当はconnectを使っていちいちストアに所有権があるか確認しながらリレーション登録するべきだが現状できてないところが多い
                  },
                },
                wholesale_price,
                appraisal_fee: appraisalUnitFee,
              },
              include: {
                product: {
                  include: {
                    condition_option: {
                      include: {
                        item_category: true,
                      },
                    },
                  },
                },
              },
            });

            //カードかどうか確認 [TODO] カード以外もできるようにするかも
            if (
              createRes.product.condition_option?.item_category.handle !=
              ItemCategoryHandle.CARD
            )
              throw new ApiError({
                status: 400,
                messageText: '鑑定対象商品がカードではありません',
              });

            //すでにスペシャルティがついていたらエラー
            if (createRes.product.specialty_id)
              throw new ApiError({
                status: 400,
                messageText: 'この商品はすでに特殊商品として登録されています',
              });
          }
        }),
      );

      return await tx.appraisal.findUnique({
        where: {
          id: createAppraisalRes.id,
        },
        include: {
          products: true,
        },
      });
    });

    return result!;
  },
);

//鑑定取得API
export const GET = BackendAPI.create(
  getAppraisalApi,
  async (API, { params, query }) => {
    const whereInput: Array<Prisma.AppraisalWhereInput> = [];

    //クエリパラメータを見ていく
    for (const prop in query) {
      const key = prop as keyof typeof query;
      const value = query[key];

      switch (key) {
        case 'id':
          whereInput.push({
            id: value as number,
          });
          break;
        case 'finished':
          whereInput.push({
            finished: value as boolean,
          });
          break;
      }
    }

    const selectRes = await API.db.appraisal.findMany({
      where: {
        store_id: params.store_id,
        deleted: query.deleted ?? false, // deletedがある場合はその値を、ない場合はfalse
        AND: whereInput,
      },
      include: {
        products: {
          include: {
            product: {
              select: {
                management_number: true,
                specialty: {
                  select: {
                    display_name: true,
                  },
                },
                item: {
                  select: {
                    rarity: true,
                    expansion: true,
                    cardnumber: true,
                  },
                },
                display_name: true,
                image_url: true,
                condition_option: { select: { display_name: true } },
              },
            },
            condition_option: true,
            specialty: true,
          },
        },
      },
      ...API.limitQuery,
    });

    const appraisals = selectRes.map((a) => {
      a.products.forEach((p) => {
        const productModel = new BackendApiProductService(API);
        p.product = {
          display_name: p.product.display_name,
          // @ts-expect-error becuase of
          displayNameWithMeta: productModel.core.getProductNameWithMeta(
            p.product,
          ),
          condition_option_display_name:
            p.product?.condition_option?.display_name || '',
          image_url: p.product.image_url,
        };
      });
      return a;
    }) as unknown as ApiResponse<typeof getAppraisalApi>['appraisals'];

    return {
      appraisals,
    };
  },
);
