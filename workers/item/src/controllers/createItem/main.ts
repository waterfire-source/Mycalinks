import {
  BackendCoreDepartmentService,
  BackendCoreItemService,
  TaskCallback,
  workerDefs,
} from 'backend-core';

//商品マスタ作成
export const createItemController: TaskCallback<
  typeof workerDefs.item.kinds.createItem.body
> = async (task) => {
  const departmentModel = new BackendCoreDepartmentService();
  task.give(departmentModel);

  //先にすべての状態選択肢の定義などを取得しておく
  const allConditionOptions = await task.db.item_Category.findMany({
    where: {
      id: {
        in: task.body.map((e) => e.data.category.connect?.id),
      },
    },
    include: {
      condition_options: true,
    },
  });

  await task.processItems(async (each) => {
    const itemService = new BackendCoreItemService();
    task.give(itemService);

    const thisCategoryInfo = allConditionOptions.find(
      (e) => e.id === each.category.connect?.id,
    );

    //release_atがあったらDateに変換しておく
    if (each.release_at) {
      const thisDate = new Date(each.release_at);

      each.release_at =
        isNaN(thisDate.getTime()) || thisDate.getTime() < 0 ? null : thisDate;
    }

    await itemService.create({
      data: each,
      specificConditionOptions: thisCategoryInfo?.condition_options,
      ignoreError: true,
    });
  });
};
