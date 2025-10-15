//Productにタグをつける

import { BackendAPI } from '@/api/backendApi/main';
import { ApiResponse, getLossProductsApi } from 'api-generator';
import { Loss, Loss_Genre, Prisma } from '@prisma/client';
import { BackendApiProductService } from '@/api/backendApi/services/product/main';

//ロスを在庫ごとに取得するAPI
export const GET = BackendAPI.create(
  getLossProductsApi,
  async (API, { params, query }) => {
    const whereInput: Array<Prisma.Loss_ProductWhereInput> = [];

    //クエリパラメータを見ていく
    const lossCondition: any = {};
    const productCondition: any = {};

    for (const prop in query) {
      const key = prop as keyof typeof query;
      const value = query[key];

      switch (key) {
        case 'loss_genre_id': {
          lossCondition.loss_genre_id = value as Loss_Genre['id'];
          break;
        }
        case 'staff_account_id': {
          lossCondition.staff_account_id = value as Loss['staff_account_id'];
          break;
        }
        case 'reason': {
          lossCondition.reason = {
            contains: value as string,
          };
          break;
        }
        case 'datetime_gte': {
          if (!lossCondition.datetime) lossCondition.datetime = {};
          // 明示的にUTCとして解釈し、日本時間の開始時刻(00:00:00 JST)をUTCに変換
          const gteDate = new Date(value as string);
          lossCondition.datetime.gte = gteDate;
          break;
        }
        case 'datetime_lte': {
          if (!lossCondition.datetime) lossCondition.datetime = {};
          // 明示的にUTCとして解釈し、日本時間の終了時刻(23:59:59 JST)をUTCに変換
          const lteDate = new Date(value as string);
          lossCondition.datetime.lte = lteDate;
          break;
        }
        case 'display_name': {
          productCondition.display_name = {
            contains: value as string,
          };
          break;
        }
      }
    }

    if (Object.keys(lossCondition).length > 0) {
      whereInput.push({ loss: lossCondition });
    }
    if (Object.keys(productCondition).length > 0) {
      whereInput.push({ product: productCondition });
    }

    //並び替えを見ていく
    const orderBy: Array<Prisma.Loss_ProductOrderByWithRelationInput> = [];

    API.orderByQuery.forEach((each) => {
      Object.entries(each).forEach(([propName, mode]) => {
        switch (propName) {
          case 'productDisplayName':
            orderBy.push({
              product: {
                display_name: mode,
              },
            });
            break;
          case 'lossGenreDisplayName':
            orderBy.push({
              loss: {
                loss_genre: {
                  display_name: mode,
                },
              },
            });
            break;

          case 'datetime':
            orderBy.push({
              loss: {
                datetime: mode,
              },
            });
            break;
        }
      });
    });

    const selectRes = await API.db.loss_Product.findMany({
      where: {
        loss: {
          store_id: params.store_id,
        },
        AND: whereInput,
      },
      include: {
        product: {
          include: {
            condition_option: {
              select: {
                display_name: true,
              },
            },
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
          },
        },
        loss: {
          include: {
            loss_genre: {
              select: {
                display_name: true,
              },
            },
            staff_account: {
              select: {
                display_name: true,
              },
            },
          },
        },
      },
      orderBy,
      ...API.limitQuery,
    });

    // 総件数取得
    const totalCount = await API.db.loss_Product.count({
      where: {
        loss: {
          store_id: params.store_id,
        },
        AND: whereInput,
      },
    });

    selectRes.forEach((p) => {
      const productModel = new BackendApiProductService(API);
      //@ts-expect-error becuase of because of
      p.product.displayNameWithMeta = productModel.core.getProductNameWithMeta(
        p.product,
      );
    });

    return {
      //@ts-expect-error becuase of because of
      lossProducts: selectRes as ApiResponse<
        typeof getLossProductsApi
      >['lossProducts'],
      totalCount,
    };
  },
);
