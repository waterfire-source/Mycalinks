export const BASE_PATH = '/ec';
export const PATH = {
  TOP: BASE_PATH,
  ITEMS: {
    root: `${BASE_PATH}/items`,
    genre: (genre: string) => `${BASE_PATH}/items/genre/${genre}`,
    detail: (itemId: number) => `${BASE_PATH}/items/${itemId}`,
  },
  LOGIN: `${BASE_PATH}/login`,
  CART: `${BASE_PATH}/cart`,
  ORDER: {
    root: `${BASE_PATH}/order`,
    result: (orderId: string) => `${BASE_PATH}/order/result/${orderId}`,
    history: {
      root: `${BASE_PATH}/order/history`,
      detail: (orderId: string) => `${BASE_PATH}/order/history/${orderId}`,
    },
    contact: (orderId: string) => `${BASE_PATH}/order/contact/${orderId}`,
    contactConfirm: (orderId: string) =>
      `${BASE_PATH}/order/contact/${orderId}/confirm`,
    contactResult: (orderId: string) =>
      `${BASE_PATH}/order/contact/${orderId}/result`,
  },
  PAYMENT_METHODS: `${BASE_PATH}/payment-method`,
  ADDRESSES: `${BASE_PATH}/addresses`,
  MESSAGE_CENTER: {
    root: `${BASE_PATH}/message-center`,
    detail: (messageId: string) => `${BASE_PATH}/message-center/${messageId}`,
    detailWithCode: (messageId: string, code: string) =>
      `${BASE_PATH}/message-center/${messageId}/${code}`,
  },
  ACCOUNT: {
    edit: `${BASE_PATH}/account/edit`,
    editConfirm: `${BASE_PATH}/account/edit/confirm`,
    signup: `${BASE_PATH}/account/signup`,
    signupConfirm: `${BASE_PATH}/account/signup/confirm`,
  },
  FORGET_PASSWORD: {
    root: `${BASE_PATH}/forget-password`,
    signIn: `${BASE_PATH}/forget-password/sign-in`,
    changePassword: `${BASE_PATH}/forget-password/change-password`,
  },
  STORE: {
    about: (encodeStoreId: string) =>
      `${BASE_PATH}/store/${encodeStoreId}/about/`,
  },
};

// ec関連の外部リンク
export const EC_EXTERNAL_PATH = {
  specialCommercialLaw: 'https://mycalinks-mall.com/scl/',
  condition: 'https://mycalinks-mall.com/condition',
  help: 'https://mycalinks-mall.com/howto',
  privacyPolicy: 'https://mycalinks-mall.com/privacy',
  guideline: 'https://mycalinks-mall.com/guideline',
  terms: 'https://mycalinks-mall.com/terms',
  convenienceStorePaymentMethod: 'https://mycalinks-mall.com/archives/3202',
};
