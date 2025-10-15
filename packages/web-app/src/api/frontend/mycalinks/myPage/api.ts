import { Store } from '@prisma/client';

export interface MyPageCustomerAPI {
  //すべての店の顧客取得API
  getAll: {
    request: void;
    response: Array<{
      id: number;
      store_id: number;
      email: string | null;
      myca_user_id: number | null;
      birthday: string | null;
      registration_date: string | null;
      address: string | null;
      zip_code: string | null;
      prefecture: string | null;
      city: string | null;
      address2: string | null;
      building: string | null;
      full_name: string | null;
      full_name_ruby: string | null;
      phone_number: string | null;
      gender: string | null;
      career: string | null;
      term_accepted_at: string | null;
      is_active: boolean;
      point_exp: string | null;
      owned_point: number;
      created_at: string;
      updated_at: string;
      memo: string | null;
      store: {
        id: Store['id'];
        display_name: Store['display_name']; //このストアの名前
        receipt_logo_url: Store['receipt_logo_url'];
      };
    }>;
  };
  getQr: {
    request: {
      userId: number;
    };
    response: {
      qrToken: string;
    };
  };
}
