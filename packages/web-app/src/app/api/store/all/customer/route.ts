import { BackendAPI } from '@/api/backendApi/main';
import { type apiPrivilegesType } from '@/types/BackendAPI';
import { type NextRequest } from 'next/server';
import { ApiError } from '@/api/backendApi/error/apiError';
import {
  BackendAllCustomerAPI,
  UpdateAllCustomerApi,
} from '@/app/api/store/all/customer/api';
import { BackendApiMycaAppService } from '@/api/backendApi/services/mycaApp/main';
import { customDayjs } from 'common';

//MycaユーザーがPOS内の顧客情報を取得する用
export const GET = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: ['myca_user'], //アカウントの種類がuserなら権限に関わらず実行できる
        policies: [], //実行に必要なポリシー
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);

    const myca_user_id = API.mycaUser?.id;

    let result: BackendAllCustomerAPI[0]['response'][200] = [];

    result = await API.db.customer.findMany({
      where: {
        myca_user_id: myca_user_id || 0,
      },
      include: {
        store: {
          select: {
            id: true,
            display_name: true,
            receipt_logo_url: true,
          },
        },
      },
    });

    return API.response({ data: result });
  },
);

//Mycaユーザー情報同期
export const PUT = ApiError.errorWrapper(
  async (req: NextRequest, { params }: any) => {
    const apiDef: apiPrivilegesType = {
      privileges: {
        role: ['bot', 'pos'], //アカウントの種類がuserなら権限に関わらず実行できる
        policies: [], //実行に必要なポリシー
      },
    };

    const API = await BackendAPI.setUp(req, params, apiDef);

    const { myca_user_id } =
      API.body as UpdateAllCustomerApi['request']['body'];

    const mycaAppService = new BackendApiMycaAppService(API);

    const mycaUser = await mycaAppService.core.user.getInfo({
      user: myca_user_id,
    });

    if (!mycaUser) throw new ApiError('notExist');

    const updateRes = await API.db.customer.updateMany({
      where: {
        myca_user_id,
      },
      data: {
        email: mycaUser.mail,
        birthday: customDayjs.tz(mycaUser.birthday).isValid()
          ? customDayjs.tz(mycaUser.birthday).toDate()
          : null,
        address: mycaUser.address,
        zip_code: mycaUser.zip_code,
        city: mycaUser.city,
        prefecture: mycaUser.prefecture,
        building: mycaUser.building,
        address2: mycaUser.address2,
        phone_number: mycaUser.phone_number,
        gender: mycaUser.gender,
        career: mycaUser.career,
        full_name: mycaUser.full_name,
        full_name_ruby: mycaUser.full_name_ruby,
      },
    });

    console.log(mycaUser);

    return API.response({ data: { ok: 'ok' } });
  },
);
