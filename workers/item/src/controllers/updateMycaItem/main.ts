import { TaskCallback, workerDefs } from 'backend-core';

//Mycaアイテム更新
export const updateMycaItemController: TaskCallback<
  typeof workerDefs.item.kinds.updateMycaItem.body
> = async (task) => {
  await task.processItems(async (each) => {
    const { myca_item_id, ...updateData } = each;

    if (updateData.market_price_updated_at) {
      updateData.market_price_updated_at = new Date(
        updateData.market_price_updated_at,
      );
    }

    const updateRes = await task.db.myca_Item.update({
      where: {
        myca_item_id,
      },
      data: updateData,
    });

    console.log('更新が完了', updateRes);
  });
};
