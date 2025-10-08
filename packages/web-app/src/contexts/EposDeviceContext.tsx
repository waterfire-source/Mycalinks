'use client';

//EPSONのPOSデバイスを管理するコンテキスト

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  Dispatch,
  SetStateAction,
  useCallback,
} from 'react';
import { EposClient, EposEventArgs } from '@/utils/epos';
import { useLocalStorage } from 'usehooks-ts';
import { useAlert } from '@/contexts/AlertContext';
import { MycaPosApiClient } from 'api-generator/client';
import { DeviceType } from '@prisma/client';
import { useStore } from '@/contexts/StoreContext';
import { useStoreEvent } from '@/contexts/StoreEventContext';
import { ApiEventObj } from 'backend-core';

export type ePosConnStatus = '未接続' | '接続エラー' | '利用可能' | string;

type ePosConnStatusObj = {
  ePosDev: ePosConnStatus;
  display: ePosConnStatus;
  printer: ePosConnStatus;
};

interface EposDeviceContextProps {
  ePosDev: EposClient | null;
  setSerialCode: Dispatch<SetStateAction<string>>;
  serialCode: string;
  connectionMode: 'connector' | 'lan' | 'child';
  setConnectionMode: Dispatch<SetStateAction<'connector' | 'lan' | 'child'>>;
  remoteDeviceId: string;
  parentDeviceId: string;
  registerAsParentDevice: () => void;
  mycalinksConnectorPort: string;
  setMycalinksConnectorPort: Dispatch<SetStateAction<string>>;
  modalOpen: boolean;
  setModalOpen: Dispatch<SetStateAction<boolean>>;
  setUpEpos: () => Promise<boolean | undefined> | void;
  status: ePosConnStatusObj;
}

const EposDeviceContext = createContext<EposDeviceContextProps>({
  ePosDev: null,
  setSerialCode: () => {},
  serialCode: '',
  connectionMode: 'lan',
  setConnectionMode: () => {},
  mycalinksConnectorPort: '8080',
  setMycalinksConnectorPort: () => {},
  modalOpen: false,
  setModalOpen: () => {},
  remoteDeviceId: '',
  parentDeviceId: '',
  registerAsParentDevice: () => {},
  setUpEpos: () => {},
  status: {
    ePosDev: '未接続',
    display: '未接続',
    printer: '未接続',
  },
});

