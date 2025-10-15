import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { BackendApiDepartmentService } from '@/api/backendApi/services/department/main';
import { activateStore } from '@/app/api/store/def';
import { CustomCrypto } from '@/utils/crypto';

// ストアアクティベートAPI
export const POST = BackendAPI.defineApi(
  activateStore,
  async (API, { body }) => {
    const { code, password } = body;

    //このストアアカウントを探す
    const thisStoreAccountInfo = await API.db.account.findFirst({
      where: {
        login_flg: false,
        linked_corporation_id: API.resources.corporation!.id,
        stores: {
          some: {
            store: {
              code,
              is_active: false,
            },
          },
        },
      },
      include: {
        stores: {
          include: {
            store: true,
          },
        },
      },
    });

    if (!thisStoreAccountInfo || thisStoreAccountInfo.stores.length != 1)
      throw new ApiError({
        status: 404,
        messageText: 'アクティベートする対象のストアが見つかりませんでした',
      });

    if (!password)
      throw new ApiError({
        status: 400,
        messageText: 'パスワードが指定されていません',
      });

    //見つかったらアクティベートしつつ、パスワードをセットする
    const txRes = await API.transaction(async (tx) => {
      const { hash, salt } = CustomCrypto.generateHash(password);

      const updateAccountRes = await tx.account.update({
        where: {
          id: thisStoreAccountInfo.id,
        },
        data: {
          hashed_password: hash,
          salt,
          login_flg: true,
        },
      });

      const thisStoreInfo = thisStoreAccountInfo.stores[0].store!;
      const corpInfo = API.resources.corporation!;

      //ストアの方もアクティベートしていく
      //法人のデフォルト店舗設定もぶちこむ
      const updateStoreRes = await tx.store.update({
        where: {
          id: thisStoreInfo.id,
        },
        data: {
          is_active: true,
          tax_mode: corpInfo.tax_mode,
          price_adjustment_round_rule: corpInfo.price_adjustment_round_rule,
          price_adjustment_round_rank: corpInfo.price_adjustment_round_rank,
          use_wholesale_price_order_column:
            corpInfo.use_wholesale_price_order_column,
          use_wholesale_price_order_rule:
            corpInfo.use_wholesale_price_order_rule,
          wholesale_price_keep_rule: corpInfo.wholesale_price_keep_rule,
        },
      });

      //固定カテゴリを入れる
      const departmentModel = new BackendApiDepartmentService(API);
      departmentModel.setIds({
        storeId: updateStoreRes.id,
      });
      await departmentModel.core.createAllFixedItemCategory();

      return updateStoreRes;
    });

    return {
      store: txRes,
    };
  },
);
