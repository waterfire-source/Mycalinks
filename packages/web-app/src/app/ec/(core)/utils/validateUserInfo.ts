import { MycaAppUser } from '@/types/BackendAPI';
import { signupSchema } from '@/app/ec/account/signup/page';
import { z } from 'zod';
import { editAccountSchema } from '@/app/ec/account/edit/page';
export type UserInfo = z.infer<typeof editAccountSchema>;
export type UserRegisterInfo = z.infer<typeof signupSchema>;

export const validateUserInfo = (
  user: MycaAppUser,
): {
  isValid: boolean;
  missingFields: string[];
  formData: Partial<UserInfo>;
} => {
  const formData: Partial<UserInfo> = {};

  const requiredFieldMappings: Record<
    keyof UserInfo,
    keyof MycaAppUser | null
  > = {
    displayName: 'display_name',
    fullName: 'full_name',
    fullNameRuby: 'full_name_ruby',
    birthday: 'birthday',
    phoneNumber: 'phone_number',
    mail: 'mail',
    zipCode: 'zip_code',
    prefecture: 'prefecture',
    city: 'city',
    address2: 'address2',
    building: 'building',
  };

  const missingFields: string[] = [];

  // 各フィールドをチェック
  Object.entries(requiredFieldMappings).forEach(([schemaField, userField]) => {
    if (userField === null) {
      // パスワード関連はAPIから取得できないので常に不足しているとみなす
      missingFields.push(schemaField);
      return;
    }

    const value = user[userField as keyof MycaAppUser];

    // 必須フィールドで値が存在しない場合
    if (
      schemaField !== 'building' &&
      (value === undefined || value === null || value === '')
    ) {
      missingFields.push(schemaField);
    }

    // 値が存在する場合はformDataに追加
    if (value !== undefined && value !== null) {
      switch (schemaField) {
        case 'displayName':
          formData.displayName = user.display_name || '';
          break;
        case 'fullName':
          formData.fullName = user.full_name || '';
          break;
        case 'fullNameRuby':
          formData.fullNameRuby = user.full_name_ruby || '';
          break;
        case 'birthday':
          formData.birthday = user.birthday || '';
          break;
        case 'phoneNumber':
          formData.phoneNumber = user.phone_number?.replace(/-/g, '') || '';
          break;
        case 'mail':
          formData.mail = user.mail || '';
          break;
        case 'zipCode':
          formData.zipCode = user.zip_code?.replace(/-/g, '') || '';
          break;
        case 'prefecture':
          formData.prefecture = user.prefecture || '';
          break;
        case 'city':
          formData.city = user.city || '';
          break;
        case 'address2':
          formData.address2 = user.address2 || '';
          break;
        case 'building':
          formData.building = user.building || '';
          break;
      }
    }
  });

  return {
    isValid: missingFields.length === 0,
    missingFields,
    formData,
  };
};
