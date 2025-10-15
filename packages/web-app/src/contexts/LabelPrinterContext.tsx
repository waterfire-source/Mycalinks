'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  Dispatch,
  SetStateAction,
  useCallback,
  useMemo,
} from 'react';
import { LabelPrinter } from '@/utils/labelPrinter';
import { useStore } from '@/contexts/StoreContext';
import { useLocalStorage } from 'usehooks-ts';
import { MycaPosApiClient } from 'api-generator/client';
import { useErrorAlert } from '@/hooks/useErrorAlert';

export type LabelPrinterOptions = {
  product: {
    price: 'auto' | 'noPrice' | 'withPrice';
  };
  size: '62x29' | '29x42' | '39x48' | '52x29' | '29x42_largePrice'; //[TODO] largePriceとかのカスタムテンプレートの扱いは後で変えるかも
  cut: 'do' | 'not' | 'auto'; // autoは取引で最後の商品をプリントしたら自動で切る
  wholesalePrice: 'do' | 'not'; // 在庫仕入れ値を表示するかどうか
  isManual?: boolean;
  labelTemplate?: string;
};

export type LabelPrinterTemplate = 'product' | 'staff' | 'customer';

interface LabelPrinterContextProps {
  pushQueue: (e: {
    //キューに追加する
    template: LabelPrinterTemplate;
    data: number;
    meta?: {
      isFirstStock?: boolean;
      transactionId?: number; // 取引IDを追加
      isLastItem?: boolean; // 取引の最後のアイテムかどうか
      isManual?: boolean; // 手動印刷かどうか
    };
    specificOptions?: Partial<LabelPrinterOptions>;
  }) => void;
  printQueue: Array<queueType>;
  setPrintQueue: Dispatch<SetStateAction<Array<queueType>>>;
  //実行中かどうか
  setRunning: Dispatch<SetStateAction<boolean>>;
  running: boolean;
  modalOpen: boolean;
  setModalOpen: Dispatch<SetStateAction<boolean>>;
  setOptions: (options: Partial<LabelPrinterOptions>) => void;
  options: LabelPrinterOptions;
  templates: TemplateLabel[];
  handleSizeChange: (value: string) => void;
}

export type queueType = {
  id: number;
  addedAt: Date;
  status: 'pending' | 'printing' | 'error';
  options: LabelPrinterOptions;
  template: LabelPrinterTemplate;
  meta?: {
    isFirstStock?: boolean;
    transactionId?: number; // 取引IDを追加
    isLastItem?: boolean; // 取引の最後のアイテムかどうか
    isManual?: boolean; // 手動印刷かどうか
  };
  data: number;
};

interface TemplateLabel {
  id: number;
  display_name: string;
  url: string | null;
}

const LabelPrinterHistoryContext = createContext<LabelPrinterContextProps>({
  printQueue: [],
  setPrintQueue: () => {},
  pushQueue: () => {},
  setModalOpen: () => {},
  modalOpen: false,
  running: false,
  setRunning: () => {},
  setOptions: () => {},
  options: {
    product: {
      price: 'auto',
    },
    size: '62x29',
    cut: 'do',
    wholesalePrice: 'not',
  },
  templates: [],
  handleSizeChange: () => {},
});

