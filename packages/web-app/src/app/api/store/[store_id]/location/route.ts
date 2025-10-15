// ロケーション作成・更新

import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiProductService } from '@/api/backendApi/services/product/main';
import {
  Location_Product,
  LocationStatus,
  Prisma,
  ProductStockHistorySourceKind,
} from '@prisma/client';
import { createOrUpdateLocationApi, getLocationApi } from 'api-generator';

export const POST = BackendAPI.create(
  createOrUpdateLocationApi,
  async (API, { params, body }) => {
    const { store_id } = params;

    let { id, display_name, description, products } = body;

    const staff_account_id = API.resources.actionAccount?.id;

    if (!staff_account_id) throw new ApiError('noStaffAccount');

    //ロケーションに対しての追加か削除か
    let adjustProducts: {
      increase: Array<{
        product_id: Location_Product['product_id'];
        item_count: Location_Product['item_count'];
      }>;
      decrease: Array<{
        product_id: Location_Product['product_id'];
        item_count: Location_Product['item_count'];
      }>;
    } = {
      increase: [],
      decrease: [],
    };

    if (id) {
      const alreadyInfo = await API.db.location.findUnique({
        where: {
          id,
          store_id,
          status: LocationStatus.CREATED,
        },
        include: {
          products: true,
        },
      });

      if (!alreadyInfo) throw new ApiError('notExist');

      //差分を求める
      //productsとalreadyInfo.productsの差分を求めてadjustProductsに入れる

      const allProductIds = new Set([
        ...products.map((e) => e.product_id),
        ...alreadyInfo.products.map((e) => e.product_id),
      ]);

      //差分を求める
      allProductIds.forEach((productId) => {
        const alreadyProduct = alreadyInfo.products.find(
          (e) => e.product_id === productId,
        );
        const newProduct = products.find((e) => e.product_id === productId);

        //alreadyProductがあってnewProductがない場合は削除
        if (alreadyProduct && !newProduct) {
          adjustProducts.decrease.push({
            product_id: productId,
            item_count: alreadyProduct.item_count,
          });
        }
        //alreadyProductがなくてnewProductがある場合は追加
        else if (!alreadyProduct && newProduct) {
          adjustProducts.increase.push({
            product_id: productId,
            item_count: newProduct.item_count,
          });
        }
        //alreadyProductがあってnewProductがある場合は数の変更
        else if (alreadyProduct && newProduct) {
          if (alreadyProduct.item_count > newProduct.item_count) {
            adjustProducts.decrease.push({
              product_id: productId,
              item_count: alreadyProduct.item_count - newProduct.item_count,
            });
          } else if (alreadyProduct.item_count < newProduct.item_count) {
            adjustProducts.increase.push({
              product_id: productId,
              item_count: newProduct.item_count - alreadyProduct.item_count,
            });
          }
        }
      });
    } else {
      //新規作成の場合、すべてincreaseに入れる
      products.forEach((e) => {
        adjustProducts.increase.push({
          product_id: e.product_id,
          item_count: e.item_count,
        });
      });

      //新規作成の場合、display_nameは必須
      if (!display_name)
        throw new ApiError({
          status: 400,
          messageText: `display_nameは必須です`,
        });
    }

    const txResult = await API.transaction(async (tx) => {
      const createLocationRes = await tx.location.upsert({
        where: {
          id: id ?? 0,
        },
        create: {
          store_id,
          staff_account_id,
          display_name: display_name!,
          description,
          products: {
            create: adjustProducts.increase.map((e) => ({
              product_id: e.product_id,
              item_count: e.item_count,
            })),
          },
        },
        update: {
          display_name,
          description,
          products: {
            deleteMany: {},
            create: products,
          },
        },
        include: {
          products: {
            include: {
              product: true,
            },
          },
        },
      });

      let total_wholesale_price = createLocationRes.total_wholesale_price ?? 0;
      const total_item_count = createLocationRes.products.reduce(
        (acc, e) => acc + e.item_count,
        0,
      );
      const expected_sales = createLocationRes.products.reduce(
        (acc, e) => acc + e.product.actual_sell_price! * e.item_count,
        0,
      );

      //必要なだけ在庫調整する
      //正順で仕入れ値レコードを消費し、その値を取得する
      //decreaseについては逆順で仕入れ値レコードを消費し、その値を取得する

      //増やすやつ
      for (const product of adjustProducts.increase) {
        const productService = new BackendApiProductService(
          API,
          product.product_id,
        );
        const changeRes = await productService.core.decreaseStock({
          decreaseCount: product.item_count,
          source_kind: ProductStockHistorySourceKind.location,
          source_id: createLocationRes.id,
          description: `ロケーションへの在庫追加で、product_id:${product.product_id}の在庫を${product.item_count}個削除しました`,
        });

        //使った合計仕入れ値を足す
        total_wholesale_price += changeRes.recordInfo?.totalWholesalePrice ?? 0;
      }

      //減らすやつ
      for (const product of adjustProducts.decrease) {
        const productService = new BackendApiProductService(
          API,
          product.product_id,
        );
        const changeRes = await productService.core.increaseStock({
          increaseCount: product.item_count,
          source_kind: ProductStockHistorySourceKind.location_release,
          source_id: createLocationRes.id,
          description: `ロケーションからの在庫削除で、product_id:${product.product_id}の在庫を${product.item_count}個追加しました`,
        });

        //戻ってきた仕入れ値を引く
        total_wholesale_price -= changeRes.recordInfo?.totalWholesalePrice ?? 0;
      }

      //更新かける
      const updateRes = await tx.location.update({
        where: {
          id: createLocationRes.id,
        },
        data: {
          total_wholesale_price,
          total_item_count,
          expected_sales,
        },
        include: {
          products: true,
        },
      });

      return updateRes;
    });

    return txResult;
  },
);
// ロケーションを取得

export const GET = BackendAPI.create(
  getLocationApi,
  async (API, { params }) => {
    const whereInput: Array<Prisma.LocationWhereInput> = [];

    // クエリパラメータを見ていく
    await API.processQueryParams((key, value) => {
      switch (key) {
        case 'status':
          whereInput.push({
            [key]: value as LocationStatus,
          });
          break;
        case 'id':
          whereInput.push({
            [key]: Number(value),
          });
          break;
      }
    });

    const selectRes = await API.db.location.findMany({
      where: {
        AND: whereInput,
        store_id: params.store_id,
      },
      include: {
        products: true,
      },
      ...API.limitQuery,
    });

    // 総件数を取得（ページネーション用）
    const totalCount = await API.db.location.count({
      where: {
        AND: whereInput,
        store_id: params.store_id,
      },
    });

    return {
      locations: selectRes,
      totalCount,
    };
  },
);
