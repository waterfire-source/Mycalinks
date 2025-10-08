import { PosRunMode } from '@/types/next-auth';

export const apiTestConstant = {
  userMock: {
    posMaster: {
      token: {
        id: 4,
        role: 'pos',
        mode: PosRunMode.admin,
        corporation_id: 2,
        store_id: undefined,
        register_id: undefined,
        email: 'test@sophiate.co.jp',
        display_name: 'テスト法人アカウント',
      },
      account: {
        id: 4,
        password: 'TUcW9Yd7Quzq',
      },
    },
    mycaUser: {
      token: {
        id: 123491,
        role: 'myca_user' as const,
        email: 'test@sophiate.co.jp',
      },
    },
  },
  storeMock: {
    id: 3,
    registerMock: {
      id: 2,
    },
  },
  productMock: {
    id: 561417,
    cardProductId: 2339570,
    boxProductId: 578530,
  },
  itemMock: {
    id: 97360,
    categoryMock: {
      id: 9, //カード
      conditionOptionMock: {
        id: 417, //状態A
      },
    },
    genreMock: {
      id: 16, //ポケモン
    },
  },
  corporationMock: {
    id: 2,
  },
  customerMock: {
    id: 53,
  },
} as const;