export const EposDeviceProvider = ({ children }: { children: ReactNode }) => {
  //接続状況など
  const [status, setStatus] = useState<ePosConnStatusObj>({
    ePosDev: '未接続',
    display: '未接続',
    printer: '未接続',
  });

  //ePosDev
  const [ePosDev, setEposDev] = useState<EposClient | null>(null);
  const { setAlertState } = useAlert();

  //モーダルの開閉
  const [open, setOpen] = useState(false);

  //シリアルコード
  const [serialCode, setSerialCode] = useLocalStorage('eposSerialCode', '');

  //コネクションのモード
  const [connectionMode, setConnectionMode] = useLocalStorage<
    'connector' | 'lan' | 'child'
  >('eposConnectionMode', 'lan');

  //Mycalinksコネクタの待機ポート
  const [mycalinksConnectorPort, setMycalinksConnectorPort] = useLocalStorage(
    'mycalinksConnectorEposPort',
    '8080',
  );

  //[TODO] この辺りカスタムフックに切り出したい

  //親機のID（これがリモートのものと一致してた場合、親機モードで作動する）
  const [parentDeviceId, setParentDeviceId] = useLocalStorage(
    'eposParentDeviceId',
    '',
  );

  //リモート上に登録されているID
  const [remoteDeviceId, setRemoteDeviceId] = useState('');

  const { store } = useStore();

  useEffect(() => {
    (async () => {
      const apiClient = new MycaPosApiClient({
        BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
      });
      const res = await apiClient.device.getDevice({
        storeId: store.id,
        type: DeviceType.RECEIPT_PRINTER,
      });

      setRemoteDeviceId(res.devices.length ? String(res.devices[0].id) : '');
    })();
  }, [store]);

  //親機として登録する
  const registerAsParentDevice = async () => {
    //レシートプリンターには接続していないといけない
    if (!ePosDev?.devices.printer) {
      setAlertState({
        message:
          '親機として設定するにはレシートプリンターに接続されている必要があります',
        severity: 'error',
      });
      return;
    }

    const apiClient = new MycaPosApiClient({
      BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
    });
    const createRes = await apiClient.device.registerDevice({
      storeId: store.id,
      requestBody: {
        type: DeviceType.RECEIPT_PRINTER,
      },
    });

    setParentDeviceId(String(createRes.id));
    setRemoteDeviceId(String(createRes.id));
  };

  //子機からの印刷リクエスト
  useStoreEvent(
    'receiptPrinterCommand',
    useCallback(
      (event: ApiEventObj.ReceiptPrinterCommand) => {
        (async () => {
          console.log(
            '印刷イベントきました',
            event,
            connectionMode,
            parentDeviceId,
          );

          //自分が親機で、IDが一緒だったら印刷を試みる
          if (
            connectionMode !== 'child' &&
            ePosDev?.devices.printer &&
            parentDeviceId === String(event.device_id)
          ) {
            await ePosDev.printWithCommand(event.command, event.store_id);
          }
        })();
      },
      [connectionMode, parentDeviceId, ePosDev],
    ),
  );

  //ステータスの変更を監視 これはレシートプリンターが利用できるようになったか、利用できないようになった時にのみ呼ばれる
  const handleChangePrinterStatus = (event: EposEventArgs) => {
    //アクションだったら
    switch (event.type) {
      case 'actionFailed':
        setAlertState({
          message: event.description,
          severity: 'error',
        });
        break;

      case 'statusChange': {
        const printerStatus = event.status.printer;
        //プリンターとの接続が切れたらアラートを出しつつ、ステータスも変える

        if (!printerStatus.canPrint) {
          setAlertState({
            message: `プリンターが利用できません ${
              !printerStatus.power ? '電源が入っていません ' : ''
            }${!printerStatus.cover ? 'カバーが開いています ' : ''}${
              !printerStatus.paper ? '用紙が入っていないです' : ''
            }`,
            severity: 'error',
          });
          setStatus((prev) => ({
            ...prev,
            printer: '接続エラー',
          }));
        } else {
          setAlertState({
            message: `プリンターが利用できるようになりました`,
            severity: 'success',
          });
          setStatus((prev) => ({
            ...prev,
            printer: '利用可能',
          }));
        }

        break;
      }
    }
  };

  //セットアップ
  const setUpEpos = async () => {
    setStatus((prev) => ({
      ePosDev: '未接続',
      display: '未接続',
      printer: '未接続',
    }));

    let isAllOk = true;

    switch (connectionMode) {
      case 'lan': {
        if (!serialCode) {
          // alert('レシートプリンターのシリアルコードを設定してください');
          console.error('レシートプリンターのシリアルコードを設定してください');
          return;
        }
        break;
      }
      case 'connector': {
        if (!mycalinksConnectorPort) {
          console.error('Mycalinksコネクタのポートを設定してください');
          return;
        }
        break;
      }
      case 'child': {
        if (!remoteDeviceId) {
          console.error('親機のIDが設定されていません');
          return;
        }
        break;
      }
    }

    //すでに接続されているかどうか

    setStatus((prev) => ({
      ...prev,
      ePosDev: '接続中',
      display: '接続中',
      printer: '接続中',
    }));

    const instance = new EposClient({
      connectionMode,
      port: mycalinksConnectorPort,
      serialCode,
    });

    try {
      //セットアップを行う
      await instance.setUp();

      setStatus((prev) => ({
        ...prev,
        ePosDev: '利用可能',
      }));

      setAlertState({
        message: 'プリンターとの接続に成功しました',
        severity: 'success',
      });
    } catch (e: any) {
      // alert(e.message);
      console.error('ePOSネットワークへの接続に失敗しました');
      isAllOk = false;
      setStatus((prev) => ({
        ...prev,
        ePosDev: '接続エラー',
      }));

      setAlertState({
        message: 'プリンターとの接続に失敗しました',
        severity: 'error',
      });
      return;
    }

    //それぞれのデバイスに接続

    //プリンター
    //競合する可能性があるため、一旦ここでは接続しないことにする

    await instance.createDevice('printer', handleChangePrinterStatus);
    if (instance.devices.printer) {
      setStatus((prev) => ({
        ...prev,
        printer: '利用可能',
      }));
    } else {
      isAllOk = false;
      setStatus((prev) => ({
        ...prev,
        printer: '接続エラー',
      }));
    }

    //カスタマーディスプレイ
    await instance.createDevice('display');
    if (instance.devices.display) {
      setStatus((prev) => ({
        ...prev,
        display: '利用可能',
      }));
    } else {
      isAllOk = false;
      setStatus((prev) => ({
        ...prev,
        display: '接続エラー',
      }));
    }

    console.log(instance);

    setEposDev(instance);
    return isAllOk;
  };

  //最初にePosに接続する
  //接続できなかったら再セットアップ
  useEffect(() => {
    (async () => {
      setTimeout(async () => {
        const res = await setUpEpos();

        if (!res) {
          setTimeout(setUpEpos, 3000);
        }
      }, 2000);
    })();
  }, [connectionMode, remoteDeviceId]);

  return (
    <EposDeviceContext.Provider
      value={{
        ePosDev,
        setSerialCode,
        serialCode,
        connectionMode,
        setConnectionMode,
        mycalinksConnectorPort,
        setMycalinksConnectorPort,
        remoteDeviceId,
        parentDeviceId,
        registerAsParentDevice,
        setModalOpen: setOpen,
        modalOpen: open,
        setUpEpos,
        status,
      }}
    >
      {children}
    </EposDeviceContext.Provider>
  );
};

export const useEposDevice = () => useContext(EposDeviceContext);
