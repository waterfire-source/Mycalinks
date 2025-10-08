import {
  BackendCoreError,
  BackendCoreProductService,
  TaskCallback,
  workerDefs,
} from 'backend-core';

//在庫更新
export const updateProductController: TaskCallback<
  typeof workerDefs.product.kinds.updateProduct.body
> = async (task) => {
  //一通りの在庫を取得しておく
  const allProducts = await task.db.product.findManyExists({
    where: {
      id: {
        in: task.body.map((each) => each.data.id),
      },
      store_id: task.ids.storeId!,
    },
  });

  await task.processItems(async (each) => {
    const thisProduct = new BackendCoreProductService(each.id);
    task.give(thisProduct);

    const thisProductInfo = allProducts.find((e) => e.id === each.id);

    if (!thisProductInfo) {
      throw new BackendCoreError({
        internalMessage: '商品が見つかりません',
        externalMessage: '商品が見つかりません',
      });
    }

    thisProduct.targetObject = thisProductInfo;

    await thisProduct.update({
      data: each,
    });

    console.log('更新が完了');
  });
};
