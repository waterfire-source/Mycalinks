'use client';

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { useAppAuth } from '@/providers/useAppAuth';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import LockIcon from '@mui/icons-material/Lock';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import CloseIcon from '@mui/icons-material/Close';
import { ecImplement } from '@/api/frontend/ec/implement';
import { CustomError } from '@/api/implement';
import Image from 'next/image';
import endedCheck from '@/assets/images/ended_check.png';
import { useAlert } from '@/contexts/AlertContext';

const uniqueStyles = {
  settingListField: {
    p: 1, // padding: 8px
    width: '100%',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  eachSettingField: {
    borderBottom: '0.5px solid #ccc', // thinGray に置き換え可
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 2.5, // gap: 20px ≒ 2.5rem
    p: 1.625, // padding: 13px
  },
  settingTitleField: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftArrow: {
    position: 'absolute',
    left: 0,
  },
  infoField: {
    m: 3.75, // margin: 30px
    display: 'flex',
    flexDirection: 'column',
    gap: 1.125, // gap: 9px
  },
};

//設定項目などをデータで管理する
const settingMenuList = [
  {
    title: '基本情報　確認・編集',
    titleOnEdit: '基本情報の編集',
    icon: <PersonIcon />,
    handle: 'personalInfomation',
    properties: [
      //設定する項目リスト このhandleはすべての設定項目において一意にする
      {
        label: '表示名',
        handle: 'display_name',
        inputType: 'text',
        isEdit: true,
      },
      {
        label: 'お名前',
        handle: 'full_name',
        inputType: 'text',
        isEdit: true,
      },
      {
        label: 'メールアドレス',
        handle: 'mail',
        inputType: 'text',
        isEdit: true,
      },
      {
        label: 'フリガナ',
        handle: 'full_name_ruby',
        inputType: 'text',
        isEdit: true,
      },
      {
        label: '生年月日',
        labelOnEdit: '生年月日（YYYY-MM-DD）',
        handle: 'birthday',
        inputType: 'text',
        isEdit: true,
      },
      {
        label: '電話番号',
        labelOnEdit: '電話番号（ハイフンなし）',
        handle: 'phone_number',
        inputType: 'text',
        isEdit: true,
      },
      {
        label: '性別',
        labelOnEdit: '性別（選択）',
        handle: 'gender',
        inputType: 'select',
        isEdit: true,
        options: [
          {
            label: '男',
            value: '男',
          },
          {
            label: '女',
            value: '女',
          },
          {
            label: 'その他',
            value: 'その他',
          },
        ],
      },
      {
        label: 'ご職業',
        labelOnEdit: 'ご職業（選択）',
        handle: 'career',
        isEdit: true,
        inputType: 'select',
        options: [
          {
            label: '会社員',
            value: '会社員',
          },
          {
            label: '公務員',
            value: '公務員',
          },
          {
            label: '自営業',
            value: '自営業',
          },
          {
            label: '主婦',
            value: '主婦',
          },
          {
            label: '学生',
            value: '学生',
          },
          {
            label: 'その他',
            value: 'その他',
          },
        ],
      },
    ],
  },
  {
    title: 'ご登録住所　確認・編集',
    titleOnEdit: 'ご住所の編集',
    icon: <LocationOnIcon />,
    handle: 'addressInformation',
    properties: [
      //設定する項目リスト このhandleはすべての設定項目において一意にする
      {
        label: '郵便番号',
        handle: 'zip_code',
        isEdit: true,
        inputType: 'text',
      },
      {
        label: '都道府県',
        handle: 'prefecture',
        isEdit: true,
        inputType: 'select',
        options: [
          { label: '北海道', value: '北海道' },
          { label: '青森県', value: '青森県' },
          { label: '岩手県', value: '岩手県' },
          { label: '宮城県', value: '宮城県' },
          { label: '秋田県', value: '秋田県' },
          { label: '山形県', value: '山形県' },
          { label: '福島県', value: '福島県' },
          { label: '茨城県', value: '茨城県' },
          { label: '栃木県', value: '栃木県' },
          { label: '群馬県', value: '群馬県' },
          { label: '埼玉県', value: '埼玉県' },
          { label: '千葉県', value: '千葉県' },
          { label: '東京都', value: '東京都' },
          { label: '神奈川県', value: '神奈川県' },
          { label: '新潟県', value: '新潟県' },
          { label: '富山県', value: '富山県' },
          { label: '石川県', value: '石川県' },
          { label: '福井県', value: '福井県' },
          { label: '山梨県', value: '山梨県' },
          { label: '長野県', value: '長野県' },
          { label: '岐阜県', value: '岐阜県' },
          { label: '静岡県', value: '静岡県' },
          { label: '愛知県', value: '愛知県' },
          { label: '三重県', value: '三重県' },
          { label: '滋賀県', value: '滋賀県' },
          { label: '京都府', value: '京都府' },
          { label: '大阪府', value: '大阪府' },
          { label: '兵庫県', value: '兵庫県' },
          { label: '奈良県', value: '奈良県' },
          { label: '和歌山県', value: '和歌山県' },
          { label: '鳥取県', value: '鳥取県' },
          { label: '島根県', value: '島根県' },
          { label: '岡山県', value: '岡山県' },
          { label: '広島県', value: '広島県' },
          { label: '山口県', value: '山口県' },
          { label: '徳島県', value: '徳島県' },
          { label: '香川県', value: '香川県' },
          { label: '愛媛県', value: '愛媛県' },
          { label: '高知県', value: '高知県' },
          { label: '福岡県', value: '福岡県' },
          { label: '佐賀県', value: '佐賀県' },
          { label: '長崎県', value: '長崎県' },
          { label: '熊本県', value: '熊本県' },
          { label: '大分県', value: '大分県' },
          { label: '宮崎県', value: '宮崎県' },
          { label: '鹿児島県', value: '鹿児島県' },
          { label: '沖縄県', value: '沖縄県' },
        ],
      },
      {
        label: '市区町村',
        handle: 'city',
        isEdit: true,
        inputType: 'text',
      },
      {
        label: '以降の住所',
        handle: 'address2',
        isEdit: true,
        inputType: 'text',
      },
      {
        label: '建物名など',
        handle: 'building',
        isEdit: true,
        inputType: 'text',
      },
    ],
  },
  {
    title: 'パスワード変更',
    titleOnEdit: 'パスワード変更',
    icon: <LockIcon />,
    handle: 'changePassword',
    properties: [
      {
        label: 'パスワード',
        handle: 'password',
        isEdit: true,
        inputType: 'password',
      },
    ],
  },
];

export const SettingsContent = () => {
  const { getAccountInfo } = useAppAuth();
  const { setAlertState } = useAlert();
  //現在選択されている設定
  //これが空文字列だったらどの項目も選択していないことになる
  const [currentSettingHandle, setCurrentSettingHandle] = useState('');
  //現在の設定項目
  const [currentInfo, setCurrentInfo] = useState<{ [key: string]: any }>({});
  //入力されている項目
  const [inputValues, setInputValues] = useState<{
    [key: string]: string | undefined;
  }>({});
  // 生年月日入力用 state
  const [birthdayFields, setBirthdayFields] = useState({
    year: '',
    month: '',
    day: '',
  });
  //モーダル
  const [settingModalInfo, setSettingModalInfo] = useState<{
    visible: boolean;
    ended: boolean;
  }>({
    visible: false,
    ended: false,
  });

  //現在の設定データを取得する
  const fetchCurrentInfo = async () => {
    const res = await getAccountInfo();
    if (res instanceof CustomError) throw res;

    const convertedRes: { [key: string]: string | undefined } = {};
    Object.entries(res).forEach(([key, value]) => {
      if (value == null) {
        convertedRes[key] = '';
      } else {
        convertedRes[key] = String(value);
      }
    });

    setCurrentInfo(convertedRes);
    //入力されている項目にも入れておく
    setInputValues(convertedRes);
  };

  //最初に一度現在の設定情報を取得する
  useEffect(() => {
    (async () => {
      await fetchCurrentInfo();
    })();
  }, []);

  // 生年月日を分解
  useEffect(() => {
    if (inputValues.birthday) {
      const [year, month, day] = inputValues.birthday.split('-');
      setBirthdayFields({ year, month, day });
    }
  }, [inputValues.birthday]);

  // 入力する
  const handleSettingInput = async (prop: string, value: string) => {
    const newVal = { ...inputValues };

    //郵便番号だった場合、郵便番号検索をする
    if (prop == 'zip_code') {
      // 入力された郵便番号のハイフンを除去
      const sanitizedZip = value.replace(/-/g, '');
      if (sanitizedZip.length === 7) {
        try {
          const getZipcodeRes = await fetch(
            `https://zipcloud.ibsnet.co.jp/api/search?zipcode=${sanitizedZip}`,
          );
          const addressJson = await getZipcodeRes.json();
          const result = addressJson.results?.[0];

          if (!result) {
            throw new Error();
          }

          newVal.prefecture = result.address1;
          newVal.city = result.address2;
          newVal.address2 = result.address3;
        } catch (e) {
          setAlertState({
            message: '該当する郵便番号が見つかりませんでした。',
            severity: 'error',
          });
        }
      }
      newVal[prop] = sanitizedZip;
    } else {
      newVal[prop] = value;
    }

    setInputValues({ ...newVal });
  };

  // 変更内容を送信
  const submit = async () => {
    //生年月日の形式が正しいか確認（年月日を使う）
    const { year, month, day } = birthdayFields;
    const formattedBirthday =
      year && month && day
        ? `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
        : undefined;

    // 不当な日付を検知する
    if (formattedBirthday) {
      const date = new Date(formattedBirthday);
      const currentYear = new Date().getFullYear();
      if (
        isNaN(date.getTime()) ||
        parseInt(year, 10) > currentYear ||
        date.getFullYear() !== parseInt(year, 10) ||
        date.getMonth() + 1 !== parseInt(month, 10) ||
        date.getDate() !== parseInt(day, 10)
      ) {
        setAlertState({
          message: '有効な日付を入力してください',
          severity: 'error',
        });
        return;
      }
    }

    // year && month && dayがnullだった場合にundefinedにする
    if (!formattedBirthday) {
      inputValues.birthday = undefined;
    } else {
      inputValues.birthday = formattedBirthday;
    }

    // 電話番号のバリデーション
    const phone = inputValues.phone_number?.replace(/\D/g, '');
    if (phone && !/^0\d{9,10}$/.test(phone)) {
      setAlertState({
        message: '正しい電話番号を入力してください',
        severity: 'error',
      });
      return;
    }

    try {
      await ecImplement().updateAppAccountInfo({
        displayName: inputValues.display_name?.replace(/\s+/g, ''),
        fullName: inputValues.full_name?.replace(/\s+/g, ''),
        mail: inputValues.mail,
        fullNameRuby: inputValues.full_name_ruby?.replace(/\s+/g, ''),
        birthday: inputValues.birthday,
        phoneNumber: inputValues.phone_number?.replace(/-/g, ''),
        gender: inputValues.gender,
        career: inputValues.career,
        zipCode: inputValues.zip_code?.replace(/-/g, ''),
        prefecture: inputValues.prefecture,
        city: inputValues.city?.replace(/\s+/g, ''),
        address2: inputValues.address2?.replace(/\s+/g, ''),
        building: inputValues.building?.replace(/\s+/g, ''),
        password: inputValues.password,
      });
      //情報を再取得する
      fetchCurrentInfo();
      //モーダル情報を変える
      setSettingModalInfo({
        visible: true,
        ended: true,
      });
    } catch (e: any) {
      setAlertState({
        message: `${e?.status}:${e?.message}`,
        severity: 'error',
      });
    }
  };

  const currentItem = settingMenuList.find(
    (e) => e.handle == currentSettingHandle,
  );

  return (
    <Box sx={uniqueStyles.settingListField}>
      {/* メイン */}
      {!currentSettingHandle ? (
        <List>
          {/* 設定リスト */}
          {settingMenuList.map((item) => (
            <ListItem
              key={item.handle}
              disablePadding
              sx={{ borderBottom: '1px solid #e0e0e0' }}
            >
              <ListItemButton
                onClick={() => setCurrentSettingHandle(item.handle)}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText
                  primary={item.title}
                  sx={{ fontSize: '18px!important' }}
                />
                <ArrowForwardIosIcon fontSize="small" sx={{ color: 'gray' }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      ) : (
        <>
          {/* 現在の設定表示フィールド */}
          {/* 設定タイトル・内容表示 */}
          <Box>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="center"
              gap={1}
              my={1}
              position="relative"
            >
              <IconButton
                onClick={() => setCurrentSettingHandle('')}
                sx={{ position: 'absolute', left: 0 }}
              >
                <ArrowBackIosNewIcon sx={{ color: 'primary.main' }} />
              </IconButton>
              <Typography fontSize="16px!important" fontWeight="bold">
                {currentItem ? currentItem.title : ''}
              </Typography>
            </Box>

            {currentSettingHandle !== 'changePassword' && (
              <Box mb={2} px={4}>
                <Typography gutterBottom>現在登録されている情報</Typography>
                {currentItem?.properties?.map((prop) => (
                  <Typography key={prop.handle} sx={{ fontWeight: 'bold' }}>
                    {prop.label}：{currentInfo[prop.handle] ?? '未設定'}
                  </Typography>
                ))}
              </Box>
            )}
            {/* 変更ボタン */}
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                fetchCurrentInfo();
                setSettingModalInfo({ visible: true, ended: false });
              }}
              sx={{ display: 'block', mx: 'auto', mt: 4, width: '60%' }}
            >
              変更
            </Button>
          </Box>

          {/* 設定モーダル */}
          <Dialog
            open={settingModalInfo.visible}
            onClose={() =>
              setSettingModalInfo({ visible: false, ended: false })
            }
            fullWidth
            maxWidth="sm"
          >
            <DialogTitle
              sx={{
                backgroundColor: 'primary.main',
                color: 'white',
                fontWeight: 'bold',
                fontSize: '15px!important',
                textAlign: 'center',
                py: 1,
              }}
            >
              {currentItem?.titleOnEdit || currentItem?.title}
              <IconButton
                aria-label="close"
                onClick={() =>
                  setSettingModalInfo({ visible: false, ended: false })
                }
                sx={{
                  color: 'white',
                  position: 'absolute',
                  right: 3,
                  top: 0,
                }}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers>
              {!settingModalInfo.ended ? (
                <Box display="flex" flexDirection="column" gap={2}>
                  {currentItem?.properties
                    .filter((prop) => prop.isEdit)
                    .map((prop) => (
                      <Box key={prop.handle}>
                        <Typography variant="body2" gutterBottom>
                          {prop.label}
                        </Typography>
                        {prop.handle === 'birthday' ? (
                          <Box display="flex" gap={1}>
                            <TextField
                              value={birthdayFields.year}
                              onChange={(e) =>
                                setBirthdayFields((prev) => ({
                                  ...prev,
                                  year: e.target.value,
                                }))
                              }
                              size="small"
                              placeholder="年"
                            />
                            <TextField
                              value={birthdayFields.month}
                              onChange={(e) =>
                                setBirthdayFields((prev) => ({
                                  ...prev,
                                  month: e.target.value,
                                }))
                              }
                              size="small"
                              placeholder="月"
                            />
                            <TextField
                              value={birthdayFields.day}
                              onChange={(e) =>
                                setBirthdayFields((prev) => ({
                                  ...prev,
                                  day: e.target.value,
                                }))
                              }
                              size="small"
                              placeholder="日"
                            />
                          </Box>
                        ) : prop.inputType === 'text' ||
                          prop.inputType === 'password' ? (
                          <TextField
                            fullWidth
                            type={
                              prop.inputType === 'password'
                                ? 'password'
                                : 'text'
                            }
                            value={inputValues[prop.handle]}
                            onChange={(e) =>
                              handleSettingInput(prop.handle, e.target.value)
                            }
                            variant="outlined"
                            size="small"
                          />
                        ) : prop.inputType === 'select' ? (
                          <FormControl fullWidth size="small">
                            <InputLabel>{prop.label}</InputLabel>
                            <Select
                              value={inputValues[prop.handle]}
                              onChange={(e) =>
                                handleSettingInput(prop.handle, e.target.value)
                              }
                              label={prop.label}
                            >
                              {(prop.options || []).map((opt) => (
                                <MenuItem key={opt.value} value={opt.value}>
                                  {opt.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        ) : null}
                      </Box>
                    ))}
                </Box>
              ) : (
                <Box textAlign="center">
                  <Image
                    src={endedCheck}
                    alt="変更完了"
                    width={100}
                    style={{ margin: '0 auto 1rem' }}
                  />
                  <Typography fontSize="16px!important" gutterBottom>
                    変更が完了しました
                  </Typography>
                </Box>
              )}
            </DialogContent>

            <DialogActions sx={{ justifyContent: 'center' }}>
              {!settingModalInfo.ended ? (
                <Button variant="contained" color="error" onClick={submit}>
                  送信
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={() =>
                    setSettingModalInfo({ visible: false, ended: false })
                  }
                >
                  閉じる
                </Button>
              )}
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
};
