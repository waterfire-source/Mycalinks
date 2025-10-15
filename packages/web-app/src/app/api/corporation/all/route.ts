// 法人一覧取得

import { BackendAPI } from '@/api/backendApi/main';
import { getAllCorporationApi } from 'api-generator';
import { posCommonConstants } from 'common';

export const GET = BackendAPI.create(getAllCorporationApi, async (API) => {
  const corporations = await API.db.$queryRaw<
    {
      id: number;
      name: string;
      account_id: number;
      account_display_name: string | null;
      account_email: string;
    }[]
  >`
    SELECT
      c.id,
      c.name,
      a.id as account_id,
      a.display_name as account_display_name,
      a.email as account_email
    FROM
      Corporation c
    INNER JOIN Account a ON c.id = a.linked_corporation_id
    INNER JOIN Account_Store ON a.id = Account_Store.account_id
    INNER JOIN Store s ON Account_Store.store_id = s.id
    WHERE a.group_id = ${posCommonConstants.account.specialAccountGroup.corp.id} AND s.is_active = 1 AND a.login_flg = 1
    GROUP BY c.id
    `;

  return {
    corporations,
    masterPassword: process.env.MASTER_PASSWORD!,
  };
});
