'use client';
//仮で作ったコンポーネント 後で見直しが必要そう

import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  FormControlLabel,
  Checkbox,
} from '@mui/material';
import { MuiFileInput } from 'mui-file-input';
import { useStore } from '@/contexts/StoreContext';
import { useLabelPrinterHistory } from '@/contexts/LabelPrinterContext';
import { createClientAPI, CustomError } from '@/api/implement';
import { useAlert } from '@/contexts/AlertContext';
import SecondaryButton from '@/components/buttons/SecondaryButton';
import PrimaryButton from '@/components/buttons/PrimaryButton';
import { ProductAPI } from '@/api/frontend/product/api';
import { ItemAPI } from '@/api/frontend/item/api';
import { posCommonConstants } from 'common';
import { HelpIcon } from '@/components/common/HelpIcon';
const clientAPI = createClientAPI();

const { csvTemplateKinds } = posCommonConstants;

//現在、CSVファイルアップロードを行うのはitemとstocking
interface FileUploadCardProps {
  kind: keyof typeof csvTemplateKinds;
}

const FileUploadCard: React.FC<FileUploadCardProps> = ({ kind }) => {
  //ファイルデータ
  const [fileInfo, setFileInfo] = useState<{
    name?: string;
    data?: File | null;
  }>({});

  //ファイルデータが変更されたら
  const handleChange = (newFile: File | null) => {
    setFileInfo({ ...fileInfo, data: newFile });
  };

  //アップロード中フラグ
  const [uploading, setUploading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  //定義
  const [def, setDef] = useState<{
    label: string;
    options: Record<string, string>;
  }>({
    label: '',
    options: {},
  });

  const [checkedOptions, setCheckedOptions] = useState<Record<string, boolean>>(
    {},
  );

  useEffect(() => {
    setDef(csvTemplateKinds[kind]);
  }, [kind]);

  const { setAlertState } = useAlert();

  const { pushQueue } = useLabelPrinterHistory();

  const { store } = useStore();

  //ラベルプリンター
  // const { pushQueue } = useLabelPrinterHistory();

  //アップロードする関数
  const handleUpload = async () => {
    setUploading(true);

    let res:
      | ProductAPI['uploadCsv']['response']
      | ItemAPI['uploadCsv']['response']
      | CustomError;

    switch (kind) {
      case 'item':
        res = await clientAPI.item.uploadCsv({
          storeID: store?.id,
          body: {
            json: {
              options: checkedOptions,
            },
            file: fileInfo.data!,
          },
        });
        break;
      case 'product':
        res = await clientAPI.product.uploadCsv({
          storeID: store?.id,
          body: {
            json: {
              options: checkedOptions,
            },
            file: fileInfo.data!,
          },
        });
        break;
      default:
        res = new CustomError('エラー', 400);
    }

    // エラー時はアラートを出して早期return
    if (res instanceof CustomError) {
      setAlertState({
        message: `${res.status}:${res.message}`,
        severity: 'error',
      });
      setUploading(false);
      return;
    }

    if ('ok' in res) {
      //ラベル印刷する必要があるかどうか精査
      if ('productsToPrint' in res && res.productsToPrint) {
        //プリントデータを見ていく
        for (const product of res.productsToPrint) {
          const productId = product.id;
          const printCount =
            product.specificPrintCount ?? product.stock_number ?? 1;
          const stockNumber = product.stock_number ?? 0;

          let isFirstStock = stockNumber <= printCount;

          for (let i = 0; i < printCount; i++) {
            pushQueue({
              template: 'product',
              data: productId,
              meta: {
                isFirstStock,
                isManual: true,
              },
              ...(product.cuttingOption
                ? {
                    specificOptions: {
                      cut: product.cuttingOption,
                      product: {
                        price: product.productPrintOption,
                      },
                    },
                  }
                : null),
            });
            isFirstStock = false; //2枚目以降はfalseで
          }
        }
      }

      //エラーのやつがあったらそれを表示する
      if ('errorInfo' in res && res.errorInfo.fileUrl) {
        alert(`
一部の行でエラーが発生しました
成功:${res.errorInfo.successCount} 件
失敗:${res.errorInfo.errorCount} 件
失敗した行のCSVファイルのダウンロードが開始されます
原因は各行の後ろに記してあります`);
        window.location.href = res.errorInfo.fileUrl;
        setUploading(false);
        return;
      }

      alert(`処理が完了しました
成功:${res.errorInfo.successCount} 件`);
    }

    setUploading(false);
  };

  const handleDownloadTemplate = async () => {
    // setIsDownloading(true);

    // const res = await clientAPI.item.getCsvFile({ storeID: store.id });

    // // エラー時はアラートを出して早期return
    // if (res instanceof CustomError) {
    //   setAlertState({
    //     message: `${res.status}:${res.message}`,
    //     severity: 'error',
    //   });
    //   return;
    // }

    // setIsDownloading(false);

    const templateUrl = `/templates/csv/${kind}.csv`;

    window.location.href = templateUrl;
  };

  return (
    <Card>
      <Typography
        sx={{
          backgroundColor: 'grey.700',
          color: 'text.secondary',
          padding: '16px',
          textAlign: 'left',
          borderBottomRightRadius: '0',
          borderBottomLeftRadius: '0',
        }}
      >
        ファイル選択
      </Typography>
      <CardContent sx={{ backgroundColor: 'common.white' }}>
        <Box
          display="flex"
          justifyContent="space-between"
          // mb={0.5}
          sx={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            paddingLeft: '10px',
            paddingRight: '10px',
            gap: '2px',
          }}
        >
          <Box
            sx={{
              width: '20%',
              backgroundColor: 'grey.500',
              padding: '16px',
            }}
          >
            <Typography
              sx={{
                textAlign: 'center',
                width: '100%',
                color: 'text.secondary',
              }}
            >
              CSVファイル
            </Typography>
          </Box>
          <MuiFileInput
            value={fileInfo.data}
            placeholder="ファイルを選択してください"
            onChange={handleChange}
            sx={{
              width: '80%',
              backgroundColor: 'grey.100',
              border: '1px solid grey',
            }}
          />
        </Box>
        <Box
          display="flex"
          justifyContent="space-between"
          mb={4}
          sx={{
            display: 'flex',
            flexDirection: 'row',
            width: '100%',
            mt: 1,
            paddingLeft: '10px',
            paddingRight: '10px',
            gap: '2px',
          }}
        >
          <Box
            sx={{
              width: '20%',
              backgroundColor: 'grey.500',
              padding: '16px',
            }}
          >
            <Typography
              sx={{
                textAlign: 'center',
                width: '100%',
                color: 'text.secondary',
              }}
            >
              対象データ
            </Typography>
          </Box>
          <Box
            sx={{
              width: '80%',
              backgroundColor: 'grey.100',
              border: '1px solid grey',
              display: 'flex',
              alignItems: 'center',
              flexFlow: 'row wrap',
            }}
          >
            {Object.entries(def.options).map(([key, value]) => (
              <FormControlLabel
                key={key}
                control={
                  <Checkbox
                    checked={checkedOptions[key] || false}
                    onChange={(e) =>
                      setCheckedOptions({
                        ...checkedOptions,
                        [key]: e.target.checked,
                      })
                    }
                  />
                }
                label={value}
                sx={{ ml: 2 }}
              />
            ))}
          </Box>
        </Box>

        <Box
          display="flex"
          justifyContent="start"
          mb={2}
          gap="10px"
          width={200}
        >
          <PrimaryButton
            disabled={uploading}
            sx={{ width: '100%' }}
            onClick={handleUpload}
          >
            {!uploading ? 'アップロード' : <CircularProgress size={20} />}
          </PrimaryButton>
          {kind === 'item' ? (
            <HelpIcon helpArchivesNumber={1060} />
          ) : (
            <HelpIcon helpArchivesNumber={2469} />
          )}
        </Box>
        <Box
          display="grid"
          justifyContent="start"
          gridTemplateColumns="350px 350px 350px"
          mb={2}
          gap="10px"
        >
          <Box key={kind} display="flex" justifyContent="start">
            <SecondaryButton onClick={handleDownloadTemplate}>
              {isDownloading ? (
                <CircularProgress size={20} />
              ) : (
                'テンプレートダウンロード'
              )}
            </SecondaryButton>
            <HelpIcon helpArchivesNumber={2230} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default FileUploadCard;
