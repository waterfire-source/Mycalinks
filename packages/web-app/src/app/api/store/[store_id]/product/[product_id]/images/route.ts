// 在庫の画像を編集する

import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { updateProductImagesApi } from 'api-generator';

export const POST = BackendAPI.create(
  updateProductImagesApi,
  async (API, { params, body }) => {
    const { store_id, product_id } = params;

    let { images } = body;

    //存在を確認する
    const thisProductInfo = await API.db.product.findUniqueExists({
      where: {
        id: product_id,
        store_id,
      },
    });

    if (!thisProductInfo) throw new ApiError('notExist');

    const txRes = await API.transaction(async (tx) => {
      //一旦全ての画像を削除する
      await tx.product_Image.deleteMany({
        where: {
          product_id,
        },
      });

      //新しい画像を登録する
      await tx.product_Image.createMany({
        data: images.map((image) => ({
          ...image,
          product_id,
        })),
      });

      //画像を取得する
      const updatedImages = await tx.product_Image.findMany({
        where: {
          product_id,
        },
        orderBy: {
          order_number: 'asc',
        },
      });

      return updatedImages;
    });

    return {
      images: txRes,
    };
  },
);
