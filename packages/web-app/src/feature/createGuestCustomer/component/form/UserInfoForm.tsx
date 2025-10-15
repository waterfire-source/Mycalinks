import React from 'react';
import {
  Box,
  Typography,
  InputBase,
  styled,
  MenuItem,
  Select,
  FormControl,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import { Controller, useWatch } from 'react-hook-form';
import PrimaryButton from '@/components/buttons/PrimaryButton';

const CustomInput = styled(InputBase)(({ theme }) => ({
  width: '100%',
  height: '50px',
  padding: '8px',
  border: '1px solid',
  borderColor: theme.palette.grey[500],
  borderRadius: '8px',
  fontSize: '14px',
}));

const CustomSelect = styled(Select)(({ theme }) => ({
  width: '100%',
  height: '50px',
  padding: '8px',
  borderRadius: '8px',
  fontSize: '14px',
}));

const CustomRadio = styled(Radio)(({ theme }) => ({
  color: theme.palette.primary.main,
}));

interface UserInfoFormProps {
  register: any;
  errors: any;
  control: any;
  age: number;
  onSubmit: () => void;
}

export const UserInfoForm: React.FC<UserInfoFormProps> = ({
  register,
  errors,
  control,
  age,
  onSubmit,
}) => {
  const prefectures = [
    '北海道',
    '青森県',
    '岩手県',
    '宮城県',
    '秋田県',
    '山形県',
    '福島県',
    '茨城県',
    '栃木県',
    '群馬県',
    '埼玉県',
    '千葉県',
    '東京都',
    '神奈川県',
    '新潟県',
    '富山県',
    '石川県',
    '福井県',
    '山梨県',
    '長野県',
    '岐阜県',
    '静岡県',
    '愛知県',
    '三重県',
    '滋賀県',
    '京都府',
    '大阪府',
    '兵庫県',
    '奈良県',
    '和歌山県',
    '鳥取県',
    '島根県',
    '岡山県',
    '広島県',
    '山口県',
    '徳島県',
    '香川県',
    '愛媛県',
    '高知県',
    '福岡県',
    '佐賀県',
    '長崎県',
    '熊本県',
    '大分県',
    '宮崎県',
    '鹿児島県',
    '沖縄県',
  ];

  // 4つの必須住所フィールドを監視（注意書きの表示制御に使用）
  const postalCode = useWatch({ control, name: 'postalCode' });
  const prefecture = useWatch({ control, name: 'prefecture' });
  const city = useWatch({ control, name: 'city' });
  const address = useWatch({ control, name: 'address' });
  const shouldShowAddressNote = !postalCode || !prefecture || !city || !address;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        gap: 2,
      }}
    >
      <Typography sx={{ fontSize: '14px' }}>※必須項目</Typography>

      <Box sx={{ width: '100%' }}>
        <Typography sx={{ fontSize: '14px' }}>お名前 ※</Typography>
        <CustomInput
          {...register('name')}
          placeholder="お名前を入力してください"
        />
        {errors.name && (
          <Typography color="primary.main" sx={{ fontSize: '14px' }}>
            {errors.name.message}
          </Typography>
        )}
      </Box>

      <Box sx={{ width: '100%' }}>
        <Typography sx={{ fontSize: '14px' }}>フリガナ ※</Typography>
        <CustomInput
          {...register('furigana')}
          placeholder="フリガナを入力してください"
        />
        {errors.furigana && (
          <Typography color="primary.main" sx={{ fontSize: '14px' }}>
            {errors.furigana.message}
          </Typography>
        )}
      </Box>

      <Box sx={{ width: '100%' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
          <Typography sx={{ fontSize: '14px' }}>生年月日 ※</Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <CustomInput
              {...register('birthdate')}
              placeholder="YYYYMMDD"
              sx={{ width: '80%' }}
            />
            <Typography
              sx={{
                fontSize: '14px',
                alignSelf: 'center',
                color: 'text.primary',
                bottom: 0,
              }}
            >
              {age >= 0 ? `(${age}歳)` : '(歳)'}
            </Typography>
          </Box>
          {errors.birthdate && (
            <Typography color="primary.main" sx={{ fontSize: '14px' }}>
              {errors.birthdate.message}
            </Typography>
          )}
        </Box>
      </Box>

      <Box
        sx={{ width: '100%', display: 'flex', flexDirection: 'row', gap: 2 }}
      >
        <Box sx={{ width: '30%' }}>
          <Typography sx={{ fontSize: '14px' }}>性別 ※</Typography>
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <FormControl component="fieldset">
                <RadioGroup {...field} row>
                  <FormControlLabel
                    value="男"
                    control={<CustomRadio />}
                    label="男"
                  />
                  <FormControlLabel
                    value="女"
                    control={<CustomRadio />}
                    label="女"
                  />
                </RadioGroup>
              </FormControl>
            )}
          />
          {errors.gender && (
            <Typography color="primary.main" sx={{ fontSize: '14px' }}>
              {errors.gender.message}
            </Typography>
          )}
        </Box>

        <Box sx={{ width: '70%' }}>
          <Typography sx={{ fontSize: '14px' }}>職業※</Typography>
          <Controller
            name="career"
            control={control}
            render={({ field }) => (
              <CustomSelect {...field} displayEmpty fullWidth>
                <MenuItem value="" disabled>
                  職業を選択してください
                </MenuItem>
                <MenuItem value="会社員">会社員</MenuItem>
                <MenuItem value="公務員">公務員</MenuItem>
                <MenuItem value="自営業">自営業</MenuItem>
                <MenuItem value="主婦">主婦・主夫</MenuItem>
                <MenuItem value="学生">学生</MenuItem>
                <MenuItem value="アルバイト・パート">
                  アルバイト・パート
                </MenuItem>
                <MenuItem value="無職">無職</MenuItem>
                <MenuItem value="その他">その他</MenuItem>
              </CustomSelect>
            )}
          />
          {errors.career && (
            <Typography color="primary.main" sx={{ fontSize: '14px' }}>
              {errors.career.message}
            </Typography>
          )}
        </Box>
      </Box>

      {shouldShowAddressNote && (
        <Typography color="primary.main" sx={{ fontSize: '14px' }}>
          提示する身分証明書と同じ住所を入力してください。
        </Typography>
      )}

      <Box sx={{ width: '100%' }}>
        <Typography sx={{ fontSize: '14px' }}>郵便番号 ※</Typography>
        <CustomInput {...register('postalCode')} placeholder="0000000" />
        {errors.postalCode && (
          <Typography color="primary.main" sx={{ fontSize: '14px' }}>
            {errors.postalCode.message}
          </Typography>
        )}
      </Box>

      <Box
        sx={{ width: '100%', display: 'flex', flexDirection: 'row', gap: 2 }}
      >
        <Box sx={{ width: '30%' }}>
          <Typography sx={{ fontSize: '14px' }}>都道府県 ※</Typography>
          <Controller
            name="prefecture"
            control={control}
            render={({ field }) => (
              <CustomSelect {...field} displayEmpty fullWidth>
                <MenuItem value="" disabled>
                  都道府県を選択してください
                </MenuItem>
                {prefectures.map((prefecture) => (
                  <MenuItem key={prefecture} value={prefecture}>
                    {prefecture}
                  </MenuItem>
                ))}
              </CustomSelect>
            )}
          />
          {errors.prefecture && (
            <Typography color="primary.main" sx={{ fontSize: '14px' }}>
              {errors.prefecture.message}
            </Typography>
          )}
        </Box>
        <Box sx={{ width: '70%' }}>
          <Typography sx={{ fontSize: '14px' }}>市区町村 ※</Typography>
          <CustomInput
            {...register('city')}
            placeholder="市区町村を入力してください"
          />
          {errors.city && (
            <Typography color="primary.main" sx={{ fontSize: '14px' }}>
              {errors.city.message}
            </Typography>
          )}
        </Box>
      </Box>

      <Box sx={{ width: '100%' }}>
        <Typography sx={{ fontSize: '14px' }}>以降の住所 ※</Typography>
        <CustomInput
          {...register('address')}
          placeholder="住所を入力してください"
        />
        {errors.address && (
          <Typography color="primary.main" sx={{ fontSize: '14px' }}>
            {errors.address.message}
          </Typography>
        )}
      </Box>

      <Box sx={{ width: '100%' }}>
        <Typography sx={{ fontSize: '14px' }}>建物名など</Typography>
        <CustomInput
          {...register('buildingName')}
          placeholder="建物名などを入力してください"
        />
      </Box>

      <Box sx={{ width: '100%' }}>
        <Typography sx={{ fontSize: '14px' }}>電話番号 ※</Typography>
        <CustomInput {...register('phoneNumber')} placeholder="00000000000" />
        {errors.phoneNumber && (
          <Typography color="primary.main" sx={{ fontSize: '14px' }}>
            {errors.phoneNumber.message}
          </Typography>
        )}
      </Box>

      <PrimaryButton
        onClick={onSubmit}
        sx={{
          alignSelf: 'center',
          paddingX: 4,
        }}
      >
        確認
      </PrimaryButton>
    </Box>
  );
};