export const LabelPrinterHistoryProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const { store } = useStore();
  const { handleError } = useErrorAlert();
  const [running, setRunning] = useState(false);
  // MycaPosApiClientインスタンスを作成
  const apiClient = useMemo(
    () =>
      new MycaPosApiClient({
        BASE: `${process.env.NEXT_PUBLIC_ORIGIN}/api`,
      }),
    [],
  );
  // 設定からアップロードしたラベルテンプレート
  const [templates, setTemplates] = useState<TemplateLabel[]>([]);

  //印刷キュー
  const [printQueue, setPrintQueue] = useState<Array<queueType>>([]);

  //モーダルの開閉
  const [open, setOpen] = useState(false);

  const [options, setOptions] = useState<LabelPrinterOptions>({
    product: {
      price: 'auto',
    },
    size: '62x29',
    cut: 'do',
    wholesalePrice: 'not',
  });

  //テンプレート ローカルストレージに保存することで恒久的な設定
  const [optionsOnStorage, setOptionsOnStorage] = useLocalStorage<string>(
    'brotherLabelPrinterOptions',
    JSON.stringify(options),
  );

  //optionsOnStorageが変わった時optionsに反映させる
  useEffect(() => {
    setOptions(JSON.parse(optionsOnStorage));
  }, [optionsOnStorage]);

  const setLabelPrinterOptions = useCallback(
    (newValue: Partial<LabelPrinterOptions>) => {
      const newOptions: LabelPrinterOptions = {
        ...options,
        ...newValue,
      };
      setOptionsOnStorage(JSON.stringify(newOptions));
    },
    [options],
  );

  //キューが変更されるたびに、印刷を実行する
  useEffect(() => {
    (async () => {
      //実行中かつ、キューの中身があって、すべてプリント中じゃない場合に一つだけとってプリントする
      if (
        running &&
        printQueue.length &&
        printQueue.every((e) => e.status != 'printing')
      ) {
        const printTarget = printQueue[0];
        console.log(printTarget, 'のプリント開始');

        //印刷中にステータスを変更する
        setPrintQueue((prev) =>
          prev.map((e) =>
            e.id == printTarget.id ? { ...e, status: 'printing' } : e,
          ),
        );

        //プリントを実行
        try {
          if (!store) throw new Error();

          // カット設定がautoの場合、取引の最後のアイテムかどうかでカット設定を決定
          const printOptions = { ...printTarget.options };
          if (printOptions.cut === 'auto') {
            printOptions.cut = printTarget.meta?.isLastItem ? 'do' : 'not';
          }

          const res = await LabelPrinter.doPrint(
            printOptions,
            printTarget.template,
            printTarget.data,
            store.id,
          );

          if (!res) throw new Error();

          //上手くいったら

          //キューから印刷したものを削除する（コールバックを使うことで、整合性を保つ）
          setPrintQueue((prev) => prev.filter((e) => e.id != printTarget.id));
        } catch {
          alert('ラベルプリント中にエラーが発生しました');
          setOpen(true); //モーダルを開く
          setRunning(false); //実行中止

          //該当のレコードをエラー状態に
          setPrintQueue((prev) =>
            prev.map((e) =>
              e.id == printTarget.id ? { ...e, status: 'error' } : e,
            ),
          );
        }
      }
      //実行中なのにキューの中身がない場合は実行完了にする
      else if (running && !printQueue.length) {
        setRunning(false);
      }
    })();
  }, [printQueue, running]);

  //キューにデータを追加する（この時、在庫ラベルのautoをwidhPriceなどに書き換える）
  const pushQueue = useCallback(
    ({
      template,
      data,
      meta,
      specificOptions,
    }: {
      template: LabelPrinterTemplate;
      data: number;
      meta?: {
        isFirstStock?: boolean;
        transactionId?: number; // 取引IDを追加
        isLastItem?: boolean; // 取引の最後のアイテムかどうか
        isManual?: boolean; // 手動印刷かどうか
      };
      specificOptions?: Partial<LabelPrinterOptions>;
    }) => {
      const thisOptions = specificOptions
        ? {
            ...options,
            ...specificOptions,
          }
        : structuredClone(options);

      //在庫テンプレートだった場合、
      if (template == 'product') {
        //autoかどうかみる
        if (thisOptions.product.price == 'auto') {
          //最初の在庫だったらこれをwithPriceに変える
          if (meta && meta.isFirstStock) {
            thisOptions.product.price = 'withPrice';
          } else {
            thisOptions.product.price = 'noPrice';
          }
        }
      }

      //IDを割り当てつつ、キューに追加する
      setPrintQueue((prev) =>
        prev.concat({
          addedAt: new Date(),
          options: thisOptions,
          template,
          data,
          meta: {
            ...meta,
          },
          status: 'pending',
          id: prev.reduce((curMax, b) => Math.max(curMax, b.id), 0) + 1, //最大値+1をIDとする
        }),
      );

      //ついでにモーダルを開く
      setOpen(true);
      //ついでに実行する
      setRunning(true);
    },
    [printQueue, options],
  );

  // テンプレート一覧を取得
  const fetchTemplates = useCallback(async () => {
    if (!store?.id) return;

    try {
      const data = await apiClient.template.getTemplate({
        storeId: store.id,
        kind: 'LABEL_PRINTER',
      });

      // APIレスポンスをTemplateLabelインターフェースに変換
      const convertedTemplates: TemplateLabel[] = (data.templates || []).map(
        (template) => ({
          id: template.id,
          display_name: template.display_name,
          url: template.url,
        }),
      );

      setTemplates(convertedTemplates);
    } catch (error) {
      handleError(error);
    }
  }, [store?.id, apiClient, handleError]);

  // モーダルを開くたびにテンプレートを取得
  useEffect(() => {
    if (!open) return;

    try {
      fetchTemplates();
    } catch (error) {
      handleError(error);
    }
  }, [handleError, open]);

  const handleSizeChange = (value: string) => {
    const extension = value.split('.').pop()?.toLowerCase();

    if (extension === 'lbx') {
      // .lbx ファイルの場合
      setOptions({
        ...options,
        labelTemplate: value,
      });
    } else {
      // 通常の処理
      setOptions({
        ...options,
        size: value as typeof options.size,
      });
    }
  };

  return (
    <LabelPrinterHistoryContext.Provider
      value={{
        printQueue,
        pushQueue,
        setModalOpen: setOpen,
        modalOpen: open,
        setRunning,
        setPrintQueue,
        setOptions: setLabelPrinterOptions,
        options,
        running,
        templates,
        handleSizeChange,
      }}
    >
      {children}
    </LabelPrinterHistoryContext.Provider>
  );
};

export const useLabelPrinterHistory = () =>
  useContext(LabelPrinterHistoryContext);
