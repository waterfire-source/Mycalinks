import { ApiError } from '@/api/backendApi/error/apiError';
import { BackendAPI } from '@/api/backendApi/main';
import { deleteStockingSupplierApi } from 'api-generator';

//仕入れ先削除API
export const DELETE = BackendAPI.create(
  deleteStockingSupplierApi,
  async (API, { params }) => {
    const { store_id, supplier_id } = params;

    //現在の情報を取得する
    const currentInfo = await API.db.supplier.findUnique({
      where: {
        store_id,
        id: supplier_id,
        deleted: false,
      },
    });

    if (!currentInfo) throw new ApiError('notExist');

    //論理削除する
    await API.db.supplier.update({
      where: {
        id: supplier_id,
      },
      data: {
        // 削除済みの場合は、ユニーク制約を回避するために表示名の末尾に削除日時を追加する
        display_name: `${currentInfo.display_name}_${new Date().getTime()}`,
        deleted: true,
      },
    });
  },
);
