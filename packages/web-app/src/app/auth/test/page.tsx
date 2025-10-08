'use client';

import { createClientAPI } from '@/api/implement';
import { useEposDevice } from '@/contexts/EposDeviceContext';
import { Box, TextField } from '@mui/material';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';

import { useLabelPrinterHistory } from '@/contexts/LabelPrinterContext';

import FormWrapper from '@/app/auth/test/form';

export default function AuthPage() {
  const { data: session, status } = useSession();
  const { pushQueue: pushLabelPrinterQueue } = useLabelPrinterHistory();

  // const { signIn, getUserId } = useAppAuth();

  const { ePosDev } = useEposDevice();
  const runAPI = async (): Promise<void> => {
    const apiClient = createClientAPI();

    // const res = await apiClient.ec.updateAppAccountInfo({
    //   displayName: '田中太郎',
    // });

    // if (res instanceof CustomError) return alert('エラー');

    // console.log(await getUserId());

    // const receiptCommand = res.receiptCommand;
    // console.log(receiptCommand);

    // ePosDev?.printWithCommand(receiptCommand);

    // const res = await fetch(
    //   '/api/ec/order?includesShippingMethodCandidates=true&includesPaymentMethodCandidates=true',
    //   {
    //     method: 'POST',
    //     body: JSON.stringify({
    //       shipping_address_prefecture: '茨城県',
    //       cart_stores: [
    //         {
    //           store_id: 3,
    //           shipping_method_id: 1,
    //           products: [
    //             {
    //               product_id: 561424,
    //               original_item_count: 2,
    //             },
    //             {
    //               product_id: 561425,
    //               original_item_count: 5,
    //             },
    //           ],
    //         },
    //       ],
    //     }),
    //     headers: {
    //       'Content-Type': 'application/json',
    //       // Authorization: `Basic ZXBzb246WEJYUTAwMjk2NQ==`,
    //     },
    //   },
    // );

    const res = await fetch('/api/store/1/ec/publish-all-products', {
      method: 'POST',
      body: JSON.stringify({
        // token: 'IjM0YjRlMGE1LTRjOTktNDA0MC1iMGQyLTkyNDE2NTUxZTYxMSI=',
        // corporation: {
        //   name: '齊田法人',
        //   ceo_name: 'CEO名',
        //   head_office_address: '住所',
        //   phone_number: '070-4487-4072',
        // },
        // account: {
        //   email: 'saidajunki+02@gmail.com',
        // },
        // card: {
        //   token:
        //     'e4fe4053708b962cb041c5c15f0d24f92631a254c81b389a9464b44057fe5c1c',
        // },
      }),
      headers: {
        'Content-Type': 'application/json',
        // Authorization: `Basic ZXBzb246WEJYUTAwMjk2NQ==`,
      },
    });

    // const res = await fetch('/api/contract/pay', {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     token: 'IjM0YjRlMGE1LTRjOTktNDA0MC1iMGQyLTkyNDE2NTUxZTYxMSI=',
    //     corporation: {
    //       name: '齊田法人',
    //       ceo_name: 'CEO名',
    //       head_office_address: '住所',
    //       phone_number: '070-4487-4072',
    //     },
    //     account: {
    //       email: 'saidajunki+02@gmail.com',
    //     },
    //     card: {
    //       token:
    //         'e4fe4053708b962cb041c5c15f0d24f92631a254c81b389a9464b44057fe5c1c',
    //     },
    //   }),
    //   headers: {
    //     'Content-Type': 'application/json',
    //     // Authorization: `Basic ZXBzb246WEJYUTAwMjk2NQ==`,
    //   },
    // });

    // const res = await fetch('/api/ec/order/27/pay', {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     payment_method: 'CASH_ON_DELIVERY',
    //     total_price: 10550,
    //   }),
    //   headers: {
    //     'Content-Type': 'application/json',
    //     // Authorization: `Basic ZXBzb246WEJYUTAwMjk2NQ==`,
    //   },
    // });

    // const res = await fetch('/api/ec/contact', {
    //   method: 'POST',
    //   body: JSON.stringify({
    //     kind: 'お問い合わせ種類',
    //     content: 'お問い合わせ本文',
    //   }),
    //   headers: {
    //     'Content-Type': 'application/json',
    //     // Authorization: `Basic ZXBzb246WEJYUTAwMjk2NQ==`,
    //   },
    // });

    // const res = await fetch('/api/ec/order', {
    //   method: 'GET',
    //   // body: JSON.stringify({
    //   //   payment_method: EcPaymentMethod.CASH_ON_DELIVERY,
    //   //   total_price: 10250,
    //   // }),
    //   // headers: {
    //   //   'Content-Type': 'application/json',
    //   //   // Authorization: `Basic ZXBzb246WEJYUTAwMjk2NQ==`,
    //   // },
    // });

    // if (res instanceof CustomError) return alert('エラー');

    // const resJson = await res.json();
    // console.log(resJson);
    console.log(res);

    // const receiptCommand = res.receiptCommand;
    // console.log(receiptCommand);

    // ePosDev?.printWithCommand(receiptCommand);

    // try {
    //   const res = await fetch('https://api.aisin-lls.com/v1/auth/login', {
    //     method: 'POST',
    //     body: JSON.stringify({}),
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //   });

    //   const resJson = await res.json();

    //   console.log(resJson);
    // } catch (e) {
    //   console.log(e);
    // }

    // pushLabelPrinterQueue({
    //   template: 'product',
    //   data: 120,
    //   meta: {
    //     isFirstStock: Boolean(Math.round(Math.random())),
    //   },
    // });
  };

  const pin = async (): Promise<void> => {
    const apiClient = createClientAPI();

    const res = await fetch('/api/store/1/', {
      method: 'PUT',
      body: JSON.stringify({
        point_setting: true,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const resJson = await res.json();

    console.log(resJson);
  };

  //ラベルプリンターの検証
  const [labelPrinterPreviewSrc, setLabelPrinterPreviewSrc] = useState<
    undefined | string
  >(undefined);
  // const runLabelPrinter = async (): Promise<void> => {
  //   //テストプリント
  //   const res = await LabelPrinter.doPrint('productLabel', {
  //     product_code: '4280000000111',
  //     display_name: 'テスト商品名',
  //   });

  //   if (res) {
  //     setLabelPrinterPreviewSrc(res.src);
  //   }
  // };

  const createCorp = async () => {
    if (!corpEmail) return;

    const res = await fetch('/api/corporation', {
      method: 'POST',
      body: JSON.stringify({
        email: corpEmail,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const resJson = await res.json();

    console.log(resJson);
  };

  const [corpEmail, setCorpEmail] = useState('');

  const createStore = async () => {
    if (!storeEmail || !corpId) return;

    const res = await fetch('/api/store', {
      method: 'POST',
      body: JSON.stringify({
        email: storeEmail,
        corporation_id: corpId,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const resJson = await res.json();

    console.log(resJson);
  };

  const [storeEmail, setStoreEmail] = useState('');
  const [corpId, setCorpId] = useState(0);

  const activateStore = async () => {
    if (!storeCode) return;

    const res = await fetch('/api/store/activate', {
      method: 'POST',
      body: JSON.stringify({
        code: storeCode,
        password: storePassword,
      }),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const resJson = await res.json();

    console.log(resJson);
  };

  const [storeCode, setStoreCode] = useState('');
  const [storePassword, setStorePassword] = useState('');

  const fileAPI = async (): Promise<void> => {
    console.log(fileInfo.data);
    const formData = new FormData();

    if (fileInfo.data) {
      formData.append('file', fileInfo.data);
    }

    const res = await fetch('/api/store/1/item/csv/', {
      method: 'POST',
      headers: {},
      body: formData,
    });

    console.log(await res.json());
  };

  const [fileInfo, setFileInfo] = useState<{
    name?: string;
    data?: File | null;
  }>({});

  const [settlementId, setSettlementId] = useState(0);

  return (
    <main>
      <h2>テスト用ページ</h2>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}></Box>

      <button onClick={() => signOut()}>ログアウト</button>

      {!process.env.NEXT_PUBLIC_ORIGIN?.includes('public') && (
        <>
          <TextField
            size="small"
            sx={{ width: 100 }}
            onChange={(e) => setSettlementId(Number(e.target.value))}
            value={settlementId}
          ></TextField>
          <button onClick={() => runAPI()}>API</button>
          <br />
        </>
      )}

      {!process.env.NEXT_PUBLIC_ORIGIN?.includes('public') && (
        <>
          <TextField
            size="small"
            label="email"
            sx={{ width: 200 }}
            onChange={(e) => setCorpEmail(String(e.target.value))}
            value={corpEmail}
          ></TextField>
          <button onClick={() => createCorp()}>Corp作成</button>
          <br />

          <TextField
            size="small"
            label="corpId"
            sx={{ width: 50 }}
            onChange={(e) => setCorpId(Number(e.target.value))}
            value={corpId}
          ></TextField>
          <TextField
            size="small"
            label="email"
            sx={{ width: 200 }}
            onChange={(e) => setStoreEmail(String(e.target.value))}
            value={storeEmail}
          ></TextField>
          <button onClick={() => createStore()}>Store作成</button>
          <br />

          <TextField
            size="small"
            label="storeCode"
            sx={{ width: 200 }}
            onChange={(e) => setStoreCode(String(e.target.value))}
            value={storeCode}
          ></TextField>
          <TextField
            size="small"
            label="password"
            sx={{ width: 200 }}
            onChange={(e) => setStorePassword(String(e.target.value))}
            value={storePassword}
          ></TextField>
          <button onClick={() => activateStore()}>ストアアクティベート</button>
          <br />
        </>
      )}

      <FormWrapper />
    </main>
  );
}
