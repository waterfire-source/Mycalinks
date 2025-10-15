'use client';

import { createClientAPI } from '@/api/implement';
import { useEposDevice } from '@/contexts/EposDeviceContext';
import { useSession } from 'next-auth/react';

import { useLabelPrinterHistory } from '@/contexts/LabelPrinterContext';

export default function AuthPage() {
  const { data: session, status } = useSession();
  const { pushQueue: pushLabelPrinterQueue } = useLabelPrinterHistory();

  // const { signIn, getUserId } = useAppAuth();

  const apiClient = createClientAPI();

  const { ePosDev } = useEposDevice();

  /**
   * 契約作成
   */
  const createContract = async () => {
    const res = await fetch('/api/contract', {
      method: 'POST',
      body: JSON.stringify({
        start_at: new Date('2025-07-09T00:00:00'),
        main_account_monthly_fee: 1500,
        corporation_management_account_fee: 1000,
        mobile_device_connection_fee: 1800,
        initial_fee: 1000,
      }),
      headers: {
        'Content-Type': 'application/json',
        // Authorization: `Basic ZXBzb246WEJYUTAwMjk2NQ==`,
      },
    });

    const resJson = await res.json();

    console.log(resJson);
  };

  /**
   * 契約支払い
   */
  const payContract = async () => {
    const res = await fetch('/api/contract/pay', {
      method: 'POST',
      body: JSON.stringify({
        token: 'IjU2NWViOTQzLTkxODItNDM3NC1iYmJkLWZmMjI5NjgxYmZlNiI=',
        corporation: {
          name: '齊田法人',
          ceo_name: 'CEO名',
          head_office_address: '住所',
          phone_number: '070-4487-4072',
        },
        account: {
          email: 'saidajunki+05@gmail.com',
        },
        card: {
          token:
            'cfb6e577f5f128555d1f240c5b11a773fcc96e3a73988458e231ad4979fe8b89',
        },
      }),
      headers: {
        'Content-Type': 'application/json',
        // Authorization: `Basic ZXBzb246WEJYUTAwMjk2NQ==`,
      },
    });

    const resJson = await res.json();

    console.log(resJson);
  };

  /**
   * 契約月額支払い
   */
  const payContractMonthly = async () => {
    const res = await fetch('/api/contract/pay/subscription', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: {
        'Content-Type': 'application/json',
        // Authorization: `Basic ZXBzb246WEJYUTAwMjk2NQ==`,
      },
    });

    const resJson = await res.json();

    console.log(resJson);
  };

  /**
   * コンディション選択肢追加
   */
  const addConditionOption = async () => {
    const res = await fetch(
      '/api/store/20/item/category/152/condition-option',
      {
        method: 'POST',
        body: JSON.stringify({
          display_name: '未開封',
          rate_variants: [
            {
              auto_sell_price_adjustment: '100%',
              auto_buy_price_adjustment: '100%',
            },
          ],
        }),
        headers: {
          'Content-Type': 'application/json',
          // Authorization: `Basic ZXBzb246WEJYUTAwMjk2NQ==`,
        },
      },
    );

    const resJson = await res.json();

    console.log(resJson);
  };

  /**
   * オリパ追加
   */
  const addOriginalPack = async () => {
    const res = await fetch('/api/store/3/item/570632/add-original-pack', {
      method: 'POST',
      body: JSON.stringify({
        additionalStockNumber: 2,
        additionalProducts: [
          {
            product_id: 1923885,
            item_count: 5,
          },
          {
            product_id: 1958085,
            item_count: 2,
          },
        ],
      }),
      headers: {
        'Content-Type': 'application/json',
        // Authorization: `Basic ZXBzb246WEJYUTAwMjk2NQ==`,
      },
    });

    const resJson = await res.json();

    console.log(resJson);
  };

  /**
   * ECオーダー取得（顧客）
   */
  const getEcOrderByCustomer = async () => {
    const res = await fetch('/api/ec/order', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Authorization: `Basic ZXBzb246WEJYUTAwMjk2NQ==`,
      },
    });

    const resJson = await res.json();

    console.log(resJson);
  };

  /**
   * ECお問い合わせ作成（顧客）
   */
  const createEcOrderContactByCustomer = async () => {
    const res = await fetch('/api/ec/order/contact', {
      method: 'POST',
      body: JSON.stringify({
        code: '01962A8F769BFCE',
        kind: 'お問い合わせ種類',
        title: 'お問い合わせタイトル',
        content:
          'お問い合わせ本文本文本文本文本文本文本文本文本文本文本文本文本文本文本文本文本文本文本文本文本文本文本文本文本文本文本文',
      }),
      headers: {
        'Content-Type': 'application/json',
        // Authorization: `Basic ZXBzb246WEJYUTAwMjk2NQ==`,
      },
    });

    const resJson = await res.json();

    console.log(resJson);
  };

  /**
   * ジャンルの商品全部インポート
   */
  const importItemsFromApp = async () => {
    const res = await fetch(
      '/api/store/3/item/genre/19/import-items-from-app',
      {
        method: 'POST',
        body: JSON.stringify({}),
        headers: {
          'Content-Type': 'application/json',
          // Authorization: `Basic ZXBzb246WEJYUTAwMjk2NQ==`,
        },
      },
    );

    const resJson = await res.json();

    console.log(resJson);
  };

  /**
   * 取引変更
   */
  const putTransaction = async () => {
    const res = await fetch('/api/store/3/transaction/10571', {
      method: 'PUT',
      body: JSON.stringify({
        can_create_signature: true,
      }),
      headers: {
        'Content-Type': 'application/json',
        // Authorization: `Basic ZXBzb246WEJYUTAwMjk2NQ==`,
      },
    });

    const resJson = await res.json();

    console.log(resJson);
  };

  /**
   * 商品マスタ変更
   */
  const updateItemByApp = async () => {
    const res = await fetch('/api/store/all/item', {
      method: 'PUT',
      body: JSON.stringify({
        updatedItems: [
          {
            id: 1,
          },
        ],
      }),
      headers: {
        'Content-Type': 'application/json',
        // Authorization: `Basic ZXBzb246WEJYUTAwMjk2NQ==`,
      },
    });

    const resJson = await res.json();

    console.log(resJson);
  };

  /**
   * 商品マスタ相場価格のやつ
   */
  const adjustMarketPrice = async () => {
    const res = await fetch('/api/store/3/item/market-price/adjust-gap', {
      method: 'POST',
      body: JSON.stringify({
        adjustAll: false,
      }),
      headers: {
        'Content-Type': 'application/json',
        // Authorization: `Basic ZXBzb246WEJYUTAwMjk2NQ==`,
      },
    });

    const resJson = await res.json();

    console.log(resJson);
  };

  /**
   * メトリクスグラフ生成
   */
  const createMetricsGraph = async () => {
    const res = await fetch('/api/system/report/metrics/graph', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: {
        'Content-Type': 'application/json',
        // Authorization: `Basic ZXBzb246WEJYUTAwMjk2NQ==`,
      },
    });

    const resJson = await res.json();

    console.log(resJson);
  };

  /**
   * 全出品
   */
  const stockingAllProducts = async () => {
    const res = await fetch('/api/store/3/cheat/stocking-all-products', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: {
        'Content-Type': 'application/json',
        // Authorization: `Basic ZXBzb246WEJYUTAwMjk2NQ==`,
      },
    });

    const resJson = await res.json();

    console.log(resJson);
  };

  /**
   * 取引集計
   */
  const transactionDailyCalculate = async () => {
    const res = await fetch('/api/store/all/transaction/daily-calculate', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: {
        'Content-Type': 'application/json',
        // Authorization: `Basic ZXBzb246WEJYUTAwMjk2NQ==`,
      },
    });

    const resJson = await res.json();

    console.log(resJson);
  };

  const ochanokoEmailWebhook = async () => {
    const res = await fetch('/api/ochanoko/webhook', {
      method: 'POST',
      body: JSON.stringify({
        emailData: {
          subject: 'テストメール',
          from: 'sample@ochanoko.com',
          text: 'これはテストメールです。\n改行もしちゃいます',
          to: 'ochanoko-ec-order@mycalinks.io',
        },
      }),
      headers: {
        'Content-Type': 'application/json',
        // Authorization: `Basic ZXBzb246WEJYUTAwMjk2NQ==`,
      },
    });

    const resJson = await res.json();

    console.log(resJson);
  };

  /**
   * 予約の作成
   */
  const createReservation = async () => {
    const res = await fetch('/api/store/3/reservation', {
      method: 'POST',
      body: JSON.stringify({
        product_id: 578530,
        limit_count: 5,
        limit_count_per_user: 1,
        start_at: new Date('2025-06-10T00:00:00'),
        end_at: new Date('2025-06-11T00:00:00'),
        deposit_price: 200,
        remaining_price: 800,
        description: 'テスト予約',
      }),
      headers: {
        'Content-Type': 'application/json',
        // Authorization: `Basic ZXBzb246WEJYUTAwMjk2NQ==`,
      },
    });

    const resJson = await res.json();

    console.log(resJson);
  };

  /**
   * 予約の更新
   */
  const updateReservation = async () => {
    const res = await fetch('/api/store/3/reservation/19', {
      method: 'PUT',
      body: JSON.stringify({
        // status: 'OPEN',
        status: 'CLOSED',
      }),
      headers: {
        'Content-Type': 'application/json',
        // Authorization: `Basic ZXBzb246WEJYUTAwMjk2NQ==`,
      },
    });

    const resJson = await res.json();

    console.log(resJson);
  };

  /**
   * 予約受付
   */
  const createCustomerReservationReception = async () => {
    const res = await fetch('/api/store/3/customer/reservation-reception', {
      method: 'POST',
      body: JSON.stringify({
        customer_id: 53,
        reservations: [
          {
            reservation_id: 26,
            item_count: 1,
          },
        ],
      }),
      headers: {
        'Content-Type': 'application/json',
        // Authorization: `Basic ZXBzb246WEJYUTAwMjk2NQ==`,
      },
    });

    const resJson = await res.json();

    console.log(resJson);
  };

  /**
   * 予約票印刷
   */
  const printReservationReceptionTicket = async () => {
    const res = await fetch(
      '/api/store/3/customer/reservation-reception/receipt?reservation_reception_product_id=8',
    );

    const resJson = await res.json();

    if (ePosDev) {
      ePosDev.printWithCommand(resJson.receiptCommand);
    }

    console.log(resJson);
  };

  /**
   * 予約受付支払い
   */
  const depositReservation = async () => {
    const res = await fetch('/api/store/3/transaction', {
      method: 'POST',
      body: JSON.stringify({
        customer_id: 53,
        register_id: 2,
        transaction_kind: 'sell',
        total_price: 100,
        subtotal_price: 100,
        tax: 0,
        discount_price: 0,
        point_discount_price: 0,
        payment_method: 'cash',
        recieved_price: 200,
        change_price: 0,
        carts: [
          {
            product_id: 4449592,
            item_count: 1,
            unit_price: 0,
            reservation_price: 100,
            reservation_reception_product_id_for_deposit: 29,
          },
        ],
      }),
      headers: {
        'Content-Type': 'application/json',
        // Authorization: `Basic ZXBzb246WEJYUTAwMjk2NQ==`,
      },
    });

    const resJson = await res.json();

    console.log(resJson);
  };

  /**
   * 予約取り消し
   */
  const returnDepositReservation = async () => {
    const res = await fetch('/api/store/3/transaction/13018/return', {
      method: 'POST',
      body: JSON.stringify({
        register_id: 2,
        reservation_id: 19,
        dontRefund: true,
      }),
      headers: {
        'Content-Type': 'application/json',
        // Authorization: `Basic ZXBzb246WEJYUTAwMjk2NQ==`,
      },
    });

    const resJson = await res.json();

    console.log(resJson);
  };

  /**
   * 予約受け取り
   */
  const receiveReservation = async () => {
    const res = await fetch('/api/store/3/transaction', {
      method: 'POST',
      body: JSON.stringify({
        customer_id: 53,
        includesReservationReceive: true,
        register_id: 2,
        transaction_kind: 'sell',
        total_price: 800,
        subtotal_price: 800,
        tax: 0,
        discount_price: 0,
        point_discount_price: 0,
        payment_method: 'cash',
        recieved_price: 800,
        change_price: 0,
        carts: [
          {
            product_id: 578530,
            item_count: 1,
            unit_price: 1000,
            reservation_price: -200,
          },
        ],
      }),
      headers: {
        'Content-Type': 'application/json',
        // Authorization: `Basic ZXBzb246WEJYUTAwMjk2NQ==`,
      },
    });

    const resJson = await res.json();

    console.log(resJson);
  };

  /**
   * 予約受け取ったものを含めた返品
   */
  const returnTransactionWithReservation = async () => {
    const res = await fetch('/api/store/3/transaction/13018/return', {
      method: 'POST',
      body: JSON.stringify({
        register_id: 2,
      }),
      headers: {
        'Content-Type': 'application/json',
        // Authorization: `Basic ZXBzb246WEJYUTAwMjk2NQ==`,
      },
    });

    const resJson = await res.json();

    console.log(resJson);
  };

  /**
   * ECレシート
   */
  const generateEcReceipt = async () => {
    const res = await fetch(
      '/api/ec/order/522/receipt?store_id=33&customer_name=テスト齊田',
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          MycaToken: `eyJuYW1lIjoiTXljYVRva2VuIn0=.eyJpZCI6MTIzNDkxLCJyb2xlIjpudWxsLCJleHAiOiIyMDI1MDYyNyIsInR5cGUiOiJzaG9ydCJ9.0138d737f5bf43482c7cdb9cfb51322f7fa2f2ae2e00d60ff3cc6c1e4d7b65d5c3180f6d188d5c2b1fc66b6ffedbe42dfd464eeb00be900340564fa1275adee4edfcdb4bff618e54567424f91ca73810`,
        },
      },
    );

    const resJson = await res.json();

    console.log(resJson);
  };

  /**
   * 入荷の取り消し
   */
  const rollbackStocking = async () => {
    const res = await fetch('/api/store/3/stocking/125961/rollback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: 'テストロールバック',
      }),
    });

    const resJson = await res.json();

    console.log(resJson);
  };

  /**
   * ロスの取り消し
   */
  const rollbackLoss = async () => {
    const res = await fetch('/api/store/3/loss/243/rollback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: 'テストロールバック',
      }),
    });

    const resJson = await res.json();

    console.log(resJson);
  };

  /**
   * パック開封の取り消し
   */
  const rollbackPackOpening = async () => {
    const res = await fetch('/api/store/3/product/open-pack/1467/rollback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        description: 'テストロールバック',
      }),
    });

    const resJson = await res.json();

    console.log(resJson);
  };

  /**
   * ボックス解体
   */
  const boxOpening = async () => {
    const res = await fetch('/api/store/3/product/3564009/open-box', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        item_count: 1,
        to_products: [
          {
            product_id: 3564006,
            item_count: 20,
          },
        ],
      }),
    });

    const resJson = await res.json();

    console.log(resJson);
  };

  /**
   * カートンマスタ作成
   */
  const createCartonItem = async () => {
    const res = await fetch('/api/store/3/item/928599/carton', {
      method: 'POST',
      body: JSON.stringify({
        box_pack_count: 10,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const resJson = await res.json();

    console.log(resJson);
  };

  /**
   * カートン補充
   */
  const restockCarton = async () => {
    const res = await fetch('/api/store/3/product/6731922/restock-carton', {
      method: 'POST',
      body: JSON.stringify({
        item_count: 5,
        from_product: {
          product_id: 3564009,
          item_count: 50,
        },
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const resJson = await res.json();

    console.log(resJson);
  };

  /**
   * カートン解体
   */
  const openCarton = async () => {
    const res = await fetch('/api/store/3/product/6731922/open-carton', {
      method: 'POST',
      body: JSON.stringify({
        item_count: 2,
        to_product: {
          product_id: 3564009,
          item_count: 20,
        },
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const resJson = await res.json();

    console.log(resJson);
  };

  /**
   * 画像登録
   */
  const updateProductImages = async () => {
    const res = await fetch('/api/store/3/product/564673/images', {
      method: 'POST',
      body: JSON.stringify({
        images: [
          {
            image_url:
              'https://static.mycalinks.io/app/item/image/card/svN/svN_016.jpg',
            description: 'テスト画像',
            order_number: 0,
          },
          {
            image_url:
              'https://static.mycalinks.io/app/item/image/card/svN/svN_016.jpg',
            description: 'テスト画像',
            order_number: 1,
          },
        ],
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const resJson = await res.json();

    console.log(resJson);
  };

  /**
   * マッピングのやつ
   */
  const setMapping = async () => {
    const res = await fetch('/api/store/22/store-shipment/mapping', {
      method: 'POST',
      body: JSON.stringify({
        to_store_id: 3,
        mappings: {
          category: [
            {
              from_category_id: 536,
              to_category_id: 296,
            },
          ],
          condition_option: [
            {
              from_option_id: 254,
              to_option_id: 417,
            },
            {
              from_option_id: 471,
              to_option_id: 417,
            },
          ],
          genre: [
            {
              from_genre_id: 2046,
              to_genre_id: 1342,
            },
          ],
          specialty: [
            {
              from_specialty_id: 251,
              to_specialty_id: 57,
            },
            {
              from_specialty_id: 254,
              to_specialty_id: 70,
            },
            {
              from_specialty_id: 252,
              to_specialty_id: 76,
            },
          ],
        },
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const resJson = await res.json();

    console.log(resJson);
  };

  const createStoreShipment = async () => {
    const res = await fetch('/api/store/22/store-shipment', {
      method: 'POST',
      body: JSON.stringify({
        to_store_id: 3,
        shipment_date: new Date('2025-08-08T15:00:00'),
        description: 'テスト出荷',
        total_wholesale_price: 500,
        products: [
          {
            product_id: 7196204,
            item_count: 1,
            unit_price: 50000,
          },
          {
            product_id: 7196138,
            item_count: 2,
            unit_price: 100,
          },
        ],
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const resJson = await res.json();

    console.log(resJson);
  };

  const cancelStoreShipment = async () => {
    const res = await fetch('/api/store/22/store-shipment/1/cancel', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const resJson = await res.json();

    console.log(resJson);
  };

  const applyStoreShipment = async () => {
    const res = await fetch('/api/store/22/store-shipment/3/apply', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const resJson = await res.json();

    console.log(resJson);
  };

  const rollbackStoreShipment = async () => {
    const res = await fetch('/api/store/22/store-shipment/3/rollback', {
      method: 'POST',
      body: JSON.stringify({}),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const resJson = await res.json();

    console.log(resJson);
  };

  const editEcAboutUs = async () => {
    const res = await fetch('/api/store/3/ec/about-us', {
      method: 'POST',
      body: JSON.stringify({
        shop_pr: 'テストPR',
        images: [
          'https://static.mycalinks.io/app/item/image/card/svN/svN_016.jpg',
          'https://static.mycalinks.io/app/item/image/card/svN/svN_016.jpg',
        ],
        about_shipping: 'テスト配送',
        about_shipping_fee: 'テスト配送料',
        cancel_policy: 'テストキャンセルポリシー',
        return_policy: 'テスト返品ポリシー',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const resJson = await res.json();

    console.log(resJson);
  };

  const createShopifyProduct = async () => {
    const res = await fetch('/api/store/3/shopify/product', {
      method: 'POST',
      body: JSON.stringify({
        productIds: [578786, 578788],
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const resJson = await res.json();

    console.log(resJson);
  };

  const createLocation = async () => {
    const res = await fetch('/api/store/3/location', {
      method: 'POST',
      body: JSON.stringify({
        id: 1,
        display_name: 'テストロケーション',
        description: 'テストロケーション',
        products: [
          {
            product_id: 561417,
            item_count: 1,
          },
          {
            product_id: 561425,
            item_count: 1,
          },
        ],
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const resJson = await res.json();

    console.log(resJson);
  };

  const releaseLocation = async () => {
    const res = await fetch('/api/store/3/location/1/release', {
      method: 'POST',
      body: JSON.stringify({
        actual_sales: 1000,
        products: [
          {
            product_id: 561417,
            item_count: 1,
          },
        ],
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const resJson = await res.json();

    console.log(resJson);
  };

  const updateInfiniteStock = async () => {
    const res = await fetch('/api/store/3/product/2331184/infinite-stock', {
      method: 'PUT',
      body: JSON.stringify({
        stock_number: 4000,
        wholesale_price: 1000,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const resJson = await res.json();

    console.log(resJson);
  };

  const injectInventoryWholesalePrice = async () => {
    const res = await fetch(
      '/api/store/21/inventory/501/inject-wholesale-price',
      {
        method: 'POST',
        body: JSON.stringify({
          wholesalePriceList: [
            {
              product_id: 6924938,
              wholesale_price_history_id: 2102561,
              unit_price: 1000,
            },
          ],
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    const resJson = await res.json();

    console.log(resJson);
  };

  const setEcBanner = async () => {
    const res = await fetch('/api/ec/banner', {
      method: 'POST',
      body: JSON.stringify({
        banners: [
          {
            title: 'テストバナー',
            place: 'TOP',
            image_url:
              'https://static.mycalinks.io/app/item/image/card/svN/svN_016.jpg',
            order_number: 0,
            url: 'https://www.google.com',
          },
          {
            title: 'テストバナー2',
            place: 'BOTTOM',
            image_url:
              'https://static.mycalinks.io/app/item/image/card/svN/svN_016.jpg',
            order_number: 1,
            url: 'https://www.google.com',
          },
        ],
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const resJson = await res.json();

    console.log(resJson);
  };

  const registerDevice = async () => {
    const res = await fetch('/api/store/3/device', {
      method: 'POST',
      body: JSON.stringify({
        type: 'RECEIPT_PRINTER',
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const resJson = await res.json();

    console.log(resJson);
  };

  const sendReceiptPrinterCommand = async () => {
    const receiptCommand = await fetch(
      '/api/store/3/transaction/27018/receipt?type=receipt',
    );
    const receiptCommandJson = await receiptCommand.json();

    const res = await fetch(
      '/api/store/3/device/receipt-printer/send-command',
      {
        method: 'POST',
        body: JSON.stringify({
          eposCommand: receiptCommandJson.receiptCommand,
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      },
    );

    const resJson = await res.json();

    console.log(resJson);
  };

  const test = async () => {
    const res = await fetch('http://localhost:3070/gacha/api/hello/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // body: JSON.stringify({}),
    });

    const resJson = await res.json();

    console.log(resJson);
  };

  return (
    <main>
      <h2>API検証</h2>

      <p>テスト</p>
      <button onClick={() => test()}>テスト</button>

      <p>契約</p>
      <button onClick={() => createContract()}>契約作成</button>
      <button onClick={() => payContract()}>契約支払い</button>
      <button onClick={() => payContractMonthly()}>契約月額支払い</button>

      <p>カテゴリ</p>
      <button onClick={() => addConditionOption()}>
        コンディション選択肢追加
      </button>

      <p>ジャンル</p>
      <button onClick={() => importItemsFromApp()}>
        ジャンルの商品全部インポート
      </button>

      <p>オリパ</p>
      <button onClick={() => addOriginalPack()}>オリパ補充</button>

      <p>EC顧客側</p>
      <button onClick={() => getEcOrderByCustomer()}>ECオーダー取得</button>
      <button onClick={() => createEcOrderContactByCustomer()}>
        ECお問い合わせ作成
      </button>
      <button onClick={() => generateEcReceipt()}>ECレシート</button>

      <p>EC管理</p>
      <button onClick={() => setEcBanner()}>ECバナー設定</button>

      <p>取引</p>
      <button onClick={() => putTransaction()}>取引変更</button>

      <p>入荷</p>
      <button onClick={() => rollbackStocking()}>入荷の取り消し</button>

      <p>ロス</p>
      <button onClick={() => rollbackLoss()}>ロスの取り消し</button>

      <p>パック開封</p>
      <button onClick={() => rollbackPackOpening()}>
        パック開封の取り消し
      </button>

      <p>商品マスタ</p>
      <button onClick={() => updateItemByApp()}>商品マスタ変更</button>
      <button onClick={() => adjustMarketPrice()}>商品マスタ相場価格</button>
      <button onClick={() => boxOpening()}>ボックス解体</button>
      <button onClick={() => createCartonItem()}>カートンマスタ作成</button>
      <button onClick={() => restockCarton()}>カートン補充</button>
      <button onClick={() => openCarton()}>カートン解体</button>
      <button onClick={() => updateProductImages()}>商品画像更新</button>
      <button onClick={() => updateInfiniteStock()}>無限在庫更新</button>

      <p>棚卸</p>
      <button onClick={() => injectInventoryWholesalePrice()}>
        棚卸仕入れ値注入
      </button>

      <p>管理</p>
      <button onClick={() => createMetricsGraph()}>メトリクスグラフ生成</button>

      <p>チート</p>
      <button onClick={() => stockingAllProducts()}>全出品</button>

      <p>スケジュールタスク</p>
      <button onClick={() => transactionDailyCalculate()}>取引集計</button>

      <p>オチャノコ</p>
      <button onClick={() => ochanokoEmailWebhook()}>オチャノコメール</button>

      <p>予約</p>
      <button onClick={() => createReservation()}>予約作成</button>
      <button onClick={() => updateReservation()}>予約更新</button>
      <button onClick={() => createCustomerReservationReception()}>
        予約受付
      </button>
      <button onClick={() => printReservationReceptionTicket()}>
        予約受付票印刷
      </button>
      <button onClick={() => depositReservation()}>予約受付支払い</button>
      <button onClick={() => returnDepositReservation()}>
        予約受付取り消し
      </button>
      <button onClick={() => receiveReservation()}>予約受け取り</button>
      <button onClick={() => returnTransactionWithReservation()}>
        予約受け取ったものを含めた返品
      </button>

      <p>店舗間在庫移動</p>
      <button onClick={() => setMapping()}>マッピング</button>
      <button onClick={() => createStoreShipment()}>出荷作成</button>
      <button onClick={() => cancelStoreShipment()}>出荷キャンセル</button>
      <button onClick={() => applyStoreShipment()}>出荷適用</button>
      <button onClick={() => rollbackStoreShipment()}>出荷取り消し</button>

      <p>EC POS側</p>
      <button onClick={() => editEcAboutUs()}>ECショップについて編集</button>

      <p>Shopify</p>
      <button onClick={() => createShopifyProduct()}>Shopify商品作成</button>

      <p>ロケーション</p>
      <button onClick={() => createLocation()}>ロケーション作成</button>
      <button onClick={() => releaseLocation()}>ロケーション解放</button>

      <p>デバイス</p>
      <button onClick={() => registerDevice()}>デバイス登録</button>
      <button onClick={() => sendReceiptPrinterCommand()}>
        レシートプリンターにコマンド送信
      </button>
    </main>
  );
}
