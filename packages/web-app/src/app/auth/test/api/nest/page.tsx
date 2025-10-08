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
  const test = async () => {
    const res = await fetch(
      'http://localhost:3040/v2/admin/announcement',
      // 'https://staging.api.mycalinks.io/v2/announcement',
      {
        method: 'POST',
        body: JSON.stringify({
          und: 12,
          title: 'タイトル',
          url: 'https://www.google.com',
          target_day: new Date('2025-09-14'),
          publish_at: new Date('2025-09-14'),
          kind: 'UPDATE',
          content: `内容`,
          target: 'ALL',
          status: 'PUBLISHED',
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

  return (
    <main>
      <h2>API検証</h2>

      <p>お知らせ</p>
      <button onClick={() => test()}>お知らせ作成</button>
    </main>
  );
}
